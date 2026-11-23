import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { api } from "../api";
import "../style/Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password
        })
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Registration successful! Please log in."
        }
      });
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);

      setError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ub-register-page">
      <div className="ub-register-card">

        {/* LOGO */}
        <div className="ub-register-header">
          <div className="ub-register-logo">🍔</div>

          <h1>URBAN BITE</h1>
          <h2>Create Your Account</h2>

          <p>
            Join Urban Bite Kitchen and enjoy
            your favorite food and drinks.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="ub-register-error" role="alert">
            {error}
          </div>
        )}

        {/* REGISTRATION FORM */}
        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}
          <div className="ub-register-group">
            <label htmlFor="register-name">
              Full Name
            </label>

            <input
              id="register-name"
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          {/* EMAIL */}
          <div className="ub-register-group">
            <label htmlFor="register-email">
              Email Address
            </label>

            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* PHONE */}
          <div className="ub-register-group">
            <label htmlFor="register-phone">
              Phone Number
            </label>

            <input
              id="register-phone"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          {/* ROLE */}
          <div className="ub-register-group">
            <label htmlFor="register-role">
              Account Role
            </label>

            <select
              id="register-role"
              name="role"
              value={form.role}
              disabled
            >
              <option value="customer">Customer</option>
            </select>

            <small className="ub-register-hint">
              Administrator access is assigned separately.
            </small>
          </div>

          {/* PASSWORD */}
          <div className="ub-register-group">
            <label htmlFor="register-password">
              Password
            </label>

            <div className="ub-register-password">
              <input
                id="register-password"
                type={
                  showPassword ? "text" : "password"
                }
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="ub-register-eye"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? <EyeOff size={19} />
                  : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="ub-register-group">
            <label htmlFor="register-confirm">
              Confirm Password
            </label>

            <div className="ub-register-password">
              <input
                id="register-confirm"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="ub-register-eye"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
              >
                {showConfirmPassword
                  ? <EyeOff size={19} />
                  : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="ub-register-submit"
            disabled={loading}
          >
            <UserPlus size={19} />

            {loading
              ? "Creating Account..."
              : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="ub-register-login">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
