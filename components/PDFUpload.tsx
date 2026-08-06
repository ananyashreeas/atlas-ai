"use client";

import { useState } from "react";

type PDFUploadProps = {
  onUpload: (file: File) => Promise<void>;
};

export default function PDFUpload({
  onUpload,
}: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      await onUpload(file);
    } catch (error) {
      console.error(error);
      alert("Failed to upload PDF.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <label
      className="
      flex
      justify-center
      items-center
      h-56
      border-2
      border-dashed
      border-slate-700
      rounded-2xl
      cursor-pointer
      hover:border-yellow-400
      hover:bg-slate-900
      transition-all
      "
    >
      <div className="text-center">

        <p className="text-6xl">
          {uploading ? "⏳" : "📄"}
        </p>

        <h2 className="mt-5 text-2xl font-bold">

          {uploading
            ? "Uploading..."
            : "Upload Study Material"}

        </h2>

        <p className="text-slate-400 mt-3">

          {uploading
            ? "Please wait..."
            : "Click here to upload your PDF"}

        </p>

      </div>

      <input
        type="file"
        accept=".pdf"
        hidden
        disabled={uploading}
        onChange={handleChange}
      />
    </label>
  );
}