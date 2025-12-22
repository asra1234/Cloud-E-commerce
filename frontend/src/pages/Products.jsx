import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const CATEGORIES = ["All Products", "Women", "Men", "Bag", "Shoes", "Watches"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get("/products")
      .then((r) => setProducts(r.data || []))
      .catch(console.error);
  }, []);

  const matchesCategory = (p, category) => {
    if (!category || category === "All Products") return true;
    const term = category.toLowerCase();
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return (
      name.includes(term) ||
      desc.includes(term) ||
      (term === "shoes" && name.includes("shoe"))
    );
  };

  const filteredProducts = products.filter((p) => {
    if (
      query &&
      !`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    return matchesCategory(p, activeCategory);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Shop</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border rounded text-gray-600 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h3l2 5h8l2-5h3a1 1 0 011 1v2a1 1 0 01-1 1h-1l-3 12H7L4 8H3a1 1 0 01-1-1V4z"
              />
            </svg>
            <span>Filter</span>
          </button>
          <div className="flex items-center space-x-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="px-4 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <nav className="flex items-center space-x-8 text-gray-600 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`text-sm pb-2 ${
                activeCategory === c
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "hover:text-gray-800"
              }`}
            >
              {c}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <div key={p.id} className="group">
            <div className="bg-white rounded overflow-hidden">
              <Link to={`/product/${p.id}`} className="block">
                <img
                  src={p.image || "https://via.placeholder.com/600x800"}
                  alt={p.name}
                  className="w-full h-96 object-cover"
                />
              </Link>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-700 text-sm">{p.name}</h3>
                    <div className="text-gray-500 text-sm mt-1">${p.price}</div>
                  </div>

                  <button className="ml-4 text-gray-400 hover:text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
