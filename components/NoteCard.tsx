type NoteCardProps = {
  title: string;
  content: string;
  onDelete: () => void;
};

export default function NoteCard({
  title,
  content,
  onDelete,
}: NoteCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex justify-between items-center">

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300"
        >
          Delete
        </button>

      </div>

      <p className="text-slate-400 mt-4">
        {content}
      </p>

    </div>
  );
}