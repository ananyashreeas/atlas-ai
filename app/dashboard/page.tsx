export default function DashboardPage() {
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            Welcome back, Ananya 👋
          </h1>

          <p className="text-slate-400 mt-2">
            Ready to continue your learning journey?
          </p>
        </div>

        <button className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl hover:bg-yellow-300 transition">
          + Ask Atlas AI
        </button>

      </div>

      {/* Statistics */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-400">
            Study Streak
          </p>

          <h2 className="text-4xl font-bold mt-3">
            🔥 12
          </h2>

          <p className="text-slate-500 mt-2">
            Consecutive Days
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-400">
            Notes Uploaded
          </p>

          <h2 className="text-4xl font-bold mt-3">
            📚 24
          </h2>

          <p className="text-slate-500 mt-2">
            Total Notes
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-400">
            AI Questions
          </p>

          <h2 className="text-4xl font-bold mt-3">
            🤖 173
          </h2>

          <p className="text-slate-500 mt-2">
            Asked This Month
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-400">
            Completion
          </p>

          <h2 className="text-4xl font-bold mt-3">
            🎯 81%
          </h2>

          <p className="text-slate-500 mt-2">
            Weekly Goal
          </p>
        </div>

      </div>

      {/* Main Section */}

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-8 border border-slate-800">

          <h2 className="text-2xl font-bold">
            Today's Focus
          </h2>

          <p className="text-slate-400 mt-3">
            Numerical Ability Practice
          </p>

          <div className="w-full bg-slate-800 rounded-full h-4 mt-6">

            <div className="bg-yellow-400 h-4 rounded-full w-4/5"></div>

          </div>

          <p className="text-right mt-2 text-yellow-400">
            80% Completed
          </p>

        </div>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">

          <h2 className="text-2xl font-bold">
            Recent Activity
          </h2>

          <ul className="mt-6 space-y-4 text-slate-300">

            <li>✅ Created Study Plan</li>

            <li>📄 Uploaded Physics Notes</li>

            <li>🤖 Asked AI about Calculus</li>

            <li>📝 Completed Daily Quiz</li>

          </ul>

        </div>

      </div>

    </div>
  );
}