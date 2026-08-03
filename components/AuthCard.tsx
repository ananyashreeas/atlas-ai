import Link from "next/link";

export default function AuthCard() {
  return (
    <div className="w-full max-w-md bg-slate-900 rounded-3xl p-10 shadow-2xl">

      <h1 className="text-4xl font-bold text-center">
        Welcome Back 👋
      </h1>

      <p className="text-gray-400 text-center mt-3">
        Sign in to continue your learning journey.
      </p>

      <div className="mt-10 space-y-5">

        <input
          type="email"
          placeholder="Email"
          className="w-full bg-slate-800 rounded-xl px-5 py-4 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full bg-slate-800 rounded-xl px-5 py-4 outline-none"
        />

        <button className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl py-4 font-semibold transition">
          Sign In
        </button>

      </div>

      <p className="text-center text-gray-400 mt-8">
        Don't have an account?{" "}
        <Link href="/signup" className="text-purple-400">
          Sign Up
        </Link>
      </p>

    </div>
  );
}