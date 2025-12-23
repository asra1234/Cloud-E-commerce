import React, { useState } from "react";

export default function QuickView({ product, onClose }) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

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
        image: product.image,
      });
    localStorage.setItem("cart", JSON.stringify(cart));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full z-10 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-4">
            <img
              src={product.image || "https://via.placeholder.com/800"}
              alt={product.name}
              className="w-full h-72 object-cover rounded"
            />
          </div>
          <div className="p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold">{product.name}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-600 mt-3 flex-1">
              {product.description}
            </div>
            <div className="text-2xl text-indigo-600 font-semibold mt-4">
              ${product.price}
            </div>
            <div className="mt-4 flex items-center space-x-3">
              <label className="text-sm text-gray-700">Qty</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 border rounded px-2 py-1"
              />
            </div>
            <div className="mt-6">
              <button
                onClick={addToCart}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
