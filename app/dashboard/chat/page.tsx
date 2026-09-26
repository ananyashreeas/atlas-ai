"use client";

import { useState, useEffect, useRef } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

type Message = {
  sender: "user" | "ai";
  message: string;
};

const welcomeMessage: Message = {
  sender: "ai",
  message: "Hello! 👋 I'm Atlas AI. Ask me anything about your studies.",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle New / Clear Chat
  const handleNewChat = () => {
    if (loading) return;
    setChatId(null);
    setMessages([welcomeMessage]);
  };

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage = messageText.trim();

    // Show user message immediately
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message: userMessage,
      },
    ]);

    setLoading(true);

    try {
      // Backend handles thread management and message persistence
      const response = await fetch("/api/chat/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: chatId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Atlas could not generate a response.");
      }

      // Sync active chat session ID
      if (data.chatId && !chatId) {
        setChatId(data.chatId);
      }

      // Show AI response
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          message: data.answer,
        },
      ]);
    } catch (error: any) {
      console.error("ATLAS CHAT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          message: error?.message || "Sorry, I couldn't process that message.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[88vh]">
      <ChatHeader onNewChat={handleNewChat} />

      <div className="flex-1 overflow-y-auto py-8 space-y-6 px-4">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            sender={msg.sender}
            message={msg.message}
          />
        ))}

        {loading && (
          <ChatMessage
            sender="ai"
            message="Atlas is thinking..."
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}