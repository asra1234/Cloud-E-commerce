import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("cart");
    try {
      setCart(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setCart([]);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "cart") {
        try {
          setCart(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          setCart([]);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const itemCount = cart.reduce((s, it) => s + (it.quantity || 1), 0);
  const total = cart.reduce(
    (s, it) => s + (it.price || 0) * (it.quantity || 1),
    0
  );

  const formatPrice = (v) => {
    return `$${Number(v).toFixed(2)}`;
  };

  return (
    <>
      <header className="bg-white border-b">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold text-gray-900">
                  COZA
                </span>
                <span className="text-lg font-light text-gray-600">STORE</span>
              </Link>
            </div>

            <nav className="items-center hidden space-x-8 text-gray-600 md:flex">
              <Link to="/" className="hover:text-gray-900">
                Home
              </Link>
              <Link to="/products" className="hover:text-gray-900">
                Shop
              </Link>
              <Link
                to="/"
                className="flex items-center space-x-2 hover:text-gray-900"
              >
                <span>Features</span>
                <span className="bg-pink-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  HOT
                </span>
              </Link>
              <Link to="/" className="hover:text-gray-900">
                Blog
              </Link>
              <Link to="/" className="hover:text-gray-900">
                About
              </Link>
              <Link to="/" className="hover:text-gray-900">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-6">
              <button
                aria-label="search"
                className="text-gray-600 hover:text-gray-900 transition transform duration-150 hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="open cart"
                className="relative overflow-visible text-gray-600 hover:text-gray-900 transition transform duration-150 hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 30 30"
                  stroke="currentColor"
                  strokeWidth={2}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6h12.4"
                  />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs rounded-full px-1.5">
                  {itemCount}
                </span>
              </button>

              <Link
                to="/wishlist"
                className="relative overflow-visible text-gray-600 hover:text-gray-900 transition transform duration-150 hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-gray-200 text-gray-700 text-xs rounded-full px-1">
                  0
                </span>
              </Link>

              {user ? (
                <Link
                  to="/account"
                  className="ml-2 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition transform duration-150 hover:scale-110"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}
                  </div>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="ml-2 relative overflow-visible text-gray-600 hover:text-gray-900 transition transform duration-150 hover:scale-110"
                  aria-label="login"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                    />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + backdrop */}
      <div
        className={`fixed inset-0 z-40 ${
          sidebarOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div
          className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">YOUR CART</h3>
              <button
                aria-label="close cart"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-900 transition transform duration-150 hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 pr-2 mt-6 overflow-auto">
              {cart.length === 0 ? (
                <div className="text-gray-500">Your cart is empty.</div>
              ) : (
                <ul className="space-y-6">
                  {cart.map((it, idx) => (
                    <li key={idx} className="flex items-start space-x-4">
                      <img
                        src={
                          it.image || it.img || "https://via.placeholder.com/56"
                        }
                        alt={it.name || it.title || "Product"}
                        className="object-cover rounded w-14 h-14"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {it.name || it.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {it.quantity || 1} x {formatPrice(it.price || 0)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-lg font-medium">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    navigate("/cart");
                  }}
                  className="flex-1 py-3 text-center text-white bg-gray-900 rounded-full transition transform duration-150 hover:-translate-y-0.5 hover:shadow"
                >
                  VIEW CART
                </button>
                <Link
                  to="/payment"
                  onClick={() => setSidebarOpen(false)}
                  className="flex-1 py-3 text-center text-gray-900 border border-gray-900 rounded-full transition transform duration-150 hover:-translate-y-0.5 hover:shadow"
                >
                  CHECK OUT
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
