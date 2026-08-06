"use client";

import { useEffect, useState } from "react";

import PDFUpload from "@/components/PDFUpload";
import PDFCard from "@/components/PDFCard";

import { supabase } from "@/app/lib/supabase";
import { getPDFs, savePDFs, PDFItem } from "@/app/lib/storage";

export default function PDFPage() {
  const [files, setFiles] = useState<PDFItem[]>([]);

  useEffect(() => {
    setFiles(getPDFs());
  }, []);

  const handleUpload = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("pdfs")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return;
    }

    const newFile: PDFItem = {
      id: Date.now(),
      name: file.name,
      uploadedAt: new Date().toLocaleString(),
    };

    const updated = [...files, newFile];

    setFiles(updated);

    savePDFs(updated);

    alert("PDF uploaded successfully!");
  };

  const deleteFile = (id: number) => {
    const updated = files.filter((file) => file.id !== id);

    setFiles(updated);

    savePDFs(updated);
  };

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold">
          📄 PDF Workspace
        </h1>

        <p className="text-slate-400 mt-2">
          Upload your study material and let Atlas AI help you learn smarter.
        </p>

      </div>

      <PDFUpload onUpload={handleUpload} />

      <div className="space-y-4">

        {files.length === 0 && (
          <div className="text-slate-500 text-center py-12 border border-dashed border-slate-700 rounded-2xl">
            No PDFs uploaded yet.
          </div>
        )}

        {files.map((file) => (
          <PDFCard
            key={file.id}
            id={file.id}
            name={file.name}
            uploadedAt={file.uploadedAt}
            onDelete={() => deleteFile(file.id)}
          />
        ))}

      </div>

    </div>
  );
}