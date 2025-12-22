import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Order() {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  function remove(idx) {
    const c = [...cart];
    c.splice(idx, 1);
    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
  }

  function updateQty(idx, q) {
    const c = [...cart];
    c[idx].quantity = q;
    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
  }

  async function placeOrder() {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to place order");
      return;
    }
    if (!cart.length) {
      setError("Cart empty");
      return;
    }
    setLoading(true);
    try {
      const items = cart.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));
      const res = await api.post(
        "/orders",
        { items, payment: { method: "card" } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("cart");
      navigate("/payment", { state: { order: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Your Order</h3>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <div className="space-y-4">
        {cart.map((it, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-white p-4 rounded shadow"
          >
            <div>
              <strong className="block">{it.name}</strong>
              <div className="text-sm text-gray-500">${it.price}</div>
            </div>
            <div className="flex flex-col items-end">
              <input
                type="number"
                className="border rounded px-2 py-1 mb-2 w-24"
                value={it.quantity}
                onChange={(e) => updateQty(idx, parseInt(e.target.value) || 1)}
              />
              <button
                className="text-sm text-red-600"
                onClick={() => remove(idx)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <h4 className="text-xl font-semibold">Total: ${total}</h4>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={placeOrder}
          disabled={loading}
        >
          {loading ? "Placing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
