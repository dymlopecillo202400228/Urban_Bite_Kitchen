
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Package, LogOut,
  ClipboardList, UtensilsCrossed
} from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function Navbar() {
  const { user, logout, cartCount } = useShop();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <Link className="brand" to={
        user?.role === "admin" ? "/admin" : user ? "/menu" : "/"
      }>
        🍔 URBAN <span>BITE</span>
      </Link>

      <div className="nav-links">
        {user?.role === "admin" ? (
          <>
            <NavLink to="/admin">
              <Package size={17} /> Manage Products
            </NavLink>
            <button onClick={handleLogout}>
              <LogOut size={17} /> Logout
            </button>
          </>
        ) : user?.role === "customer" ? (
          <>
            <NavLink to="/menu">
              <UtensilsCrossed size={17} /> Menu
            </NavLink>
            <NavLink to="/cart">
              <ShoppingCart size={17} /> Cart ({cartCount})
            </NavLink>
            <NavLink to="/orders">
              <ClipboardList size={17} /> Orders
            </NavLink>
            <button onClick={handleLogout}>
              <LogOut size={17} /> Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
