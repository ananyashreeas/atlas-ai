"use client";

type ChatHeaderProps = {
  onNewChat?: () => void;
};

export default function ChatHeader({
  onNewChat,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700 pb-5">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Atlas AI Chat
        </h1>

        <p className="text-slate-400 mt-2">
          Your personal AI study assistant.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="px-5 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
      >
        + New Chat
      </button>
    </div>
  );
}