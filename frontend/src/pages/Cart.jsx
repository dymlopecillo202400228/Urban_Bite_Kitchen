import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  CreditCard,
  ShieldCheck
} from "lucide-react";

import { useShop } from "../context/ShopContext";
import "../style/Cart.css";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart
  } = useShop();

  const formatPrice = value =>
    `₱${Number(value || 0).toFixed(2)}`;

  return (
    <main className="ub-cart-page">
      <div className="ub-cart-container">

        {/* PAGE HEADER */}
        <header className="ub-cart-header">
          <span className="ub-cart-label">
            YOUR FOOD BAG
          </span>

          <h1>
            My Shopping <span>Cart.</span>
          </h1>

          <p>
            Review your delicious picks before checkout.
          </p>
        </header>

        {cart.length === 0 ? (
          <section className="ub-cart-empty">
            <div className="ub-cart-empty-icon">
              <ShoppingBag size={42} />
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Looks like you haven't added any delicious
              food yet. Explore our menu!
            </p>

            <Link to="/menu" className="ub-cart-shop-btn">
              <ShoppingBag size={18} />
              Browse Menu
            </Link>
          </section>
        ) : (
          <div className="ub-cart-layout">

            {/* CART ITEMS */}
            <section className="ub-cart-items-section">

              <div className="ub-cart-items-header">
                <h2>
                  Cart Items
                  <span>{cartCount}</span>
                </h2>
              </div>

              <div className="ub-cart-items-list">
                {cart.map(item => (
                  <article
                    className="ub-cart-item"
                    key={item.id}
                  >
                    <div className="ub-cart-item-image">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                        />
                      ) : (
                        <div className="ub-cart-placeholder">
                          Urban Bite
                        </div>
                      )}
                    </div>

                    <div className="ub-cart-item-info">
                      <span className="ub-cart-item-category">
                        FRESHLY PREPARED
                      </span>

                      <h3>{item.name}</h3>

                      <p className="ub-cart-item-price">
                        {formatPrice(item.price)}
                      </p>

                      <div className="ub-cart-quantity">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus size={15} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          disabled={
                            item.quantity >= Number(item.stock)
                          }
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="ub-cart-item-right">
                      <button
                        type="button"
                        className="ub-cart-delete"
                        aria-label={`Remove ${item.name}`}
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        <Trash2 size={19} />
                      </button>

                      <strong>
                        {formatPrice(
                          Number(item.price) *
                          item.quantity
                        )}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>

              <Link
                to="/menu"
                className="ub-cart-continue"
              >
                <ArrowLeft size={17} />
                Continue Shopping
              </Link>
            </section>

            {/* ORDER SUMMARY */}
            <aside className="ub-cart-summary">
              <div className="ub-cart-summary-heading">
                <ShoppingBag size={21} />
                <h2>Order Summary</h2>
              </div>

              <div className="ub-cart-summary-row">
                <span>
                  Subtotal ({cartCount} items)
                </span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <div className="ub-cart-summary-row">
                <span>Payment Method</span>
                <span>Cash on Delivery</span>
              </div>

              <div className="ub-cart-summary-divider" />

              <div className="ub-cart-summary-total">
                <span>Estimated Total</span>
                <strong>
                  {formatPrice(cartTotal)}
                </strong>
              </div>

              <p className="ub-cart-summary-note">
                Final prices and stock are verified
                during checkout.
              </p>

              <button
                type="button"
                className="ub-cart-checkout-btn"
                onClick={() =>
                  navigate("/checkout")
                }
              >
                <CreditCard size={19} />
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <div className="ub-cart-secure">
                <ShieldCheck size={17} />
                <span>
                  Secure checkout • Cash on Delivery
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
