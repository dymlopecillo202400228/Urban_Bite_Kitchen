import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, MapPin, CreditCard } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { api } from "../api";
import "../style/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const shop = useShop();

  const { user } = shop;

  // Supports the existing cart context.
  const cart = shop.cart || shop.cartItems || [];

  const [fullName, setFullName] = useState(
    user?.full_name || ""
  );

  const [phone, setPhone] = useState(
    user?.phone || ""
  );

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const money = (amount) =>
    `₱${Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const cartItems = useMemo(() => {
    return cart.map((item) => {
      const product = item.product || item;

      return {
        product_id: item.product_id || product.id,
        name: product.name || "Food Product",
        price: Number(product.price || 0),
        quantity: Number(item.quantity || 1),
        image_url: product.image_url || ""
      };
    });
  }, [cart]);

  const estimatedTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !deliveryAddress.trim()
    ) {
      setError("Please complete all delivery details.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (
      cartItems.some(
        (item) =>
          !item.product_id ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      setError("Your cart contains an invalid product.");
      return;
    }

    const orderPayload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      delivery_address: deliveryAddress.trim(),
      payment_method: "cod",
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    try {
      setLoading(true);

      console.log("ORDER PAYLOAD:", orderPayload);

      const response = await api("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload)
      });

      console.log("ORDER RESPONSE:", response);

      if (response?.success === false) {
        throw new Error(
          response.detail || response.message ||
          "Failed to create order."
        );
      }

      // Clear cart only after confirmed success.
      if (typeof shop.clearCart === "function") {
        shop.clearCart();
      }

      navigate("/orders", {
        replace: true,
        state: {
          message: "Your order was placed successfully!"
        }
      });

    } catch (err) {
      console.error("CHECKOUT ERROR:", err);

      setError(
        err.detail ||
        err.message ||
        "Failed to place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ub-checkout-page">
      <div className="ub-checkout-heading">
        <span className="ub-eyebrow">SECURE CHECKOUT</span>
        <h1>Complete Your Order</h1>
        <p>
          Enter your delivery information and review
          your food order.
        </p>
      </div>

      <div className="ub-checkout-grid">
        <section className="ub-checkout-card">
          <h2>Delivery Details</h2>

          <form onSubmit={handlePlaceOrder}>
            <div className="ub-checkout-field">
              <label htmlFor="checkout-name">
                Full Name
              </label>

              <input
                id="checkout-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="ub-checkout-field">
              <label htmlFor="checkout-phone">
                Phone Number
              </label>

              <input
                id="checkout-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XXXXXXXXX"
                autoComplete="tel"
                required
              />
            </div>

            <div className="ub-checkout-field">
              <label htmlFor="checkout-address">
                Delivery Address
              </label>

              <textarea
                id="checkout-address"
                value={deliveryAddress}
                onChange={(e) =>
                  setDeliveryAddress(e.target.value)
                }
                placeholder="House number, street, barangay, city"
                rows={5}
                required
              />
            </div>

            <div className="ub-checkout-field">
              <label>Payment Method</label>

              <input
                type="text"
                value="Cash on Delivery"
                readOnly
              />
            </div>

            {error && (
              <div className="ub-checkout-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="ub-place-order"
              disabled={loading || cartItems.length === 0}
            >
              <ShoppingBag size={19} />

              {loading
                ? "PLACING ORDER..."
                : "PLACE ORDER"}
            </button>
          </form>
        </section>

        <aside className="ub-checkout-card ub-order-summary">
          <h2>Your Order</h2>

          {cartItems.length === 0 ? (
            <div className="ub-empty-cart">
              <p>Your cart is empty.</p>

              <button
                type="button"
                onClick={() => navigate("/menu")}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              <div className="ub-summary-items">
                {cartItems.map((item, index) => (
                  <div
                    className="ub-summary-item"
                    key={`${item.product_id}-${index}`}
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <strong>
                      {money(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="ub-summary-total">
                <strong>Estimated Total</strong>
                <strong>{money(estimatedTotal)}</strong>
              </div>

              <p className="ub-summary-note">
                Final prices and stock are verified by
                the backend.
              </p>

              <div className="ub-summary-info">
                <p>
                  <MapPin size={17} />
                  Delivery to your provided address
                </p>

                <p>
                  <CreditCard size={17} />
                  Cash on Delivery
                </p>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
