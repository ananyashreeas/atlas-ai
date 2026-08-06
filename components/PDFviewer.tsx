"use client";

import { Document, Page, pdfjs } from "react-pdf";

import { useState } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type Props = {
  file: string;
};

export default function PDFViewer({ file }: Props) {
  const [pages, setPages] = useState(0);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setPages(numPages)}
      >
        {Array.from(new Array(pages), (_, index) => (
          <Page
            key={index}
            pageNumber={index + 1}
            width={750}
          />
        ))}
      </Document>

    </div>
  );
}