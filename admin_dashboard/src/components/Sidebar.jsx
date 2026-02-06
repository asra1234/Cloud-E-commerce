import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const menu = [
  { name: "Dashboard", icon: HomeIcon, to: "/" },
  { name: "Users", icon: UsersIcon, to: "/users" },
  { name: "Products", icon: ShoppingBagIcon, to: "/products" },
  { name: "Orders", icon: ClipboardDocumentListIcon, to: "/orders" },
  { name: "Reports", icon: ChartBarIcon, to: "/reports" },
  { name: "Settings", icon: Cog6ToothIcon, to: "/settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  let token = null;
  if (typeof window !== "undefined") {
    try {
      token = localStorage.getItem("token");
    } catch (e) {}
    if (!token) {
      try {
        token = sessionStorage.getItem("token");
      } catch (e) {}
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-black/80 backdrop-blur text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 text-lg font-semibold border-b border-white/10">
        CREATIVE TIM
      </div>

      {/* Menu */}
      <nav className="mt-6 px-3 flex-1 space-y-1">
        {menu.map(({ name, icon: Icon, to }) => (
          <NavLink
            key={name}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive ? "bg-white/10" : "hover:bg-white/10"
              }`
            }
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />

            {/* Render the icon if it exists */}
            {Icon && <Icon className="h-5 w-5" />}
            <span className="text-sm font-medium">{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        {token ? (
          <div
            onClick={handleLogout}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-red-500/20 text-red-400 transition"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-red-500 opacity-0 group-hover:opacity-100 transition-all" />
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="group relative flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-cyan-300 transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Login</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
