import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";
import { supabase, Resume } from "@/lib/supabase";
import ResumePreview from '@/components/ResumePreview';

const ShareResume: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (token) {
      fetchResume();
    }
  }, [token]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      
      // Fetch resume metadata
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('share_token', token)
        .eq('is_public', true)
        .single();

      if (resumeError) {
        setError("Resume not found or no longer available");
        return;
      }

      setResume(resumeData);

      // Download the file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('resumes')
        .download(resumeData.file_path);

      if (downloadError) {
        setError("Unable to load resume file");
        return;
      }

      const resumeFile = new File([fileData], resumeData.file_name, { 
        type: resumeData.mime_type 
      });
      setFile(resumeFile);

    } catch (err: any) {
      setError("An error occurred while loading the resume");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!file || !resume) return;
    
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = resume.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNew = () => {
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    // Note: We don't revoke the URL immediately since it's being used in a new tab
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume || !file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Resume Not Found</CardTitle>
            <CardDescription>
              {error || "The resume you're looking for doesn't exist or is no longer available."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              {resume.title}
            </CardTitle>
            <CardDescription>
              Shared resume • Uploaded {new Date(resume.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download Resume
              </Button>
              <Button onClick={handleOpenInNew} variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resume Preview */}
        <Card>
          <CardContent className="p-6">
            <ResumePreview file={file} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by Resume Flash Link</p>
        </div>
      </div>
    </div>
  );
};

export default ShareResume;