import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;
  const [cart, setCart] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [successOrder, setSuccessOrder] = useState(order || null);

  useEffect(() => {
    if (!order) {
      try {
        setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
      } catch (e) {
        setCart([]);
      }
    }
  }, [order]);

  const subtotal = (
    successOrder?.total ||
    cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0)
  ).toFixed(2);

  function formatPrice(v) {
    return `$${Number(v).toFixed(2)}`;
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!cart.length) return alert("Your cart is empty");
    setProcessing(true);
    setTimeout(() => {
      const created = {
        orderId: `ORD${Date.now()}`,
        total: subtotal,
        status: "Paid",
      };
      localStorage.removeItem("cart");
      setSuccessOrder(created);
      setProcessing(false);
      // optionally navigate, or stay and show confirmation
    }, 1000);
  }

  if (successOrder) {
    return (
      <div className="container px-4 py-10 mx-auto">
        <div className="max-w-3xl p-8 mx-auto text-center bg-white rounded shadow-md">
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 text-green-700 bg-green-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold">Payment Successful</h2>
          <p className="mb-4 text-gray-600">
            Thank you — your payment has been processed.
          </p>
          <div className="p-4 mb-6 rounded bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Order ID</span>
              <strong>{successOrder.orderId}</strong>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-700">
              <span>Amount Paid</span>
              <strong>{formatPrice(successOrder.total)}</strong>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-700">
              <span>Status</span>
              <strong className="text-green-600">{successOrder.status}</strong>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link
              to="/products"
              className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-full"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate("/order")}
              className="px-6 py-3 font-semibold border rounded-full"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-10 mx-auto">
      <nav className="mb-6 text-sm text-gray-500">
        <span className="mr-2">Home</span>
        <span className="mx-2">›</span>
        <span>Checkout</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form
          onSubmit={handlePay}
          className="p-6 bg-white rounded shadow lg:col-span-2"
        >
          <h3 className="mb-4 text-2xl font-bold">Payment Details</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-700">
                Name on card
              </label>
              <input
                required
                className="w-full p-3 mt-1 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                required
                className="w-full p-3 mt-1 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-700">Card number</label>
            <input
              required
              maxLength={19}
              className="w-full p-3 mt-1 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="1234 1234 1234 1234"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-700">Expiry</label>
              <input
                required
                className="w-full p-3 mt-1 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">CVC</label>
              <input
                required
                className="w-full p-3 mt-1 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">
                ZIP / Postal
              </label>
              <input
                required
                className="w-full p-3 mt-1 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Postal code"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm text-gray-700">
              Billing address
            </label>
            <input
              className="w-full p-3 mt-1 mb-2 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Street address"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                className="p-3 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="City"
              />
              <input
                className="p-3 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="State"
              />
              <input
                className="p-3 transition border rounded outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Country"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-lg font-medium">Total to pay</div>
            <div className="text-2xl font-bold">{formatPrice(subtotal)}</div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-3 bg-black text-white rounded-full font-semibold transition transform duration-150 hover:-translate-y-0.5 hover:shadow"
            >
              {processing ? "Processing..." : "Pay Now"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border rounded-full font-semibold transition transform duration-150 hover:-translate-y-0.5 hover:shadow"
            >
              Back
            </button>
          </div>
        </form>

        <aside className="p-6 bg-white rounded shadow">
          <h4 className="mb-4 text-lg font-semibold">Order Summary</h4>
          {cart.length === 0 ? (
            <div className="text-gray-500">No items in cart</div>
          ) : (
            <ul className="space-y-4">
              {cart.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        it.image || it.img || "https://via.placeholder.com/56"
                      }
                      alt={it.name || it.title}
                      className="object-cover w-12 h-12 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium">
                        {it.name || it.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {it.quantity || 1} x {formatPrice(it.price || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatPrice((it.price || 0) * (it.quantity || 1))}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-4 mt-6 border-t">
            <div className="flex items-center justify-between text-lg font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Shipping & taxes calculated at checkout
            </div>
            <button
              onClick={() => navigate("/order")}
              className="w-full py-3 mt-6 font-semibold text-white bg-indigo-600 rounded-full"
            >
              Proceed to Order
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
