
import { useEffect, useState } from "react";
import { api } from "../api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    try {
      const data = await api("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function saveUser(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await api(`/users/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          full_name: editing.full_name,
          phone: editing.phone
        })
      });

      setMessage(result.message);
      setEditing(null);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredUsers = users.filter((user) =>
    `${user.full_name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="ub-admin-management">
      <h2>Manage Users</h2>
      <p>View and update registered user information.</p>

      {error && <div className="ub-admin-error">{error}</div>}
      {message && <div className="ub-admin-success">{message}</div>}

      <input
        className="ub-admin-search"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {editing && (
        <form onSubmit={saveUser} className="ub-admin-form">
          <input
            value={editing.full_name}
            onChange={(e) =>
              setEditing({
                ...editing,
                full_name: e.target.value
              })
            }
            placeholder="Full name"
            required
          />

          <input
            value={editing.phone || ""}
            onChange={(e) =>
              setEditing({
                ...editing,
                phone: e.target.value
              })
            }
            placeholder="Phone"
          />

          <button>Save User</button>
          <button
            type="button"
            className="ub-admin-secondary"
            onClick={() => setEditing(null)}
          >
            Cancel
          </button>
        </form>
      )}

      <div className="ub-admin-table-wrap">
        <table className="ub-admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.phone || "—"}</td>
                <td>
                  <button
                    onClick={() => setEditing({ ...user })}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
