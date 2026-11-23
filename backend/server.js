import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";


import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://urban-bite-kitchen-one.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Urban Bite Kitchen API running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found."
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Urban Bite API running on port ${PORT}`);
});