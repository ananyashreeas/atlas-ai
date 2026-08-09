"use client";

import { extractPDFText } from "@/app/lib/pdfExtractor";
import { useEffect, useState } from "react";
import { chunkText } from "@/app/lib/chunker";

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
    try {
      console.log("========== STARTING PDF UPLOAD ==========");

      // 1. Extract text from PDF
      const extractedText = await extractPDFText(file);

      console.log("========== PDF TEXT ==========");
      console.log(extractedText);
      console.log("========== END PDF TEXT ==========");

      // 2. Split extracted text into chunks
      const chunks = await chunkText(extractedText);

      console.log("========== PDF CHUNKS ==========");
      console.log("Total chunks:", chunks.length);

      chunks.forEach((chunk, index) => {
        console.log(`\n--- CHUNK ${index + 1} ---`);
        console.log(chunk);
      });

      console.log("========== END PDF CHUNKS ==========");

      // 3. Upload original PDF to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        alert(uploadError.message);
        return;
      }

      console.log("PDF uploaded to Supabase:", fileName);

      // 4. Get public URL
      const { data } = supabase.storage
        .from("pdfs")
        .getPublicUrl(fileName);

      console.log("Public URL:", data.publicUrl);

      // 5. Send chunks to embedding API
      console.log("Sending chunks to embedding API...");

      const embeddingResponse = await fetch("/api/embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chunks,
          pdfPath: fileName,
        }),
      });

      const embeddingResult = await embeddingResponse.json();

      if (!embeddingResponse.ok) {
        console.error(
          "Embedding API error:",
          embeddingResult
        );

        alert(
          embeddingResult.error ||
            "Failed to generate embeddings."
        );

        return;
      }

      // 6. Embeddings successfully saved
      console.log("========== EMBEDDINGS COMPLETE ==========");
      console.log(
        "Chunks saved:",
        embeddingResult.chunksSaved
      );
      console.log("=========================================");

      // 7. Save PDF metadata
      const newFile: PDFItem = {
        id: Date.now(),
        name: file.name,
        uploadedAt: new Date().toLocaleString(),
        path: fileName,
      };

      console.log("Saving PDF:", newFile);

      const updated = [...files, newFile];

      setFiles(updated);
      savePDFs(updated);

      alert(
        `PDF uploaded successfully! ${embeddingResult.chunksSaved} embeddings saved.`
      );
    } catch (error) {
      console.error("PDF upload failed:", error);

      alert(
        "Something went wrong while processing the PDF."
      );
    }
  };

  const deleteFile = (id: number) => {
    const updated = files.filter(
      (file) => file.id !== id
    );

    setFiles(updated);
    savePDFs(updated);
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">
          📄 PDF Workspace
        </h1>

        <p className="text-slate-400 mt-2">
          Upload your study material and let Atlas AI
          help you learn smarter.
        </p>
      </div>

      {/* Upload */}
      <PDFUpload onUpload={handleUpload} />

      {/* PDF List */}
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