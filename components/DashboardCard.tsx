type DashboardCardProps = {
  icon: string;
  title: string;
  description: string;
};

export default function DashboardCard({
  icon,
  title,
  description,
}: DashboardCardProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-8 hover:bg-slate-800 transition cursor-pointer border border-slate-800 hover:border-purple-500">

      <div className="text-5xl">
        {icon}
      </div>

      <h2 className="text-2xl font-bold mt-6">
        {title}
      </h2>

      <p className="text-gray-400 mt-3">
        {description}
      </p>

    </div>
  );
}