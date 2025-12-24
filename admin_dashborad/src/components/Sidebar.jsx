import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

const menu = [
  { name: "Dashboard", icon: HomeIcon },
  { name: "Users", icon: UsersIcon },
  { name: "Products", icon: ShoppingBagIcon },
  { name: "Orders", icon: ClipboardDocumentListIcon },
  { name: "Reports", icon: ChartBarIcon },
  { name: "Settings", icon: Cog6ToothIcon },
];

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-black/80 backdrop-blur text-white rounded-r-2xl shadow-xl flex flex-col">
      {/* Logo */}
      <div className="p-6 text-lg font-semibold border-b border-white/10">
        CREATIVE TIM
      </div>

      {/* Menu */}
      <nav className="mt-6 px-3 flex-1 space-y-1">
        {menu.map(({ name, icon: Icon }) => (
          <div
            key={name}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10 transition"
          >
            {/* Left Indicator (HOVER ONLY) */}
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />

            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{name}</span>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <div className="group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-red-500/20 text-red-400 transition">
          {/* Left Indicator (HOVER ONLY) */}
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-red-500 opacity-0 group-hover:opacity-100 transition-all" />

          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
