import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
        <div className="flex items-center mb-6 space-x-3">
          <div className="flex items-center justify-center w-12 h-12 text-indigo-600 rounded-full bg-indigo-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">
              Create account
            </h3>
            <p className="text-sm text-gray-500">
              Sign up to start shopping with COZA STORE
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 rounded bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className="w-full px-3 py-3 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              className="w-full px-3 py-3 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-3 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </div>

          <div className="flex items-center justify-between">
            <button className="px-6 py-3 text-white rounded-lg shadow bg-gradient-to-r from-indigo-600 to-indigo-500">
              Register
            </button>
            <Link to="/login" className="text-sm text-gray-500">
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
