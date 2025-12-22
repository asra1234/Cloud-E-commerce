import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="hero-bg rounded-lg overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-20 px-6">
          <div>
            <p className="text-gray-500 mb-2">Men Collection 2038</p>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              NEW ARRIVALS
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover the latest trends and curated picks for modern shoppers.
              Fast, reliable, and designed for scale.
            </p>
            <div className="flex space-x-3">
              <Link
                to="/products"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full shadow hover:bg-indigo-700"
              >
                Shop Now
              </Link>
              <Link
                to="/products"
                className="inline-block border border-gray-300 px-5 py-3 rounded-full text-gray-700 hover:bg-gray-100"
              >
                Explore
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src="https://via.placeholder.com/600x600"
              alt="hero"
              className="w-full max-w-md object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-indigo-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <img
              src="https://via.placeholder.com/400"
              alt="p1"
              className="w-full h-56 object-cover rounded"
            />
            <h3 className="mt-3 font-semibold">Wireless Headphones</h3>
            <div className="text-indigo-600 font-bold">$99.99</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <img
              src="https://via.placeholder.com/400"
              alt="p2"
              className="w-full h-56 object-cover rounded"
            />
            <h3 className="mt-3 font-semibold">Smartphone</h3>
            <div className="text-indigo-600 font-bold">$799.00</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <img
              src="https://via.placeholder.com/400"
              alt="p3"
              className="w-full h-56 object-cover rounded"
            />
            <h3 className="mt-3 font-semibold">Laptop</h3>
            <div className="text-indigo-600 font-bold">$1299.50</div>
          </div>
        </div>
      </section>
    </div>
  );
}
