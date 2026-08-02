export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">

      <h1 className="text-5xl font-bold">
        Welcome to Atlas 👋
      </h1>

      <p className="text-gray-400 mt-4">
        Never study alone again.
      </p>

      <button className="mt-10 bg-white text-black px-8 py-4 rounded-xl font-semibold">
        Continue with Google
      </button>

      <button className="mt-4 border border-gray-600 px-8 py-4 rounded-xl">
        🚀 Explore Atlas
      </button>

    </main>
  );
}