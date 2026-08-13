"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/app/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (error) {
          throw error;
        }

        setMessage(
          "Account created! Check your email if confirmation is required."
        );

        setMode("login");
        return;
      }

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("AUTH ERROR:", error);

      setMessage(
        error?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            🧠 Atlas AI
          </h1>

          <p className="text-slate-400 mt-3">
            Your Personal AI Study Partner
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <div className="flex gap-2 mb-8">

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                mode === "login"
                  ? "bg-yellow-400 text-black"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                mode === "signup"
                  ? "bg-yellow-400 text-black"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              Sign Up
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            {message && (
              <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-3 rounded-xl font-semibold hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login to Atlas"
                : "Create Account"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}