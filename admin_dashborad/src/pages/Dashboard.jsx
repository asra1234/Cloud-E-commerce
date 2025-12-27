import AdminLayout from "../layouts/AdminLayout";
import StatCard from "../components/StatCard";
import SalesStatCard from "../components/SalesStatCard";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  UsersIcon,
  ShoppingCartIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

// ===== TEMPORARY CHART DATA =====

const weeklySalesData = [
  { day: "Mon", sales: 120 },
  { day: "Tue", sales: 200 },
  { day: "Wed", sales: 150 },
  { day: "Thu", sales: 180 },
  { day: "Fri", sales: 240 },
  { day: "Sat", sales: 300 },
  { day: "Sun", sales: 220 },
];

const orderAnalyticsData = [
  { month: "Jan", online: 40, offline: 30, returns: 10 },
  { month: "Feb", online: 80, offline: 60, returns: 20 },
  { month: "Mar", online: 65, offline: 70, returns: 25 },
  { month: "Apr", online: 120, offline: 90, returns: 30 },
  { month: "May", online: 100, offline: 110, returns: 35 },
  { month: "Jun", online: 150, offline: 130, returns: 40 },
  { month: "Jul", online: 140, offline: 120, returns: 45 },
  { month: "Aug", online: 180, offline: 160, returns: 50 },
  { month: "Sep", online: 160, offline: 150, returns: 55 },
  { month: "Oct", online: 220, offline: 180, returns: 60 },
  { month: "Nov", online: 400, offline: 200, returns: 70 },
  { month: "Dec", online: 180, offline: 90, returns: 30 },
];

const inventoryData = [
  { name: "In Stock", value: 420 },
  { name: "Low Stock", value: 90 },
  { name: "Out of Stock", value: 47 },
];

const COLORS = ["#22c55e", "#f97316", "#ef4444"];

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 md:auto-rows-[180px]">
        {/* Small cards */}
        <StatCard
          title="Total Users"
          value="277"
          subtitle="Last month +95%"
          icon={UsersIcon}
          color="bg-green-600"
        />

        <StatCard
          title="Total Orders"
          value="338"
          subtitle="Last month +30%"
          icon={ShoppingCartIcon}
          color="bg-purple-600"
        />

        {/* BIG CARD — EXACT HEIGHT OF 2 SMALL CARDS */}
        <div className="md:col-start-3 md:row-start-1 md:row-span-2">
          <SalesStatCard />
        </div>

        <StatCard
          title="Total Products"
          value="557"
          subtitle="Last month +25%"
          icon={CubeIcon}
          color="bg-blue-600"
        />

        <StatCard
          title="Low Stock Products"
          value="12"
          subtitle="Needs restock"
          icon={ExclamationTriangleIcon}
          color="bg-orange-600"
        />
      </div>

      {/* Other dashboard content */}
      {/* ===== DASHBOARD CHARTS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Sales */}
        <div className="bg-white rounded-xl shadow-lg p-6 h-64">
          <p className="font-semibold text-gray-800 mb-4">Weekly Sales</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklySalesData}
              margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
            >
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Analytics */}
        <div className="bg-white rounded-xl shadow-lg p-6 h-64">
          <p className="font-semibold text-gray-800 mb-4">Order Analytics</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={orderAnalyticsData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={24} />
              <Line
                type="monotone"
                dataKey="online"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="offline"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="returns"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 h-64 flex flex-col">
          <p className="font-semibold text-gray-800 mb-2">Inventory Status</p>

          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                >
                  {inventoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                {/* CENTER TEXT (VISIBLE & CLEAN) */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#111827" // gray-900
                  fontSize="16"
                  fontWeight="600"
                >
                  {inventoryData.reduce((sum, item) => sum + item.value, 0)}
                </text>

                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
