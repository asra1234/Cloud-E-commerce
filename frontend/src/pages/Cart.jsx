import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  function persist(c) {
    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
  }

  function remove(idx) {
    const c = [...cart];
    c.splice(idx, 1);
    persist(c);
  }

  function updateQty(idx, q) {
    const c = [...cart];
    c[idx].quantity = Math.max(1, q);
    persist(c);
  }

  function changeQty(idx, delta) {
    const q = (cart[idx].quantity || 1) + delta;
    updateQty(idx, q);
  }

  const subtotal = cart.reduce(
    (s, it) => s + (it.price || 0) * (it.quantity || 1),
    0
  );

  function applyCoupon(e) {
    e.preventDefault();
    // placeholder: no real coupon logic, just clear input
    setCoupon("");
    alert("Coupon applied (demo)");
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6">
        <span className="mr-2">Home</span>
        <span className="mx-2">›</span>
        <span>Shopping Cart</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border rounded">
            <div className="grid grid-cols-4 gap-4 p-4 border-b font-semibold text-sm text-gray-700">
              <div>PRODUCT</div>
              <div className="text-center">PRICE</div>
              <div className="text-center">QUANTITY</div>
              <div className="text-right">TOTAL</div>
            </div>

            <div>
              {cart.length === 0 ? (
                <div className="p-6 text-gray-500">Your cart is empty.</div>
              ) : (
                cart.map((it, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center p-6 border-b transform transition duration-200 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          it.image || it.img || "https://via.placeholder.com/80"
                        }
                        alt={it.name || it.title}
                        className="w-20 h-20 object-cover rounded transition-transform duration-300 hover:scale-105"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {it.name || it.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {it.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-gray-700">
                      ${(it.price || 0).toFixed(2)}
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        className="px-3 py-1 border rounded-l transition transform duration-150 hover:bg-gray-100"
                        onClick={() => changeQty(idx, -1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={it.quantity || 1}
                        onChange={(e) =>
                          updateQty(idx, parseInt(e.target.value) || 1)
                        }
                        className="w-16 text-center border-t border-b focus:ring-2 focus:ring-indigo-200 outline-none"
                      />
                      <button
                        className="px-3 py-1 border rounded-r transition transform duration-150 hover:bg-gray-100"
                        onClick={() => changeQty(idx, 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-gray-800 font-medium">
                        ${((it.price || 0) * (it.quantity || 1)).toFixed(2)}
                      </div>
                      <button
                        className="text-sm text-red-600 mt-2 transition-colors duration-150 hover:text-red-700"
                        onClick={() => remove(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 flex items-center gap-4">
              <input
                type="text"
                placeholder="Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 border rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
              <button
                onClick={applyCoupon}
                className="px-6 py-3 bg-gray-200 rounded-full font-semibold transition transform duration-150 hover:-translate-y-0.5 hover:shadow"
              >
                APPLY COUPON
              </button>
              <button
                onClick={() => persist(cart)}
                className="px-6 py-3 border rounded-full font-semibold transition transform duration-150 hover:-translate-y-0.5 hover:shadow"
              >
                UPDATE CART
              </button>
            </div>
          </div>
        </div>

        <aside>
          <div className="bg-white border rounded p-6">
            <h4 className="text-lg font-semibold mb-4">CART TOTALS</h4>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Shipping: There are no shipping methods available. Please double
              check your address, or contact us if you need any help.
            </div>

            <div className="mb-6">
              <select className="w-full border p-2 mb-3">
                <option>Select a country...</option>
              </select>
              <input
                className="w-full border p-2 mb-3"
                placeholder="State / country"
              />
              <input
                className="w-full border p-2"
                placeholder="Postcode / Zip"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-medium">Total:</div>
              <div className="text-lg font-semibold">
                ${subtotal.toFixed(2)}
              </div>
            </div>

            <button
              onClick={() => navigate("/order")}
              className="mt-6 w-full py-4 bg-black text-white rounded-full font-semibold"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
