import Link from "next/link";

type PDFCardProps = {
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
}: PDFCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center hover:border-yellow-400 transition">

      <div>

        <h2 className="font-bold text-lg">
          📄 {name}
        </h2>

        <p className="text-slate-400 text-sm mt-2">
          Uploaded: {uploadedAt}
        </p>

      </div>

      <div className="flex gap-3">

        <Link
          href={`/dashboard/pdf/${id}`}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
        >
          Open
        </Link>

        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Delete
        </button>

      </div>

    </div>
  );
}