import { useEffect, useState } from "react";
import { api } from "../api";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCategories() {
    try {
      const data = await api("/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const endpoint = editingId
        ? `/categories/${editingId}`
        : "/categories";

      const result = await api(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({ name })
      });

      setMessage(result.message);
      setName("");
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return;

    setError("");
    setMessage("");

    try {
      const result = await api(`/categories/${id}`, {
        method: "DELETE"
      });

      setMessage(result.message);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="ub-admin-management">
      <h2>Manage Categories</h2>
      <p>Add and organize your food categories.</p>

      {error && <div className="ub-admin-error">{error}</div>}
      {message && <div className="ub-admin-success">{message}</div>}

      <form onSubmit={handleSubmit} className="ub-admin-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
        />

        <button disabled={loading}>
          {editingId ? "Save Changes" : "Add Category"}
        </button>

        {editingId && (
          <button
            type="button"
            className="ub-admin-secondary"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="ub-admin-table-wrap">
        <table className="ub-admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>
                  <div className="ub-admin-actions">
                    <button
                      onClick={() => {
                        setEditingId(category.id);
                        setName(category.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="ub-admin-danger"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
