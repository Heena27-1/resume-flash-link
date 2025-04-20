
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ResumePreviewProps {
  file: File;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error): void {
    console.error('Error loading PDF:', err);
    setError('Failed to load PDF. Please try uploading again.');
    setLoading(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading PDF...</span>
        </div>
      )}
      
      {error && (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      )}
      
      <Document 
        file={file} 
        className="flex justify-center"
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <Page 
          pageNumber={pageNumber} 
          width={550} 
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
      
      {numPages && numPages > 1 && !loading && !error && (
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm">
            Page {pageNumber} of {numPages}
          </p>
          <button 
            onClick={() => setPageNumber(Math.min(pageNumber + 1, numPages))}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
