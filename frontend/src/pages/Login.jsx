import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth={2} />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">Welcome back</h3>
            <p className="text-sm text-gray-500">Sign in to continue to COZA STORE</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative rounded-md">
              <input
                className="w-full border border-gray-200 rounded-md px-3 py-3 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative rounded-md">
              <input
                type="password"
                className="w-full border border-gray-200 rounded-md px-3 py-3 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg font-medium shadow hover:opacity-95">Login</button>
          </div>

          <div className="text-center text-sm text-gray-500">or sign in with</div>
          <div className="flex gap-3 mt-2">
            <button type="button" className="flex-1 py-2 border rounded-md text-sm hover:bg-gray-50">Google</button>
            <button type="button" className="flex-1 py-2 border rounded-md text-sm hover:bg-gray-50">Facebook</button>
          </div>

          <div className="text-sm text-center text-gray-500 mt-4">
            Don't have an account? <Link to="/register" className="text-indigo-600 font-medium">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
