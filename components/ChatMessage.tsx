type ChatMessageProps = {
  sender: "user" | "ai";
  message: string;
};

export default function ChatMessage({
  sender,
  message,
}: ChatMessageProps) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`rounded-2xl px-6 py-4 max-w-2xl ${
          isUser
            ? "bg-yellow-400 text-black"
            : "bg-slate-800 text-white"
        }`}
      >
        {!isUser && (
          <p className="font-semibold mb-2">
            🤖 Atlas AI
          </p>
        )}

        <p>{message}</p>
      </div>
    </div>
  );
}