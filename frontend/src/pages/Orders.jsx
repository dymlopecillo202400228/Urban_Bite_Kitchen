import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Download,
  RefreshCw,
  ShoppingBag,
  CalendarDays,
  MapPin,
  CreditCard,
  Package
} from "lucide-react";

import { api } from "../api";
import { downloadReceipt } from "../utils/receipt";
import "../style/Orders.css";

function getOrders(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.orders)) return response.orders;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.orders)) {
    return response.data.orders;
  }
  return [];
}

function getItems(order) {
  if (Array.isArray(order.order_items)) {
    return order.order_items;
  }

  if (Array.isArray(order.items)) {
    return order.items;
  }

  return [];
}

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatStatus(status) {
  return String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status) {
  const value = String(status || "pending").toLowerCase();

  if (value === "delivered") return "delivered";
  if (value === "cancelled" || value === "canceled") {
    return "cancelled";
  }
  if (value === "preparing" || value === "confirmed") {
    return "preparing";
  }
  if (value === "delivering" || value === "shipped") {
    return "delivering";
  }

  return "pending";
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api("/orders/mine");
      const orderList = getOrders(response);

      setOrders(
        [...orderList].sort((a, b) => {
          const first = new Date(a.created_at || 0).getTime();
          const second = new Date(b.created_at || 0).getTime();
          return second - first;
        })
      );
    } catch (err) {
      console.error("LOAD ORDERS ERROR:", err);

      setError(
        err.message ||
        "Failed to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function handleDownload(order) {
    setReceiptError("");
    setDownloadingId(order.id);

    try {
      const items = getItems(order);

      if (items.length === 0) {
        throw new Error(
          "Order items are missing. The orders API must return " +
          "order_items before a complete receipt can be downloaded."
        );
      }

      downloadReceipt({
        ...order,
        order_items: items
      });
    } catch (err) {
      console.error("RECEIPT ERROR:", err);
      setReceiptError(
        err.message || "Could not generate the receipt."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main className="ub-orders-page">
      <div className="ub-orders-container">
        <div className="ub-orders-heading">
          <div>
            <p className="ub-orders-eyebrow">
              YOUR PURCHASE HISTORY
            </p>

            <h1>My Orders</h1>

            <p>
              Track your orders and download your receipts.
            </p>
          </div>

          <button
            type="button"
            className="ub-orders-refresh"
            onClick={loadOrders}
            disabled={loading}
          >
            <RefreshCw size={18} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="ub-orders-error" role="alert">
            {error}
          </div>
        )}

        {receiptError && (
          <div className="ub-orders-error" role="alert">
            {receiptError}
          </div>
        )}

        {loading ? (
          <div className="ub-orders-empty">
            <Package size={42} />
            <h2>Loading your orders...</h2>
            <p>Please wait a moment.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="ub-orders-empty">
            <ShoppingBag size={48} />
            <h2>No orders yet</h2>
            <p>
              Your food orders will appear here after
              checkout.
            </p>

            <Link to="/menu" className="ub-orders-shop-btn">
              Browse Food Menu
            </Link>
          </div>
        ) : (
          <div className="ub-orders-list">
            {orders.map((order) => {
              const items = getItems(order);

              const calculatedTotal = items.reduce(
                (sum, item) => {
                  const quantity = Number(item.quantity || 1);
                  const price = Number(
                    item.unit_price ?? item.price ?? 0
                  );

                  return sum + quantity * price;
                },
                0
              );

              const total = Number(
                order.total_amount ??
                order.total ??
                calculatedTotal
              );

              return (
                <article
                  key={order.id}
                  className="ub-orders-card"
                >
                  <div className="ub-orders-card-header">
                    <div className="ub-orders-number">
                      <ClipboardList size={23} />

                      <div>
                        <span>ORDER NUMBER</span>
                        <h2>
                          #{String(order.id).slice(0, 8).toUpperCase()}
                        </h2>
                      </div>
                    </div>

                    <span
                      className={`ub-orders-status ${statusClass(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="ub-orders-meta">
                    <div>
                      <CalendarDays size={17} />
                      <span>
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div>
                      <CreditCard size={17} />
                      <span>Cash on Delivery</span>
                    </div>
                  </div>

                  {order.delivery_address && (
                    <div className="ub-orders-address">
                      <MapPin size={17} />
                      <span>{order.delivery_address}</span>
                    </div>
                  )}

                  <div className="ub-orders-items">
                    <h3>Ordered Items</h3>

                    {items.length === 0 ? (
                      <p className="ub-orders-muted">
                        Item details are not available from
                        the orders API.
                      </p>
                    ) : (
                      items.map((item, index) => {
                        const name =
                          item.product_name ||
                          item.name ||
                          item.products?.name ||
                          "Food Item";

                        const quantity = Number(
                          item.quantity || 1
                        );

                        const unitPrice = Number(
                          item.unit_price ?? item.price ?? 0
                        );

                        const subtotal = Number(
                          item.subtotal ??
                          item.line_total ??
                          quantity * unitPrice
                        );

                        return (
                          <div
                            className="ub-orders-item"
                            key={item.id || index}
                          >
                            <div>
                              <strong>{name}</strong>
                              <p>
                                {quantity} × {formatPrice(unitPrice)}
                              </p>
                            </div>

                            <strong>
                              {formatPrice(subtotal)}
                            </strong>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="ub-orders-footer">
                    <div className="ub-orders-total">
                      <span>Total Amount</span>
                      <strong>{formatPrice(total)}</strong>
                      <small>
                        Cash on Delivery — payment due
                        upon delivery
                      </small>
                    </div>

                    <button
                      type="button"
                      className="ub-orders-download"
                      onClick={() => handleDownload(order)}
                      disabled={
                        downloadingId === order.id ||
                        items.length === 0
                      }
                      title={
                        items.length === 0
                          ? "Order items must be loaded before downloading"
                          : "Download PDF receipt"
                      }
                    >
                      <Download size={18} />
                      {downloadingId === order.id
                        ? "Generating..."
                        : "Download Receipt"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
