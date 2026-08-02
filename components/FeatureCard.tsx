type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-8 hover:bg-slate-800 transition">
      <h3 className="text-2xl font-semibold">
        {icon} {title}
      </h3>

      <p className="text-gray-400 mt-4">
        {description}
      </p>
    </div>
  );
}