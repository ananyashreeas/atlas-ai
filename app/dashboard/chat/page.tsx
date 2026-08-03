"use client";

import { useState } from "react";

import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

type Message = {
  sender: "user" | "ai";
  message: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      message:
        "Hello Ananya! 👋 I'm Atlas AI. Ask me anything about your studies.",
    },
  ]);

  const handleSend = (message: string) => {
    // Add user's message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message,
      },
    ]);

    // Fake AI reply after 1 second
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          message:
            "That's a great question! 🤖\n\nFor now I'm running in demo mode.\nSoon I'll answer using Google's Gemini AI.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[88vh]">

      <ChatHeader />

      <div className="flex-1 overflow-y-auto py-8 space-y-6">

        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            sender={msg.sender}
            message={msg.message}
          />
        ))}

      </div>

      <ChatInput onSend={handleSend} />

    </div>
  );
}