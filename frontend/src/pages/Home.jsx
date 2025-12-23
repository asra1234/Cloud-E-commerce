import React, { useState } from "react";
import { Link } from "react-router-dom";
import QuickView from "../components/QuickView";

export default function Home() {
  const [quickProduct, setQuickProduct] = useState(null);
  return (
    <div>
      <section className="overflow-hidden rounded-lg hero-bg">
        <div className="grid items-center grid-cols-1 gap-6 px-6 py-20 mx-auto max-w-7xl md:grid-cols-2">
          <div>
            <p className="mb-2 text-gray-500">Men Collection 2038</p>
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-gray-900">
              NEW ARRIVALS
            </h1>
            <p className="mb-6 text-lg text-gray-600">
              Discover the latest trends and curated picks for modern shoppers.
              Fast, reliable, and designed for scale.
            </p>
            <div className="flex space-x-3">
              <Link
                to="/products"
                className="inline-block px-6 py-3 text-white transition duration-200 transform bg-indigo-600 rounded-full shadow hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-lg"
              >
                Shop Now
              </Link>
              <Link
                to="/products"
                className="inline-block px-5 py-3 text-gray-700 transition duration-200 transform border border-gray-300 rounded-full hover:bg-gray-100 hover:-translate-y-1"
              >
                Explore
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src="https://via.placeholder.com/600x600"
              alt="hero"
              className="object-cover w-full max-w-md shadow-lg rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Category blocks: Women / Men / Accessories (placed below hero) */}
      <section className="grid grid-cols-1 gap-6 px-6 py-12 mx-auto max-w-7xl md:grid-cols-3">
        <Link
          to="/products?cat=women"
          className="relative block overflow-hidden bg-white border rounded-lg category-card"
        >
          <div className="p-6 card-text">
            <h3 className="text-3xl font-extrabold text-gray-900 animate-slide-up animate-delay-100">
              Women
            </h3>
            <div className="mt-2 text-gray-500 animate-slide-up animate-delay-200">
              Spring 2038
            </div>
          </div>
          <div className="category-overlay">
            <div>
              <h3 className="text-3xl font-extrabold category-title animate-slide-up animate-delay-100">
                Women
              </h3>
              <div className="mt-2 text-indigo-100 animate-slide-up animate-delay-200">
                Spring 2038
              </div>
              <div className="mt-6">
                <span className="inline-block pb-1 font-semibold text-white border-b border-white cursor-pointer">
                  SHOP NOW
                </span>
              </div>
            </div>
          </div>
          <img
            src="https://via.placeholder.com/800x500?text=Women"
            alt="women"
            className="object-cover w-full h-56"
          />
        </Link>

        <Link
          to="/products?cat=men"
          className="relative block overflow-hidden bg-white border rounded-lg category-card"
        >
          <div className="p-6 card-text">
            <h3 className="text-3xl font-extrabold text-gray-900 animate-slide-up animate-delay-100">
              Men
            </h3>
            <div className="mt-2 text-gray-500 animate-slide-up animate-delay-200">
              Spring 2038
            </div>
          </div>
          <div className="category-overlay">
            <div>
              <h3 className="text-3xl font-extrabold category-title animate-slide-up animate-delay-100">
                Men
              </h3>
              <div className="mt-2 text-indigo-100 animate-slide-up animate-delay-200">
                Spring 2038
              </div>
              <div className="mt-6">
                <span className="inline-block pb-1 font-semibold text-white border-b border-white cursor-pointer">
                  SHOP NOW
                </span>
              </div>
            </div>
          </div>
          <img
            src="https://via.placeholder.com/800x500?text=Men"
            alt="men"
            className="object-cover w-full h-56"
          />
        </Link>

        <Link
          to="/products?cat=accessories"
          className="relative block overflow-hidden bg-white border rounded-lg category-card"
        >
          <div className="p-6 card-text">
            <h3 className="text-3xl font-extrabold text-gray-900 animate-slide-up animate-delay-100">
              Accessories
            </h3>
            <div className="mt-2 text-gray-500 animate-slide-up animate-delay-200">
              New Trend
            </div>
          </div>
          <div className="category-overlay">
            <div>
              <h3 className="text-3xl font-extrabold category-title animate-slide-up animate-delay-100">
                Accessories
              </h3>
              <div className="mt-2 text-indigo-100 animate-slide-up animate-delay-200">
                New Trend
              </div>
              <div className="mt-6">
                <span className="inline-block pb-1 font-semibold text-white border-b border-white cursor-pointer">
                  SHOP NOW
                </span>
              </div>
            </div>
          </div>
          <img
            src="https://via.placeholder.com/800x500?text=Accessories"
            alt="accessories"
            className="object-cover w-full h-56"
          />
        </Link>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-indigo-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative p-4 transition duration-200 transform bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 group">
            <div className="relative overflow-hidden rounded">
              <img
                src="https://via.placeholder.com/400"
                alt="p1"
                className="object-cover w-full h-56 transition-transform duration-300 rounded group-hover:scale-105"
              />
              <button
                onClick={() =>
                  setQuickProduct({
                    id: 1,
                    name: "Wireless Headphones",
                    price: 99.99,
                    image: "https://via.placeholder.com/400",
                    description:
                      "High-quality wireless headphones with noise cancellation.",
                  })
                }
                className="absolute z-10 px-6 py-2 text-gray-800 transition-all duration-200 transform -translate-x-1/2 translate-y-6 bg-white border border-gray-100 rounded-full shadow-lg opacity-0 left-1/2 bottom-3 group-hover:translate-y-0 group-hover:opacity-100"
              >
                Quick View
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <h3 className="font-semibold text-gray-700 transition-colors duration-150 group-hover:text-indigo-600">
                Wireless Headphones
              </h3>
              <button className="text-gray-300 hover:text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-1 font-bold text-indigo-600">$99.99</div>
          </div>
          <div className="relative p-4 transition duration-200 transform bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 group">
            <div className="relative overflow-hidden rounded">
              <img
                src="https://via.placeholder.com/400"
                alt="p2"
                className="object-cover w-full h-56 transition-transform duration-300 rounded group-hover:scale-105"
              />
              <button
                onClick={() =>
                  setQuickProduct({
                    id: 2,
                    name: "Smartphone",
                    price: 799.0,
                    image: "https://via.placeholder.com/400",
                    description:
                      "Latest smartphone with powerful performance and great camera.",
                  })
                }
                className="absolute z-10 px-6 py-2 text-gray-800 transition-all duration-200 transform -translate-x-1/2 translate-y-6 bg-white border border-gray-100 rounded-full shadow-lg opacity-0 left-1/2 bottom-3 group-hover:translate-y-0 group-hover:opacity-100"
              >
                Quick View
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <h3 className="font-semibold text-gray-700 transition-colors duration-150 group-hover:text-indigo-600">
                Smartphone
              </h3>
              <button className="text-gray-300 hover:text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-1 font-bold text-indigo-600">$799.00</div>
          </div>
          <div className="relative p-4 transition duration-200 transform bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 group">
            <div className="relative overflow-hidden rounded">
              <img
                src="https://via.placeholder.com/400"
                alt="p3"
                className="object-cover w-full h-56 transition-transform duration-300 rounded group-hover:scale-105"
              />
              <button
                onClick={() =>
                  setQuickProduct({
                    id: 3,
                    name: "Laptop",
                    price: 1299.5,
                    image: "https://via.placeholder.com/400",
                    description:
                      "Powerful laptop for professionals and creators.",
                  })
                }
                className="absolute z-10 px-6 py-2 text-gray-800 transition-all duration-200 transform -translate-x-1/2 translate-y-6 bg-white border border-gray-100 rounded-full shadow-lg opacity-0 left-1/2 bottom-3 group-hover:translate-y-0 group-hover:opacity-100"
              >
                Quick View
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <h3 className="font-semibold text-gray-700 transition-colors duration-150 group-hover:text-indigo-600">
                Laptop
              </h3>
              <button className="text-gray-300 hover:text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-1 font-bold text-indigo-600">$1299.50</div>
          </div>
        </div>
        {quickProduct && (
          <QuickView
            product={quickProduct}
            onClose={() => setQuickProduct(null)}
          />
        )}
      </section>
    </div>
  );
}
