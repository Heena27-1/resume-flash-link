
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResumePreview from '@/components/ResumePreview';
import ShareLink from '@/components/ShareLink';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    
    // Generate a unique identifier for the file
    const timestamp = new Date().getTime();
    const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
    
    // In a real application, this would be a proper URL from your backend
    // For now, we'll use a dummy URL with the timestamp to make it unique
    setPreviewUrl(`https://resume.example.com/${timestamp}-${fileName}`);
    
    toast({
      title: "Resume uploaded!",
      description: "Your resume is ready to share.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Resume Flash Link</h1>
          <p className="text-lg text-gray-600">
            Upload your resume and get an instant shareable link
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {!uploadedFile ? (
            <FileUpload onFileSelect={handleFileSelect} />
          ) : (
            <>
              <ResumePreview file={uploadedFile} />
              
              <div className="w-full max-w-2xl">
                <h3 className="text-lg font-medium mb-2 text-center">Share your resume</h3>
                <ShareLink link={previewUrl} />
              </div>
              
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setPreviewUrl("");
                }}
                className="text-sm text-primary hover:underline"
              >
                Upload a different resume
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
