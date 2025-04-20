
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResumePreview from '@/components/ResumePreview';
import ShareLink from '@/components/ShareLink';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    // In a real application, this would be a proper URL from your backend
    // For now, we'll use a dummy URL
    setPreviewUrl(`https://resume.example.com/${file.name}`);
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
              <ShareLink link={previewUrl} />
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
