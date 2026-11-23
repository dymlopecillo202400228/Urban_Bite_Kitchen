import express from "express";
import { supabase } from "../config/supabase.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
  "cancelled"
];

const NEXT_STATUSES = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["delivering"],
  delivering: ["delivered"],
  delivered: [],
  cancelled: []
};

// =====================================
// 1. CREATE ORDER - CUSTOMER CHECKOUT
// POST /api/orders
// =====================================
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access only."
      });
    }

    const {
      full_name,
      phone,
      delivery_address,
      items
    } = req.body;

    if (
      typeof full_name !== "string" ||
      typeof phone !== "string" ||
      typeof delivery_address !== "string" ||
      !full_name.trim() ||
      !phone.trim() ||
      !delivery_address.trim()
    ) {
      return res.status(422).json({
        success: false,
        message: "Complete all delivery information."
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 100
    ) {
      return res.status(422).json({
        success: false,
        message: "Your cart is empty or invalid."
      });
    }

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const seenProducts = new Set();

    const validItems = [];

    for (const item of items) {
      const productId = item.product_id ?? item.id;
      const quantity = Number(item.quantity);

      if (
        typeof productId !== "string" ||
        !uuidPattern.test(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 1000
      ) {
        return res.status(422).json({
          success: false,
          message: "Invalid product or quantity."
        });
      }

      if (seenProducts.has(productId)) {
        return res.status(422).json({
          success: false,
          message: "Duplicate products in cart."
        });
      }

      seenProducts.add(productId);

      validItems.push({
        product_id: productId,
        quantity
      });
    }

    // The PostgreSQL function must exist in Supabase.
    // It calculates prices, verifies stock,
    // creates the order and updates inventory.
    const { data, error: orderError } =
      await supabase.rpc("create_food_order", {
        p_user_id: req.user.id,
        p_full_name: full_name.trim(),
        p_phone: phone.trim(),
        p_delivery_address: delivery_address.trim(),
        p_items: validItems
      });

    if (orderError) {
      console.error("SUPABASE ORDER ERROR:", {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint
      });

      const schemaError =
        orderError.code === "PGRST202";

      return res.status(schemaError ? 503 : 500).json({
        success: false,
        message: schemaError
          ? "Order database function is missing or unavailable."
          : "Failed to create order.",
        ...(process.env.NODE_ENV !== "production"
          ? {
              detail: orderError.message,
              code: orderError.code
            }
          : {})
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: data
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
});

// =====================================
// 2. CUSTOMER ORDER HISTORY
// GET /api/orders/mine
// =====================================
router.get("/mine", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CUSTOMER ORDERS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load orders.",
        ...(process.env.NODE_ENV !== "production"
          ? { detail: error.message }
          : {})
      });
    }

    return res.json({
      success: true,
      orders: data || []
    });

  } catch (error) {
    console.error("ORDER HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
});

// =====================================
// 3. ADMIN - VIEW ALL ORDERS
// GET /api/orders/admin
// =====================================
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        users (
          full_name,
          email
        ),
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN ORDERS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load admin orders.",
        ...(process.env.NODE_ENV !== "production"
          ? { detail: error.message }
          : {})
      });
    }

    return res.json({
      success: true,
      orders: data || []
    });

  } catch (error) {
    console.error("ADMIN ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
});

// =====================================
// 4. ADMIN - UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
// =====================================
router.patch(
  "/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!ORDER_STATUSES.includes(status)) {
        return res.status(422).json({
          success: false,
          message: "Invalid order status."
        });
      }

      const { data: existingOrder, error: findError } =
        await supabase
          .from("orders")
          .select("id, status")
          .eq("id", id)
          .maybeSingle();

      if (findError) {
        console.error("FIND ORDER ERROR:", findError);

        return res.status(500).json({
          success: false,
          message: "Failed to find order."
        });
      }

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found."
        });
      }

      if (
        !NEXT_STATUSES[existingOrder.status]?.includes(status)
      ) {
        return res.status(409).json({
          success: false,
          message: `Cannot change order from ${existingOrder.status} to ${status}.`
        });
      }

      // Conditional update prevents overwriting a status
      // changed by another request.
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .eq("status", existingOrder.status)
        .select()
        .maybeSingle();

      if (error) {
        console.error("UPDATE ORDER ERROR:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to update order."
        });
      }

      if (!data) {
        return res.status(409).json({
          success: false,
          message: "Order status changed. Refresh and try again."
        });
      }

      return res.json({
        success: true,
        message: "Order status updated successfully.",
        order: data
      });

    } catch (error) {
      console.error("ORDER STATUS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error."
      });
    }
  }
);

export default router;
