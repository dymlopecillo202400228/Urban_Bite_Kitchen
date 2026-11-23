import express from "express";
import { supabase } from "../config/supabase.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get users:", error);
    return res.status(500).json({
      message: "Failed to load users."
    });
  }

  res.json(data || []);
});


router.put("/:id", async (req, res) => {
  const { full_name, phone } = req.body || {};

  if (!String(full_name || "").trim()) {
    return res.status(422).json({
      message: "Full name is required."
    });
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      full_name: String(full_name).trim(),
      phone: String(phone || "").trim() || null
    })
    .eq("id", req.params.id)
    .select("id, full_name, email, phone, role")
    .maybeSingle();

  if (error) {
    console.error("Update user:", error);
    return res.status(500).json({
      message: "Failed to update user."
    });
  }

  if (!data) {
    return res.status(404).json({
      message: "User not found."
    });
  }

  res.json({
    message: "User updated successfully.",
    user: data
  });
});

export default router;
