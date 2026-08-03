type NotesHeaderProps = {
  onAddNote: () => void;
};

export default function NotesHeader({
  onAddNote,
}: NotesHeaderProps) {
  return (
    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-4xl font-bold">
          📝 My Notes
        </h1>

        <p className="text-slate-400 mt-2">
          Organize your study material.
        </p>
      </div>

      <button
        onClick={onAddNote}
        className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
      >
        + New Note
      </button>

    </div>
  );
}