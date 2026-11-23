import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import "../style/Menu.css";

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [productsResult, categoriesResult] =
          await Promise.all([
            api("/products"),
            api("/products/categories")
          ]);

        setProducts(
          Array.isArray(productsResult)
            ? productsResult
            : productsResult.products ||
              productsResult.data?.products || []
        );

        setCategories(
          Array.isArray(categoriesResult)
            ? categoriesResult
            : categoriesResult.categories ||
              categoriesResult.data?.categories || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      !category || String(product.category_id) === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="ub-menu-page">
      <section className="ub-menu-hero">
        <div className="ub-menu-hero-icon">
          <UtensilsCrossed size={25} />
        </div>

        <span className="ub-menu-eyebrow">
          FRESHLY PREPARED, MADE WITH LOVE
        </span>

        <h1>
          Discover Your Next <span>Favorite Bite.</span>
        </h1>

        <p>
          From juicy burgers to refreshing drinks, find
          something delicious for every craving.
        </p>
      </section>

      <main className="ub-menu-content">
        <div className="ub-menu-toolbar">
          <div className="ub-menu-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search your favorite food..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="ub-menu-select">
            <SlidersHorizontal size={19} />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ub-menu-section-heading">
          <div>
            <span className="ub-menu-small-label">
              EXPLORE OUR MENU
            </span>
            <h2>Something for Everyone</h2>
          </div>

          <span className="ub-menu-count">
            {filteredProducts.length} items
          </span>
        </div>

        {error && <p className="ub-menu-error">{error}</p>}

        {loading ? (
          <p className="ub-menu-loading">Loading delicious food...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="ub-menu-empty">
            <h3>No food found</h3>
            <p>Try another search or category.</p>
          </div>
        ) : (
          <div className="ub-menu-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
