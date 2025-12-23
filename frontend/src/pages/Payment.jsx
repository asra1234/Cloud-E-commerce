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
      <div className="container mx-auto px-4 py-10">
        <div className="bg-white p-8 rounded shadow-md max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto mb-4">
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
          <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
          <p className="text-gray-600 mb-4">
            Thank you — your payment has been processed.
          </p>
          <div className="bg-gray-50 p-4 rounded mb-6">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Order ID</span>
              <strong>{successOrder.orderId}</strong>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
              <span>Amount Paid</span>
              <strong>{formatPrice(successOrder.total)}</strong>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
              <span>Status</span>
              <strong className="text-green-600">{successOrder.status}</strong>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              to="/products"
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate("/order")}
              className="px-6 py-3 border rounded-full font-semibold"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6">
        <span className="mr-2">Home</span>
        <span className="mx-2">›</span>
        <span>Checkout</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form
          onSubmit={handlePay}
          className="lg:col-span-2 bg-white p-6 rounded shadow"
        >
          <h3 className="text-2xl font-bold mb-4">Payment Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">
                Name on card
              </label>
              <input
                required
                className="w-full border p-3 rounded mt-1"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                required
                className="w-full border p-3 rounded mt-1"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-700">Card number</label>
            <input
              required
              maxLength={19}
              className="w-full border p-3 rounded mt-1"
              placeholder="1234 1234 1234 1234"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-700">Expiry</label>
              <input
                required
                className="w-full border p-3 rounded mt-1"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">CVC</label>
              <input
                required
                className="w-full border p-3 rounded mt-1"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">
                ZIP / Postal
              </label>
              <input
                required
                className="w-full border p-3 rounded mt-1"
                placeholder="Postal code"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm text-gray-700">
              Billing address
            </label>
            <input
              className="w-full border p-3 rounded mt-1 mb-2"
              placeholder="Street address"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input className="border p-3 rounded" placeholder="City" />
              <input className="border p-3 rounded" placeholder="State" />
              <input className="border p-3 rounded" placeholder="Country" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-lg font-medium">Total to pay</div>
            <div className="text-2xl font-bold">{formatPrice(subtotal)}</div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-3 bg-black text-white rounded-full font-semibold"
            >
              {processing ? "Processing..." : "Pay Now"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border rounded-full font-semibold"
            >
              Back
            </button>
          </div>
        </form>

        <aside className="bg-white p-6 rounded shadow">
          <h4 className="text-lg font-semibold mb-4">Order Summary</h4>
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
                      className="w-12 h-12 object-cover rounded"
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

          <div className="border-t mt-6 pt-4">
            <div className="flex items-center justify-between text-lg font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Shipping & taxes calculated at checkout
            </div>
            <button
              onClick={() => navigate("/order")}
              className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-full font-semibold"
            >
              Proceed to Order
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
