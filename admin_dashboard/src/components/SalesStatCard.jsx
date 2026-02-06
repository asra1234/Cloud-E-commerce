import { CurrencyDollarIcon } from "@heroicons/react/24/solid";

const SalesStatCard = () => {
  return (
    <div className="relative h-full bg-blue-600 text-white rounded-xl shadow-lg p-6 overflow-hidden">
      <div className="absolute top-4 right-4 h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
        <CurrencyDollarIcon className="h-5 w-5 text-white" />
      </div>

      <p className="text-sm opacity-80">Total Sales</p>
      <h2 className="text-3xl font-bold mt-1">$3,787,681</h2>

      <p className="text-xs opacity-80 mt-2">+40.63% from last month</p>

      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
        <svg viewBox="0 0 200 60" className="w-full h-full">
          <polyline
            fill="none"
            stroke="white"
            strokeWidth="3"
            points="0,40 30,30 60,35 90,20 120,25 150,15 180,20"
          />
        </svg>
      </div>
    </div>
  );
};

export default SalesStatCard;
