import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function Payment() {
  const { state } = useLocation();
  const order = state?.order;
  if (!order)
    return (
      <div className="text-center">
        <h3 className="text-xl font-semibold">No payment info</h3>
        <Link to="/" className="text-indigo-600">
          Go Home
        </Link>
      </div>
    );
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Payment & Confirmation</h3>
      <div className="bg-white p-6 rounded shadow">
        <p className="mb-2">
          Order ID: <strong>{order.orderId}</strong>
        </p>
        <p className="mb-2">
          Total: <strong>${order.total}</strong>
        </p>
        <p className="mb-4">
          Status: <strong>{order.status}</strong>
        </p>
        <Link
          to="/products"
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
