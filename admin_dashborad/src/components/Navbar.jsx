import {
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* LEFT: Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="text-lg font-semibold text-gray-800">Dashboard</span>
        </div>

        {/* CENTER: Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders, users, products..."
              className="w-full pl-4 pr-4 py-2 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          {/* Icon Button */}
          {[
            { icon: ShoppingCartIcon, count: 3, color: "bg-red-500" },
            { icon: ChatBubbleLeftRightIcon, count: 5, color: "bg-blue-500" },
            { icon: BellIcon, count: 2, color: "bg-orange-500" },
          ].map(({ icon: Icon, count, color }, i) => (
            <div
              key={i}
              className="relative h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition"
            >
              <Icon className="h-5 w-5 text-gray-700" />
              <span
                className={`absolute -top-1 -right-1 h-4 w-4 text-[10px] text-white rounded-full flex items-center justify-center ${color}`}
              >
                {count}
              </span>
            </div>
          ))}

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 mx-1" />

          {/* Profile */}
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-xl transition">
            <img
              src="https://i.pravatar.cc/40"
              alt="Admin"
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
