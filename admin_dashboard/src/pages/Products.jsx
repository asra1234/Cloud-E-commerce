import AdminLayout from "../layouts/AdminLayout";
import { useEffect, useState } from "react";
import api from "../api";
import Toast from "../components/Toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [touched, setTouched] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // show 3-4 items per page as requested

  const fmt = (v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(v) || 0);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const r = await api.get("/products");
      setProducts(r.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to load products", type: "error" });
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) =>
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  const formatPrice = () => {
    if (form.price === "" || form.price === null || form.price === undefined)
      return;
    const n = Number(form.price) || 0;
    setForm((f) => ({ ...f, price: n % 1 === 0 ? String(n) : n.toFixed(2) }));
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", image: "", stock: "" });
    setIsEditing(false);
    setEditingId(null);
    setTouched({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price || 0),
        image: form.image || "",
        stock: parseInt(form.stock || 0, 10),
      };

      if (isEditing && editingId) {
        await api.put(`/products/${editingId}`, payload);
        setToast({ message: "Product updated", type: "success" });
      } else {
        await api.post("/products", payload);
        setToast({ message: "Product added", type: "success" });
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      setToast({ message: "Error saving product", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (p) => {
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price != null ? String(p.price) : "",
      image: p.image || "",
      stock: p.stock != null ? String(p.stock) : "",
    });
    setIsEditing(true);
    setEditingId(p.id);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const onDelete = async (id) => {
    const ok = window.confirm(
      "Delete this product? This action cannot be undone.",
    );
    if (!ok) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => {
        const next = prev.filter((x) => x.id !== id);
        const totalPages = Math.max(1, Math.ceil(next.length / itemsPerPage));
        if (currentPage > totalPages) setCurrentPage(totalPages);
        return next;
      });
      setToast({ message: "Product deleted", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to delete product", type: "error" });
    }
  };

  const isFormValid =
    form.name.trim() &&
    !Number.isNaN(Number(form.price)) &&
    Number(form.price) >= 0;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="text-sm text-gray-500">{products.length} items</div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="p-4 bg-white shadow rounded-xl">
            <h3 className="mb-4 font-medium">Product List</h3>

            {productsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 border rounded animate-pulse"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded" />
                      <div className="w-1/4 h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const totalPages = Math.max(
                    1,
                    Math.ceil(products.length / itemsPerPage),
                  );
                  const page = Math.min(currentPage, totalPages);
                  const start = (page - 1) * itemsPerPage;
                  const end = start + itemsPerPage;
                  const pageItems = products.slice(start, end);
                  return pageItems.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start justify-between gap-4 p-4 transition border rounded hover:shadow-sm"
                    >
                      <div className="flex items-start flex-1 min-w-0 gap-4">
                        <a
                          href={p.image || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0"
                        >
                          <img
                            src={p.image || "https://via.placeholder.com/120"}
                            alt={p.name}
                            className="object-cover w-24 h-24 border rounded sm:w-28 sm:h-28"
                            onError={(e) => {
                              try {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/120";
                              } catch {
                                /* empty */
                              }
                            }}
                          />
                        </a>

                        <div className="min-w-0">
                          <div className="text-lg font-medium truncate">
                            {p.name}
                          </div>
                          <div
                            className="text-sm text-gray-500 truncate"
                            style={{ maxWidth: "60ch" }}
                          >
                            {p.description}
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            {fmt(p.price)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 min-w-[210px] justify-end">
                        <div className="text-sm text-gray-500">
                          Stock: <span className="font-medium">{p.stock}</span>
                        </div>
                        <button
                          onClick={() => onEdit(p)}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ));
                })()}

                {products.length === 0 && (
                  <div className="text-gray-500">
                    No products yet. Add your first product.
                  </div>
                )}
                {/* Pagination controls */}
                {products.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Page{" "}
                      {Math.min(
                        currentPage,
                        Math.max(1, Math.ceil(products.length / itemsPerPage)),
                      )}{" "}
                      of{" "}
                      {Math.max(1, Math.ceil(products.length / itemsPerPage))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className="px-3 py-1 border rounded"
                      >
                        Prev
                      </button>
                      {Array.from({
                        length: Math.max(
                          1,
                          Math.ceil(products.length / itemsPerPage),
                        ),
                      }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-cyan-500 text-white" : "border"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(
                              Math.max(
                                1,
                                Math.ceil(products.length / itemsPerPage),
                              ),
                              p + 1,
                            ),
                          )
                        }
                        className="px-3 py-1 border rounded"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="p-4 bg-white shadow rounded-xl">
            <h3 className="mb-4 font-medium">
              {isEditing ? "Edit Product" : "Add Product"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-sm">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded"
                  aria-label="Product name"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-sm">Price</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    onBlur={(e) => {
                      handleBlur(e);
                      formatPrice();
                    }}
                    className="w-full px-3 py-2 border rounded"
                    aria-label="Product price"
                    required
                  />
                  {touched.price &&
                    (form.price === "" || Number.isNaN(Number(form.price))) && (
                      <div className="mt-1 text-sm text-red-600">
                        Enter a valid price ≥ 0
                      </div>
                    )}
                </div>

                <div>
                  <label className="block mb-1 text-sm">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border rounded"
                    aria-label="Product stock"
                    required
                  />
                  {touched.stock &&
                    (form.stock === "" || Number.isNaN(Number(form.stock))) && (
                      <div className="mt-1 text-sm text-red-600">
                        Enter a valid stock count ≥ 0
                      </div>
                    )}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">Image URL</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded"
                />
                {form.image && (
                  <div className="mt-2">
                    <img
                      src={form.image}
                      alt="preview"
                      className="object-cover border rounded w-36 h-36"
                      onError={(e) => {
                        try {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/180";
                        } catch {
                          /* empty */
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  aria-disabled={loading || !isFormValid}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                  <span>
                    {loading
                      ? isEditing
                        ? "Saving..."
                        : "Adding..."
                      : isEditing
                        ? "Save"
                        : "Add Product"}
                  </span>
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-2 border rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
    </AdminLayout>
  );
};

export default Products;
