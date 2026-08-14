"use client";

import Link from "next/link";

type Props = {
  id: number;
  name: string;
  uploadedAt: string;
  onDelete: () => void;
};

export default function PDFCard({
  id,
  name,
  uploadedAt,
  onDelete,
}: Props) {
  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?\n\nThis will remove the PDF from your Atlas AI library.`
    );

    if (!confirmed) {
      return;
    }

    onDelete();
  };

  return (
    <div className="group flex items-center justify-between gap-6 p-5 rounded-2xl border border-slate-700 bg-slate-800/80 hover:border-slate-600 hover:bg-slate-800 transition-all">

      {/* PDF information */}

      <div className="flex items-center gap-4 min-w-0">

        <div className="w-12 h-12 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">
          📄
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white truncate">
            {name}
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Uploaded: {uploadedAt}
          </p>
        </div>

      </div>

      {/* Actions */}

      <div className="flex items-center gap-3 shrink-0">

        <Link
          href={`/dashboard/pdf/${id}`}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition"
        >
          Open
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 rounded-xl bg-red-600/90 text-white font-medium hover:bg-red-500 transition"
        >
          Delete
        </button>

      </div>

    </div>
  );
}