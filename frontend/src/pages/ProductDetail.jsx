import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (product)
      setMainImage(
        (product.images && product.images[0]) || product.image || null
      );
  }, [product]);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i) => i.product_id === product.id);
    if (existing) existing.quantity += qty;
    else
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
      });
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/order");
  }

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <nav className="mb-6 text-sm text-gray-500">
        <span className="mr-2">Home</span>
        <span className="mx-2">›</span>
        <span className="mr-2">Products</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Thumbnails column */}
        <div className="flex-col hidden col-span-1 gap-4 lg:flex">
          {(product.images || [product.image]).slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`w-20 h-20 overflow-hidden border rounded hover:opacity-90 ${
                mainImage === img ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <img
                src={img}
                alt={`thumb-${idx}`}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>

        {/* Main image column (span 2) */}
        <div className="col-span-1 p-6 bg-white rounded shadow lg:col-span-2">
          <div className="relative group">
            <img
              src={
                mainImage ||
                (product.images && product.images[0]) ||
                product.image ||
                "https://via.placeholder.com/1200x1600"
              }
              alt={product.name}
              className="w-full h-[780px] object-cover rounded-lg"
            />

            {/* Quick View pill (hover only) */}
            <button className="absolute z-20 px-8 py-3 text-lg text-gray-900 transition-all duration-200 transform -translate-x-1/2 translate-y-6 bg-white border border-gray-100 rounded-full shadow-xl opacity-0 left-1/2 bottom-6 group-hover:translate-y-0 group-hover:opacity-100">
              Quick View
            </button>

            {/* left arrow */}
            <button className="absolute flex items-center justify-center w-12 h-12 text-white -translate-y-1/2 rounded opacity-0 group-hover:opacity-100 left-2 top-1/2 bg-gray-800/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* right arrow */}
            <button className="absolute flex items-center justify-center w-12 h-12 text-white -translate-y-1/2 rounded opacity-0 group-hover:opacity-100 right-2 top-1/2 bg-gray-800/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* fullscreen / expand icon */}
            <button className="absolute flex items-center justify-center w-10 h-10 bg-white rounded-full shadow right-4 top-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Details column */}
        <div className="col-span-1 p-6 bg-white rounded shadow">
          <h1 className="text-2xl font-semibold text-gray-900">
            {product.name}
          </h1>
          <div className="mt-3 text-2xl font-bold text-indigo-600">
            ${product.price}
          </div>
          <p className="mt-4 text-gray-600">{product.description}</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Size</label>
              <select className="w-full px-3 py-2 border rounded">
                <option>Choose an option</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-600">Color</label>
              <select className="w-full px-3 py-2 border rounded">
                <option>Choose an option</option>
                <option>Black</option>
                <option>Navy</option>
                <option>White</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3"
                >
                  -
                </button>
                <div className="px-6 py-3 border-l border-r">{qty}</div>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-3">
                  +
                </button>
              </div>

              <button
                onClick={addToCart}
                className="px-6 py-3 ml-2 text-white bg-indigo-500 rounded-full shadow-lg"
              >
                ADD TO CART
              </button>
            </div>

            <div className="flex items-center gap-4 mt-6 text-gray-400">
              <button className="hover:text-gray-700">❤</button>
              <button className="hover:text-gray-700">f</button>
              <button className="hover:text-gray-700">t</button>
            </div>
          </div>

          <div className="pt-6 mt-8 text-sm text-gray-500 border-t">
            <div>
              Category:{" "}
              <span className="text-gray-700">
                {product.category || "General"}
              </span>
            </div>
            <div className="mt-3 font-medium">
              Total: ${(product.price * qty).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
