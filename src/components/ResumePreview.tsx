
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ResumePreviewProps {
  file: File;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ file }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
      <Document file={file} className="flex justify-center">
        <Page pageNumber={1} width={550} />
      </Document>
    </div>
  );
};

export default ResumePreview;
