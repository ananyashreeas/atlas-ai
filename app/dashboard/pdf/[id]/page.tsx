"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { getPDFs } from "@/app/lib/storage";

export default function PDFWorkspace() {
  const params = useParams();

  const id = Number(params.id);

  const pdf = useMemo(() => {
    return getPDFs().find((item) => item.id === id);
  }, [id]);

  if (!pdf) {
    return (
      <div className="flex items-center justify-center h-[70vh]">

        <div className="text-center">

          <h1 className="text-3xl font-bold">
            PDF Not Found
          </h1>

          <p className="text-slate-400 mt-3">
            The requested document doesn't exist.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold">
          📄 {pdf.name}
        </h1>

        <p className="text-slate-400 mt-2">
          Uploaded on {pdf.uploadedAt}
        </p>

      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

        <h2 className="text-2xl font-bold">
          🤖 Ask Atlas
        </h2>

        <input
          type="text"
          placeholder="Ask anything about this PDF..."
          className="mt-6 w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <button className="mt-4 bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition">
          Ask AI
        </button>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold">📋 Summary</h2>
          <p className="mt-4 text-slate-400">
            AI summary will appear here.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold">🧠 Flashcards</h2>
          <p className="mt-4 text-slate-400">
            Flashcards will appear here.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold">❓ Quiz Generator</h2>

          <button className="mt-4 bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition">
            Generate Quiz
          </button>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold">🗺️ Mind Map</h2>

          <p className="mt-4 text-slate-400">
            Mind map will appear here.
          </p>

        </div>

      </div>

    </div>
  );
}