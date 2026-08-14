"use client";

import { extractPDFText } from "@/app/lib/pdfExtractor";
import { useEffect, useMemo, useState } from "react";
import { chunkText } from "@/app/lib/chunker";

import PDFUpload from "@/components/PDFUpload";
import PDFCard from "@/components/PDFCard";

import { createClient } from "@/app/lib/supabase-browser";

export type PDFItem = {
  id: number;
  name: string;
  uploadedAt: string;
  path: string;
};

export default function PDFPage() {
  const supabase = createClient();

  const [files, setFiles] = useState<PDFItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // -----------------------------------------
  // Load PDFs for logged-in user
  // -----------------------------------------

  useEffect(() => {
    const loadPDFs = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Failed to get Supabase session:",
            sessionError
          );

          setLoading(false);
          return;
        }

        if (!session?.user) {
          console.error(
            "No active Supabase session."
          );

          setLoading(false);
          return;
        }

        const user = session.user;

        console.log(
          "Loading PDFs for user:",
          user.id
        );

        const {
          data,
          error: pdfError,
        } = await supabase
          .from("pdfs")
          .select(
            "id, name, storage_path, uploaded_at"
          )
          .eq("user_id", user.id)
          .order("uploaded_at", {
            ascending: false,
          });

        if (pdfError) {
          console.error(
            "Failed to load PDFs:",
            pdfError
          );

          return;
        }

        const formattedFiles: PDFItem[] =
          (data || []).map((pdf) => ({
            id: Number(pdf.id),
            name: pdf.name,
            uploadedAt: new Date(
              pdf.uploaded_at
            ).toLocaleString(),
            path: pdf.storage_path,
          }));

        setFiles(formattedFiles);
      } catch (error) {
        console.error(
          "Failed to load PDFs:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPDFs();
  }, []);

  // -----------------------------------------
  // Search PDFs
  // -----------------------------------------

  const filteredFiles = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return files;
    }

    return files.filter((file) =>
      file.name.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);

  // -----------------------------------------
  // Upload PDF
  // -----------------------------------------

  const handleUpload = async (file: File) => {
    try {
      console.log(
        "========== STARTING PDF UPLOAD =========="
      );

      // 1. Get logged-in user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Session error:",
          sessionError
        );

        alert(
          "Could not verify your login session."
        );

        return;
      }

      if (!session?.user) {
        alert(
          "You must be logged in to upload a PDF."
        );

        return;
      }

      const user = session.user;

      console.log(
        "Logged-in user:",
        user.id
      );

      // -----------------------------------------
      // 2. Extract PDF text
      // -----------------------------------------

      const extractedText =
        await extractPDFText(file);

      console.log(
        "========== PDF TEXT =========="
      );

      console.log(extractedText);

      console.log(
        "========== END PDF TEXT =========="
      );

      // -----------------------------------------
      // 3. Split text into chunks
      // -----------------------------------------

      const chunks =
        await chunkText(extractedText);

      console.log(
        "========== PDF CHUNKS =========="
      );

      console.log(
        "Total chunks:",
        chunks.length
      );

      chunks.forEach((chunk, index) => {
        console.log(
          `\n--- CHUNK ${index + 1} ---`
        );

        console.log(chunk);
      });

      console.log(
        "========== END PDF CHUNKS =========="
      );

      // -----------------------------------------
      // 4. Upload original PDF to Supabase Storage
      // -----------------------------------------

      const fileName =
        `${Date.now()}-${file.name}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("pdfs")
        .upload(
          fileName,
          file
        );

      if (uploadError) {
        console.error(
          "Storage upload error:",
          uploadError
        );

        alert(uploadError.message);

        return;
      }

      console.log(
        "PDF uploaded to Supabase:",
        fileName
      );

      // -----------------------------------------
      // 5. Get public URL
      // -----------------------------------------

      const { data: publicURLData } =
        supabase.storage
          .from("pdfs")
          .getPublicUrl(fileName);

      console.log(
        "Public URL:",
        publicURLData.publicUrl
      );

      // -----------------------------------------
      // 6. Generate embeddings
      // -----------------------------------------

      console.log(
        "Sending chunks to embedding API..."
      );

      const embeddingResponse =
        await fetch("/api/embed", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            chunks,
            pdfPath: fileName,
          }),
        });

      const embeddingResult =
        await embeddingResponse.json();

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

      console.log(
        "========== EMBEDDINGS COMPLETE =========="
      );

      console.log(
        "Chunks saved:",
        embeddingResult.chunksSaved
      );

      console.log(
        "========================================="
      );

      // -----------------------------------------
      // 7. Save PDF metadata in Supabase
      // -----------------------------------------

      const {
        data: savedPDF,
        error: databaseError,
      } = await supabase
        .from("pdfs")
        .insert({
          name: file.name,
          storage_path: fileName,
          user_id: user.id,
        })
        .select(
          "id, name, storage_path, uploaded_at"
        )
        .single();

      if (databaseError) {
        console.error(
          "Failed to save PDF metadata:",
          databaseError
        );

        alert(
          "PDF uploaded, but failed to save PDF information."
        );

        return;
      }

      console.log(
        "PDF saved in database:",
        savedPDF
      );

      // -----------------------------------------
      // 8. Add PDF to UI
      // -----------------------------------------

      const newFile: PDFItem = {
        id: Number(savedPDF.id),

        name: savedPDF.name,

        uploadedAt: new Date(
          savedPDF.uploaded_at
        ).toLocaleString(),

        path: savedPDF.storage_path,
      };

      setFiles((currentFiles) => [
        newFile,
        ...currentFiles,
      ]);

      alert(
        `PDF uploaded successfully! ${embeddingResult.chunksSaved} embeddings saved.`
      );
    } catch (error) {
      console.error(
        "PDF upload failed:",
        error
      );

      alert(
        "Something went wrong while processing the PDF."
      );
    }
  };

  // -----------------------------------------
  // Delete PDF
  // -----------------------------------------

  const deleteFile = async (id: number) => {
    try {
      const file = files.find(
        (item) => item.id === id
      );

      if (!file) {
        return;
      }

      // -----------------------------------------
      // 1. Delete database record
      // -----------------------------------------

      const {
        error: databaseError,
      } = await supabase
        .from("pdfs")
        .delete()
        .eq("id", id);

      if (databaseError) {
        console.error(
          "Failed to delete PDF:",
          databaseError
        );

        alert(
          "Failed to delete PDF."
        );

        return;
      }

      // -----------------------------------------
      // 2. Delete actual Storage file
      // -----------------------------------------

      const {
        error: storageError,
      } = await supabase.storage
        .from("pdfs")
        .remove([
          file.path,
        ]);

      if (storageError) {
        console.warn(
          "Storage file could not be deleted:",
          storageError
        );
      }

      // -----------------------------------------
      // 3. Remove from UI
      // -----------------------------------------

      setFiles((currentFiles) =>
        currentFiles.filter(
          (item) =>
            item.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete PDF failed:",
        error
      );

      alert(
        "Something went wrong while deleting the PDF."
      );
    }
  };

  // -----------------------------------------
  // Loading state
  // -----------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400">
          Loading your PDFs...
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

          <div>
            <h1 className="text-4xl font-bold">
              📄 PDF Workspace
            </h1>

            <p className="text-slate-400 mt-2">
              Upload your study material and let
              Atlas AI help you learn smarter.
            </p>
          </div>

          {/* PDF Count */}

          <div className="shrink-0 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Your Library
            </p>

            <p className="text-2xl font-bold text-yellow-400">
              {files.length}
              <span className="text-sm font-medium text-slate-400 ml-2">
                {files.length === 1
                  ? "PDF"
                  : "PDFs"}
              </span>
            </p>
          </div>

        </div>
      </div>

      {/* Upload */}

      <PDFUpload
        onUpload={handleUpload}
      />

      {/* Library */}

      <div className="space-y-5">

        {/* Library Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h2 className="text-2xl font-bold">
              📚 Your Study Library
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              {searchQuery.trim()
                ? `${filteredFiles.length} ${
                    filteredFiles.length === 1
                      ? "PDF"
                      : "PDFs"
                  } found`
                : `${files.length} ${
                    files.length === 1
                      ? "PDF"
                      : "PDFs"
                  } available`}
            </p>
          </div>

          {/* Search */}

          <div className="relative w-full md:w-80">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              🔍
            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search your PDFs..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-10 py-3 text-white placeholder:text-slate-500 outline-none focus:border-yellow-400 transition"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                ✕
              </button>
            )}

          </div>

        </div>

        {/* PDF List */}

        <div className="space-y-4">

          {files.length === 0 && (
            <div className="text-slate-500 text-center py-12 border border-dashed border-slate-700 rounded-2xl">
              <p className="text-4xl mb-3">
                📚
              </p>

              <p className="text-lg">
                No PDFs uploaded yet.
              </p>

              <p className="text-sm mt-2 text-slate-600">
                Upload your first study material above.
              </p>
            </div>
          )}

          {files.length > 0 &&
            filteredFiles.length === 0 && (
              <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl">
                <p className="text-4xl mb-3">
                  🔍
                </p>

                <p className="text-lg text-slate-400">
                  No PDFs found.
                </p>

                <p className="text-sm mt-2 text-slate-600">
                  Try searching with a different name.
                </p>
              </div>
            )}

          {filteredFiles.map((file) => (
            <PDFCard
              key={file.id}
              id={file.id}
              name={file.name}
              uploadedAt={file.uploadedAt}
              onDelete={() =>
                deleteFile(file.id)
              }
            />
          ))}

        </div>

      </div>

    </div>
  );
}