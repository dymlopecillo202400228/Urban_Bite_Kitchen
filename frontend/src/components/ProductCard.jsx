
import { ShoppingCart } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
  const { addToCart } = useShop();

  function add() {
    if (addToCart(product)) {
      alert(`${product.name} added to cart!`);
    } else {
      alert("Product unavailable.");
    }
  }

  return (
    <div className="product-card">
      <img
        src={product.image_url ||
          "https://placehold.co/500x350?text=Urban+Bite"}
        alt={product.name}
      />
      <div className="product-info">
        <span className="product-category">
          {product.categories?.name || "Food"}
        </span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-bottom">
          <strong>₱{Number(product.price).toFixed(2)}</strong>
          <span>Stock: {product.stock}</span>
        </div>
        <button className="primary-btn" onClick={add}
          disabled={product.stock < 1}>
          <ShoppingCart size={17} />
          {product.stock < 1 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
