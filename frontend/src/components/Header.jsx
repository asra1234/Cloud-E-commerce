import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-extrabold text-gray-800">
              CloudRetail
            </Link>
            <nav className="hidden md:flex space-x-3 text-gray-600">
              <Link to="/" className="hover:text-gray-900">
                Home
              </Link>
              <Link to="/products" className="hover:text-gray-900">
                Shop
              </Link>
              <Link to="/" className="hover:text-gray-900">
                Features
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/order" className="text-gray-600 hover:text-gray-900">
              Orders
            </Link>
            {user ? (
              <div className="text-sm text-gray-700">Hi, {user.name}</div>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
            )}
            <Link
              to="/products"
              className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Shop
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
