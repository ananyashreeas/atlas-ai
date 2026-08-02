import Navbar from "@/components/Navbar";
import Hero from "@/components/hero";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <Hero />

      <section className="grid md:grid-cols-3 gap-8 px-12 mt-32 pb-10">

        <FeatureCard
          icon="📄"
          title="Smart Notes"
          description="Upload PDFs and create your personal AI knowledge base."
        />

        <FeatureCard
          icon="💬"
          title="AI Chat"
          description="Ask questions directly from your notes."
        />

        <FeatureCard
          icon="🧠"
          title="Visual Learning"
          description="Generate diagrams and concept maps instantly."
        />

        <FeatureCard
          icon="📅"
          title="Study Planner"
          description="Create personalized study schedules."
        />

        <FeatureCard
          icon="🎯"
          title="Personalized Quizzes"
          description="Generate quizzes from your uploaded notes."
        />

        <FeatureCard
          icon="📊"
          title="Progress Tracking"
          description="Track your daily learning journey."
        />

      </section>

      <Footer />

    </main>
  );
}