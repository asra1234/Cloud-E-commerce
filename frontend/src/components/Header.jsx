import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return (
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
              className="text-gray-600 hover:text-gray-900"
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

            <Link
              to="/cart"
              className="relative overflow-visible text-gray-600 hover:text-gray-900"
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6h12.4"
                />
              </svg>
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs rounded-full px-1.5">
                2
              </span>
            </Link>

            <Link
              to="/wishlist"
              className="relative overflow-visible text-gray-600 hover:text-gray-900"
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
          </div>
        </div>
      </div>
    </header>
  );
}
