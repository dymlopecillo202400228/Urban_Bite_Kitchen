import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useShop } from "../context/ShopContext";
import "../style/Login.css";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useShop();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (!result.token || !result.user) {
        throw new Error("Invalid login response.");
      }

      login(result);
      navigate(result.user.role === "admin" ? "/admin" : "/menu", {
        replace: true
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🍔</div>
        <h1>URBAN BITE</h1>
        <h2>WELCOME BACK!</h2>

        {location.state?.message && (
          <p className="success-message">{location.state.message}</p>
        )}

        <form onSubmit={submit}>
          <label>Email Address</label>
          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email" required />

          <label>Password</label>
          <input type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password" required />

          <label className="show-password">
            <input type="checkbox" checked={showPassword}
              onChange={e => setShowPassword(e.target.checked)} />
            Show Password
          </label>

          {error && <p className="error">{error}</p>}

          <button className="primary-btn" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <p className="auth-bottom">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}
