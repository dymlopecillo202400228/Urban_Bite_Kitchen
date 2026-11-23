import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please login first."
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET
    );
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, role")
      .eq("id", decoded.id)
      .maybeSingle();

    if (error) {
      console.error("AUTH DATABASE ERROR:", error);
      return res.status(500).json({
        message: "Database error verifying account."
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Account not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(500).json({
      message: "Authentication failed."
    });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only."
    });
  }
  next();
}

export function customerOnly(req, res, next) {
  if (req.user?.role !== "customer") {
    return res.status(403).json({
      message: "Customer access only."
    });
  }
  next();
}
