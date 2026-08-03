"use client";

import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() === "") return;

    onSend(message);
    setMessage("");
  };

  return (
    <div className="border-t border-slate-800 pt-6">
      <div className="flex gap-4">

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Atlas AI anything..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <button
          onClick={handleSend}
          className="bg-yellow-400 text-black font-semibold px-8 rounded-xl hover:bg-yellow-300 transition"
        >
          Send
        </button>

      </div>
    </div>
  );
}