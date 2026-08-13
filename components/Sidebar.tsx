"use client";

import { createClient } from "@/app/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  return (
    <aside className="w-72 min-h-screen bg-slate-900 border-r border-slate-800 p-8 flex flex-col">

      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Atlas AI
      </h1>

      <p className="text-gray-400 mt-2">
        Never Study Alone Again.
      </p>

      <nav className="flex flex-col gap-4 mt-12">

        <Link href="/dashboard">
          🏠 Dashboard
        </Link>

        <Link href="/dashboard/notes">
          📄 My Notes
        </Link>

        <Link href="/dashboard/chat">
          💬 AI Chat
        </Link>

        <Link href="/dashboard/planner">
          📅 Study Planner
        </Link>

        <Link href="/dashboard/pdf">
          📄 PDF Workspace
        </Link>

        <Link href="/dashboard/analytics">
          📊 Analytics
        </Link>

        <Link href="/dashboard/settings">
          ⚙️ Settings
        </Link>

      </nav>

      <div className="mt-auto pt-8">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}