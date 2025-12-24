const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <div className="relative bg-white rounded-xl shadow-lg p-6">
      {/* Icon */}
      <div
        className={`absolute top-4 right-4 h-10 w-10 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>

      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
