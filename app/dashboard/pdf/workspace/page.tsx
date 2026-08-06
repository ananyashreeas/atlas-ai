export default function PDFWorkspace() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          📄 Engineering Mathematics.pdf
        </h1>

        <p className="text-slate-400 mt-2">
          AI Workspace for your uploaded document.
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

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold">
            📋 Summary
          </h2>

          <p className="mt-4 text-slate-400">
            AI summary will appear here.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold">
            🧠 Flashcards
          </h2>

          <p className="mt-4 text-slate-400">
            AI flashcards will appear here.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold">
            ❓ Quiz Generator
          </h2>

          <button className="mt-4 bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold">
            Generate Quiz
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold">
            🗺️ Mind Map
          </h2>

          <p className="mt-4 text-slate-400">
            AI mind map will appear here.
          </p>
        </div>

      </div>

    </div>
  );
}