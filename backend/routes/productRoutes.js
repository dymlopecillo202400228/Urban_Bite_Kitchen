import express from "express";
import { supabase } from "../config/supabase.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

function validId(value) {
  const id = String(value ?? "").trim();

  return (
    /^[1-9]\d*$/.test(id) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

function logError(label, error) {
  console.error(label, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint
  });
}

function validateProduct(body) {
  if (!String(body?.name || "").trim()) {
    return "Product name is required.";
  }

  if (
    body?.price === "" ||
    body?.price == null ||
    !Number.isFinite(Number(body.price)) ||
    Number(body.price) < 0
  ) {
    return "Enter a valid price.";
  }

  if (
    body?.stock === "" ||
    body?.stock == null ||
    !Number.isInteger(Number(body.stock)) ||
    Number(body.stock) < 0
  ) {
    return "Enter a valid stock quantity.";
  }

  if (
    body?.category_id === "" ||
    body?.category_id == null
  ) {
    return "Select a valid category.";
  }

  return null;
}

async function findCategory(categoryId) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

function makePayload(body, categoryId) {
  return {
    name: String(body.name).trim(),
    description: String(body.description || "").trim(),
    category_id: categoryId,
    price: Number(body.price),
    stock: Number(body.stock),
    image_url: String(body.image_url || "").trim() || null,
    is_active: body.is_active !== false
  };
}

router.get("/categories", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      logError("GET CATEGORIES ERROR:", error);
      return res.status(500).json({
        message: "Failed to load categories."
      });
    }

    return res.json(data || []);
  } catch (error) {
    logError("GET CATEGORIES SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error loading categories."
    });
  }
});

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      logError("ADMIN PRODUCTS ERROR:", error);
      return res.status(500).json({
        message: "Failed to load admin products."
      });
    }

    return res.json(data || []);
  } catch (error) {
    logError("ADMIN PRODUCTS SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error loading admin products."
    });
  }
});

router.get("/", async (req, res) => {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    const search = String(req.query.search || "").trim();

    if (search) {
      const cleaned = search.replace(/[%_,()]/g, "");
      if (cleaned) {
        query = query.ilike("name", `%${cleaned}%`);
      }
    }

    const category = String(req.query.category || "").trim();

    if (
      category &&
      category.toLowerCase() !== "all" &&
      category.toLowerCase() !== "all categories"
    ) {
      if (!validId(category)) {
        return res.status(422).json({
          message: "Invalid category ID."
        });
      }

      query = query.eq("category_id", category);
    }

    const { data, error } = await query.order("name");

    if (error) {
      logError("CUSTOMER PRODUCTS ERROR:", error);
      return res.status(500).json({
        message: "Failed to load menu."
      });
    }

    return res.json(data || []);
  } catch (error) {
    logError("CUSTOMER PRODUCTS SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error loading menu."
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(422).json({
        message: "Invalid product ID."
      });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      logError("GET PRODUCT ERROR:", error);
      return res.status(500).json({
        message: "Failed to load product."
      });
    }

    if (!data) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    return res.json(data);
  } catch (error) {
    logError("GET PRODUCT SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error loading product."
    });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const validationError = validateProduct(req.body);

    if (validationError) {
      return res.status(422).json({
        message: validationError
      });
    }

    const category = await findCategory(req.body.category_id);

    if (!category) {
      return res.status(422).json({
        message: "Selected category does not exist."
      });
    }

    const payload = makePayload(req.body, category.id);

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    if (error) {
      logError("ADD PRODUCT ERROR:", error);
      return res.status(500).json({
        message: "Failed to add product.",
        errorCode: error.code
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product: data
    });
  } catch (error) {
    logError("ADD PRODUCT SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error adding product."
    });
  }
});
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(422).json({
        message: "Invalid product ID."
      });
    }

    const validationError = validateProduct(req.body);

    if (validationError) {
      return res.status(422).json({
        message: validationError
      });
    }

    const category = await findCategory(req.body.category_id);

    if (!category) {
      return res.status(422).json({
        message: "Selected category does not exist."
      });
    }

    const { data, error } = await supabase
      .from("products")
      .update(makePayload(req.body, category.id))
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) {
      logError("UPDATE PRODUCT ERROR:", error);
      return res.status(500).json({
        message: "Failed to update product.",
        errorCode: error.code
      });
    }

    if (!data) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    return res.json({
      success: true,
      message: "Product updated successfully!",
      product: data
    });
  } catch (error) {
    logError("UPDATE PRODUCT SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error updating product."
    });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(422).json({
        message: "Invalid product ID."
      });
    }

    const { data, error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) {
      logError("DEACTIVATE PRODUCT ERROR:", error);
      return res.status(500).json({
        message: "Failed to deactivate product."
      });
    }

    if (!data) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    return res.json({
      success: true,
      message: "Product deactivated successfully!"
    });
  } catch (error) {
    logError("DEACTIVATE PRODUCT SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error deactivating product."
    });
  }
});

export default router;
