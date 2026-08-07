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
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800">
      <div>
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-slate-400">
          Uploaded: {uploadedAt}
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/dashboard/pdf/${id}`}
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Open
        </Link>

        <button
          onClick={onDelete}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}