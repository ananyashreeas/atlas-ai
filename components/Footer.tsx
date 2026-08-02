export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-28 py-12">
      <div className="max-w-6xl mx-auto px-8">

        <div className="flex flex-col md:flex-row justify-between items-center">

          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Atlas AI
            </h2>

            <p className="text-gray-400 mt-2">
              Never Study Alone Again.
            </p>
          </div>

          <div className="flex gap-8 mt-6 md:mt-0 text-gray-400">
            <a href="#">Features</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-gray-500">
          © 2026 Atlas AI. Built for students ❤️
        </div>

      </div>
    </footer>
  );
}