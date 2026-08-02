import DashboardCard from "@/components/DashboardCard";

export default function Dashboard() {
  return (
    <>
      <h1 className="text-5xl font-bold">
        👋 Welcome Back
      </h1>

      <p className="text-gray-400 mt-3 text-xl">
        Ready to continue your learning journey?
      </p>

      <div className="grid md:grid-cols-3 gap-8 mt-16">

        <DashboardCard
          icon="📄"
          title="Upload Notes"
          description="Upload PDFs and create your AI knowledge base."
        />

        <DashboardCard
          icon="💬"
          title="AI Chat"
          description="Ask Atlas anything from your notes."
        />

        <DashboardCard
          icon="📅"
          title="Study Planner"
          description="Plan your learning schedule."
        />

        <DashboardCard
          icon="🧠"
          title="Visual Learning"
          description="Generate diagrams and mind maps."
        />

        <DashboardCard
          icon="📊"
          title="Analytics"
          description="Track your progress."
        />

        <DashboardCard
          icon="🎯"
          title="Daily Goals"
          description="Stay consistent every day."
        />

      </div>
    </>
  );
}