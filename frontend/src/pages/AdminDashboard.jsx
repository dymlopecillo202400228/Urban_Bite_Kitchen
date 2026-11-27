import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Package,
  X,
  Save
} from "lucide-react";

import { api } from "../api";
import "../style/AdminDashboard.css";

const emptyForm = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  stock: "",
  image_url: "",
  is_active: true
};

function getArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.products)) return response.products;
  if (Array.isArray(response?.categories)) return response.categories;
  return [];
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productResponse, categoryResponse] =
        await Promise.all([
          api("/products/admin/all"),
          api("/products/categories")
        ]);

      const loadedProducts = getArray(productResponse);
      const loadedCategories = getArray(categoryResponse);

      setProducts(loadedProducts);
      setCategories(loadedCategories);

      console.log("ADMIN PRODUCTS:", loadedProducts);
      console.log("ADMIN CATEGORIES:", loadedCategories);
    } catch (err) {
      console.error("ADMIN LOAD ERROR:", err);
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = products.filter(
    (product) => product.is_active !== false
  ).length;

  const inactiveCount = products.filter(
    (product) => product.is_active === false
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      product.is_active !== false &&
      Number(product.stock) <= 10
  ).length;

  const filteredProducts = products.filter((product) =>
    String(product.name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  function categoryName(categoryId) {
    const category = categories.find(
      (item) =>
        String(item.id) === String(categoryId)
    );

    return category?.name || "Uncategorized";
  }

  function openAddModal() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category_id: String(product.category_id ?? ""),
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      image_url: product.image_url || "",
      is_active: product.is_active !== false
    });

    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));

    setFormError("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }

    // Match actual category ID from Supabase.
    // Supports numeric, UUID, and string IDs.
    const selectedCategory = categories.find(
      (category) =>
        String(category.id).trim() ===
        String(form.category_id ?? "").trim()
    );

    console.log("FORM CATEGORY ID:", form.category_id);
    console.log("SELECTED CATEGORY:", selectedCategory);
    console.log("AVAILABLE CATEGORIES:", categories);

    if (!selectedCategory) {
      setFormError(
        "Select a valid category. Please choose a category from the dropdown."
      );
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setFormError("Enter a valid price.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setFormError("Enter a valid stock quantity.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category_id: selectedCategory.id,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url.trim() || null,
      is_active: form.is_active
    };

    console.log("SENDING PRODUCT:", payload);

    setSaving(true);

    try {
      if (editingId !== null) {
        await api(`/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });

        setSuccess("Product updated successfully!");
      } else {
        await api("/products", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        setSuccess("Product added successfully!");
      }

      setShowModal(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await loadData();
    } catch (err) {
      console.error("SAVE PRODUCT ERROR:", err);
      setFormError(
        err.message || "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(product) {
    const confirmed = window.confirm(
      `Deactivate "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api(`/products/${product.id}`, {
        method: "DELETE"
      });

      setSuccess("Product deactivated successfully!");
      await loadData();
    } catch (err) {
      console.error("DEACTIVATE ERROR:", err);
      setError(
        err.message || "Failed to deactivate product."
      );
    }
  }

  return (
    <main className="ub-admin-page">
      <div className="ub-admin-container">

        <div className="ub-admin-header">
          <div>
            <p className="ub-admin-eyebrow">
              ADMINISTRATION
            </p>

            <h1>Product Management</h1>

            <p>
              Manage your food products and inventory.
            </p>
          </div>

          <button
            type="button"
            className="ub-admin-primary"
            onClick={openAddModal}
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        <div className="ub-admin-stats">
          {[
            {
              label: "Total Products",
              value: products.length
            },
            {
              label: "Active",
              value: activeCount
            },
            {
              label: "Inactive",
              value: inactiveCount
            },
            {
              label: "Low Stock",
              value: lowStockCount
            }
          ].map((stat) => (
            <div
              className="ub-admin-stat"
              key={stat.label}
            >
              <Package size={25} color="#f97316" />
              <p>{stat.label}</p>
              <h2>{stat.value}</h2>
            </div>
          ))}
        </div>

        <section className="ub-admin-panel">
          <div className="ub-admin-panel-header">
            <h2>All Products</h2>

            <div className="ub-admin-tools">
              <div className="ub-admin-search">
                <Search size={19} />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>

              <button
                type="button"
                className="ub-admin-outline"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="ub-admin-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="ub-admin-success">
              {success}
            </div>
          )}

          <div className="ub-admin-table-wrap">
            <table className="ub-admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6">Loading products...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="ub-admin-product">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span>🍔</span>
                          )}

                          <strong>{product.name}</strong>
                        </div>
                      </td>

                      <td>
                        {categoryName(product.category_id)}
                      </td>

                      <td>
                        ₱{Number(product.price).toFixed(2)}
                      </td>

                      <td>{product.stock}</td>

                      <td>
                        <span
                          className={
                            product.is_active !== false
                              ? "ub-status-active"
                              : "ub-status-inactive"
                          }
                        >
                          {product.is_active !== false
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="ub-admin-actions">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(product)
                            }
                          >
                            <Pencil size={16} />
                            Edit
                          </button>

                          {product.is_active !== false && (
                            <button
                              type="button"
                              className="ub-admin-danger-button"
                              onClick={() =>
                                handleDeactivate(product)
                              }
                            >
                              <Trash2 size={16} />
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showModal && (
        <div
          className="ub-admin-overlay"
          onClick={closeModal}
        >
          <div
            className="ub-admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              editingId !== null
                ? "Edit Product"
                : "Add Product"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ub-admin-modal-header">
              <h2>
                {editingId !== null
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="ub-admin-field">
                <label>Product Name</label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="ub-admin-field">
                <label>Category</label>

                <select
                  name="category_id"
                  value={String(form.category_id ?? "")}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={String(category.id)}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && (
                  <small>
                    No categories loaded. Check your
                    categories API.
                  </small>
                )}
              </div>

              <div className="ub-admin-field">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Product description"
                  rows={4}
                />
              </div>

              <div className="ub-admin-two-columns">
                <div className="ub-admin-field">
                  <label>Price (₱)</label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="ub-admin-field">
                  <label>Stock</label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div className="ub-admin-field">
                <label>Image URL</label>

                <input
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/food.jpg"
                />
              </div>

              {form.image_url && (
                <img
                  key={form.image_url}
                  className="ub-admin-preview"
                  src={form.image_url}
                  alt="Product preview"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <label className="ub-admin-checkbox">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                Product is active
              </label>

              {formError && (
                <div
                  className="ub-admin-error"
                  role="alert"
                >
                  {formError}
                </div>
              )}

              <div className="ub-admin-modal-actions">
                <button
                  type="button"
                  className="ub-admin-outline"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ub-admin-primary"
                  disabled={saving || categories.length === 0}
                >
                  <Save size={18} />

                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
