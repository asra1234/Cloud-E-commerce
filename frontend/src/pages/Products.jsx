import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api
      .get("/products")
      .then((r) => setProducts(r.data))
      .catch(console.error);
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Product Overview</h2>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border rounded text-gray-600">
            Filter
          </button>
          <input placeholder="Search" className="px-4 py-2 border rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-lg shadow overflow-hidden product-card"
          >
            <Link to={`/product/${p.id}`}>
              <img
                src={p.image || "https://via.placeholder.com/600x600"}
                alt={p.name}
                className="w-full h-64 object-cover"
              />
            </Link>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-sm text-gray-500 truncate my-2">
                {p.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-indigo-600 font-bold">${p.price}</div>
                <Link
                  to={`/product/${p.id}`}
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
