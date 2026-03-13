interface Props {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}

export function AdminStatsCard({ title, value, icon, color = 'bg-sky-500' }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
      <div className={`${color} text-white rounded-full w-12 h-12 flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
