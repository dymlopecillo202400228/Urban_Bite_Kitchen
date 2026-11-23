
import { Routes, Route, Navigate } from "react-router-dom";
import { useShop } from "./context/ShopContext";

import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedRoute({ children, role }) {
  const { user } = useShop();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== role) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : "/menu"}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  const { user, authLoading } = useShop();

  if (authLoading) {
    return <div className="loading-screen">Loading Urban Bite...</div>;
  }

  const redirect = user?.role === "admin" ? "/admin" : "/menu";

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={
          user ? <Navigate to={redirect} replace /> : <Welcome />
        } />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={
          user ? <Navigate to={redirect} replace /> : <Login />
        } />
        <Route path="/register" element={
          user ? <Navigate to={redirect} replace /> : <Register />
        } />
        <Route path="/menu" element={
          <ProtectedRoute role="customer"><Menu /></ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute role="customer"><Cart /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute role="customer"><Checkout /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute role="customer"><Orders /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <Navigate to={user ? redirect : "/"} replace />
        } />
      </Routes>
    </>
  );
}
