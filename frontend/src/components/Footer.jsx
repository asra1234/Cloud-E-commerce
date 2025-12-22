import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-semibold mb-4">CATEGORIES</h4>
            <ul className="space-y-3">
              <li className="hover:text-white cursor-pointer">Women</li>
              <li className="hover:text-white cursor-pointer">Men</li>
              <li className="hover:text-white cursor-pointer">Shoes</li>
              <li className="hover:text-white cursor-pointer">Watches</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">HELP</h4>
            <ul className="space-y-3">
              <li className="hover:text-white cursor-pointer">Track Order</li>
              <li className="hover:text-white cursor-pointer">Returns</li>
              <li className="hover:text-white cursor-pointer">Shipping</li>
              <li className="hover:text-white cursor-pointer">FAQs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">GET IN TOUCH</h4>
            <p className="text-sm text-gray-400 mb-4">
              Any questions? Let us know in store at 8th floor, 379 Hudson St,
              New York, NY 10018 or call us on (+1) 96 716 6879
            </p>
            <div className="flex items-center space-x-3 text-gray-400 mb-4">
              <a className="hover:text-white" aria-label="facebook">
                🔵
              </a>
              <a className="hover:text-white" aria-label="instagram">
                🟣
              </a>
              <a className="hover:text-white" aria-label="pinterest">
                🔴
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">NEWSLETTER</h4>
            <p className="text-sm text-gray-400 mb-4">
              Get timely updates about new products and offers.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full sm:flex-1 px-4 py-2 rounded-md bg-gray-800 placeholder-gray-400 border border-gray-700 text-gray-100"
              />
              <button className="px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://via.placeholder.com/60x20?text=PayPal"
                alt="paypal"
                className="h-5"
              />
              <img
                src="https://via.placeholder.com/60x20?text=VISA"
                alt="visa"
                className="h-5"
              />
              <img
                src="https://via.placeholder.com/60x20?text=Master"
                alt="mastercard"
                className="h-5"
              />
              <img
                src="https://via.placeholder.com/60x20?text=AmEx"
                alt="amex"
                className="h-5"
              />
            </div>
            <div className="text-sm text-gray-400">
              Copyright ©{new Date().getFullYear()} All rights reserved | This
              template is made with ❤ by CloudRetail
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
