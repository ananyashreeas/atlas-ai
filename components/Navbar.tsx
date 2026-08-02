import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">

      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">

        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Atlas AI
          </h1>

          <p className="text-xs text-gray-400">
            Your AI Study Partner
          </p>
        </div>

        <div className="flex gap-8 items-center">

          <Link
            href="/"
            className="text-gray-300 hover:text-white transition"
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white transition"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard"
            className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-xl transition shadow-lg shadow-purple-500/30"
          >
            Get Started
          </Link>

        </div>

      </div>

    </nav>
  );
}