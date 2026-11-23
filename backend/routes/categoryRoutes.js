import express from "express";
import { supabase } from "../config/supabase.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);

// GET ALL CATEGORIES
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Categories:", error);
    return res.status(500).json({
      message: "Failed to load categories."
    });
  }

  res.json(data || []);
});

// ADD CATEGORY
router.post("/", async (req, res) => {
  const name = String(req.body?.name || "").trim();

  if (!name) {
    return res.status(422).json({
      message: "Category name is required."
    });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error("Add category:", error);

    return res.status(error.code === "23505" ? 409 : 500).json({
      message: error.code === "23505"
        ? "Category already exists."
        : "Failed to add category."
    });
  }

  res.status(201).json({
    message: "Category added successfully.",
    category: data
  });
});

// UPDATE CATEGORY
router.put("/:id", async (req, res) => {
  const name = String(req.body?.name || "").trim();

  if (!name) {
    return res.status(422).json({
      message: "Category name is required."
    });
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Update category:", error);

    return res.status(error.code === "23505" ? 409 : 500).json({
      message: error.code === "23505"
        ? "Category name already exists."
        : "Failed to update category."
    });
  }

  if (!data) {
    return res.status(404).json({
      message: "Category not found."
    });
  }

  res.json({
    message: "Category updated successfully.",
    category: data
  });
});

// DELETE CATEGORY
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const { count, error: checkError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (checkError) {
    console.error("Check category products:", checkError);
    return res.status(500).json({
      message: "Failed to check category products."
    });
  }

  if (count > 0) {
    return res.status(409).json({
      message: "This category contains products. Move those products to another category first."
    });
  }

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Delete category:", error);
    return res.status(error.code === "23503" ? 409 : 500).json({
      message: error.code === "23503"
        ? "This category is still in use."
        : "Failed to delete category."
    });
  }

  if (!data) {
    return res.status(404).json({
      message: "Category not found."
    });
  }

  res.json({
    message: "Category deleted successfully."
  });
});

export default router;
