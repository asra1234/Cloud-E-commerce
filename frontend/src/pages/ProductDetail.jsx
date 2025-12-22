import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(console.error);
  }, [id]);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img
          src={product.image || "https://via.placeholder.com/800"}
          alt={product.name}
          className="w-full rounded-lg shadow"
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-gray-600 mt-3">{product.description}</p>
        <h4 className="text-2xl text-indigo-600 font-semibold mt-4">
          ${product.price}
        </h4>
        <div className="mt-4">
          <label className="block text-sm text-gray-700">Quantity</label>
          <input
            type="number"
            min="1"
            className="mt-1 block w-32 border rounded px-3 py-2"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="mt-6">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={addToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
