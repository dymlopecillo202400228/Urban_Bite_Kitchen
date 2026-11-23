import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      full_name, email, phone, password,
      role = "customer"
    } = req.body || {};

    if (
      typeof full_name !== "string" ||
      !full_name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string"
    ) {
      return res.status(422).json({
        message: "Name, email and password are required."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(422).json({
        message: "Invalid email address."
      });
    }

    if (password.length < 8) {
      return res.status(422).json({
        message: "Password must be at least 8 characters."
      });
    }

    if (!["customer", "admin"].includes(role)) {
      return res.status(422).json({
        message: "Invalid role."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing, error: checkError } =
      await supabase.from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      return res.status(409).json({
        message: "Email already registered."
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    // Public registration cannot grant admin access.
    const { data, error } = await supabase
      .from("users")
      .insert({
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: typeof phone === "string"
          ? phone.trim() || null : null,
        password_hash,
        role: "customer"
      })
      .select("id, full_name, email, phone, role")
      .single();

    if (error) {
      console.error("REGISTER ERROR:", error);
      if (error.code === "23505") {
        return res.status(409).json({
          message: "Email already registered."
        });
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: role === "admin"
        ? "Account created. Admin access requires approval."
        : "Registration successful!",
      user: data
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Registration failed."
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() || !password
    ) {
      return res.status(422).json({
        message: "Email and password are required."
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, password_hash, role")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      console.error("LOGIN DATABASE ERROR:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      return res.status(500).json({
        message: "Database error during login. Check backend terminal."
      });
    }

    if (!user || !user.password_hash) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const validPassword = await bcrypt.compare(
      password, user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Login failed."
    });
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
