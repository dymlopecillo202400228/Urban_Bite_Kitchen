import { Link } from "react-router-dom";
import { ArrowRight, ChefHat, Truck, Heart } from "lucide-react";
import "../style/Home.css";

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span>FRESH • DELICIOUS • URBAN</span>

          <h1>
            GOOD FOOD,
            <br />
            <em>GOOD MOOD!</em>
          </h1>

          <p>
            Satisfy your cravings with our handcrafted burgers,
            rice meals, and refreshing drinks.
          </p>

          <Link to="/menu" className="primary-btn">
            ORDER NOW <ArrowRight size={19} />
          </Link>
        </div>

        <div className="hero-food">🍔</div>
      </section>

      <section className="section">
        <div className="page-heading">
          <span>WHAT ARE YOU CRAVING?</span>
          <h2>EXPLORE OUR MENU</h2>
        </div>

        <div className="category-grid">
          <Link to="/menu" className="category-card">
            <div>🍔</div>
            <h3>BURGERS</h3>
            <p>Juicy and delicious</p>
          </Link>

          <Link to="/menu" className="category-card">
            <div>🥤</div>
            <h3>DRINKS</h3>
            <p>Cool and refreshing</p>
          </Link>

          <Link to="/menu" className="category-card">
            <div>🍚</div>
            <h3>RICE MEALS</h3>
            <p>Fresh and filling</p>
          </Link>
        </div>
      </section>

      <section className="features">
        <div>
          <ChefHat />
          <h3>Freshly Prepared</h3>
          <p>Delicious food made with care.</p>
        </div>

        <div>
          <Truck />
          <h3>Easy Ordering</h3>
          <p>Order your favorites in minutes.</p>
        </div>

        <div>
          <Heart />
          <h3>Made with Love</h3>
          <p>Quality food for every craving.</p>
        </div>
      </section>
    </main>
  );
}