"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
        className={`rounded-2xl px-6 py-4 max-w-3xl ${
          isUser
            ? "bg-yellow-400 text-black"
            : "bg-slate-800 text-white"
        }`}
      >
        {!isUser && (
          <p className="font-semibold mb-3">
            🤖 Atlas AI
          </p>
        )}

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {message}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}