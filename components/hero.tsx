import Link from "next/link";

export default function Hero() {
  return (
     <section className="flex flex-col items-center text-center mt-36 px-6">
        <h2 className="text-6xl font-extrabold max-w-4xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Never Study Alone Again.
        </h2>
        <p className="text-gray-400 mt-6 text-xl max-w-2xl">
         Atlas is your AI learning companion that understands your notes,
creates study plans, generates quizzes, explains concepts visually,
and helps you stay motivated every single day. 
        </p>
<div className="mt-10 flex gap-4">

  <Link href="/login">
    <button className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl text-lg transition">
      Get Started
    </button>
  </Link>

  <button className="border border-gray-500 hover:border-white px-8 py-4 rounded-xl text-lg transition">
    Watch Demo
  </button>

</div>

      </section>
    );
}
