import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Upload, FileText, Share2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase, Resume } from "@/lib/supabase";
import FileUpload from '@/components/FileUpload';
import ResumePreview from '@/components/ResumePreview';
import ShareLink from '@/components/ShareLink';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchResumes();
  }, [user]);

  const fetchResumes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading resumes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Generate share token
      const shareToken = crypto.randomUUID();

      // Save resume metadata to database
      const { data, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ""),
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          share_token: shareToken,
          is_public: true
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadedFile(file);
      setSelectedResume(data);
      setShowUpload(false);
      await fetchResumes();

      toast({
        title: "Resume uploaded successfully!",
        description: "Your resume is ready to share.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const resume = resumes.find(r => r.id === resumeId);
      if (!resume) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([resume.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (dbError) throw dbError;

      await fetchResumes();
      if (selectedResume?.id === resumeId) {
        setSelectedResume(null);
        setUploadedFile(null);
      }

      toast({
        title: "Resume deleted",
        description: "Resume has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getShareableLink = (resume: Resume) => {
    return `${window.location.origin}/share/${resume.share_token}`;
  };

  const handleResumeSelect = async (resume: Resume) => {
    try {
      const { data } = await supabase.storage
        .from('resumes')
        .download(resume.file_path);
      
      if (data) {
        const file = new File([data], resume.file_name, { type: resume.mime_type });
        setUploadedFile(file);
        setSelectedResume(resume);
      }
    } catch (error: any) {
      toast({
        title: "Error loading resume",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading && !resumes.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Flash Link</h1>
            <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
          </div>
          <Button variant="ghost" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Resume List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  My Resumes
                </CardTitle>
                <CardDescription>
                  Manage your uploaded resumes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowUpload(true)} 
                  className="w-full gap-2"
                  variant={showUpload ? "secondary" : "default"}
                >
                  <Upload className="w-4 h-4" />
                  Upload New Resume
                </Button>
                
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleResumeSelect(resume)}
                        className="text-left w-full"
                      >
                        <p className="font-medium text-sm truncate">{resume.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResume(resume.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {resumes.length === 0 && !showUpload && (
                  <p className="text-center text-gray-500 py-4">
                    No resumes uploaded yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {showUpload ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Resume</CardTitle>
                    <CardDescription>
                      Upload a new resume to share with others
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload onFileSelect={handleFileSelect} />
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowUpload(false)}
                      className="mt-4"
                    >
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : selectedResume && uploadedFile ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {selectedResume.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResumePreview file={uploadedFile} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Share Resume
                    </CardTitle>
                    <CardDescription>
                      Copy this link to share your resume with others
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ShareLink link={getShareableLink(selectedResume)} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a resume to view
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Choose a resume from the sidebar or upload a new one
                  </p>
                  <Button onClick={() => setShowUpload(true)} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Your First Resume
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;