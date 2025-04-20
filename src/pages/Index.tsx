
import React, { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import ResumePreview from '@/components/ResumePreview';
import ShareLink from '@/components/ShareLink';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup URLs when component unmounts to prevent memory leaks
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    // Revoke previous URL if it exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setUploadedFile(file);
    
    // Create a blob URL for the file which can be opened directly
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
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
                <p className="text-center text-sm text-gray-500 mt-2">
                  Click the link to open the resume directly
                </p>
              </div>
              
              <button
                onClick={() => {
                  // Clean up old URL
                  if (previewUrl && previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(previewUrl);
                  }
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
