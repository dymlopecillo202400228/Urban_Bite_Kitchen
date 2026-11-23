import { Link } from "react-router-dom";
import "../style/Welcome.css";
export default function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-content">
        <span className="eyebrow">FRESH • HOT • DELICIOUS</span>
        <h1>WELCOME TO <br /><span>URBAN BITE KITCHEN</span></h1>
        <p>
          Delicious burgers, rice meals, snacks,
          desserts and refreshing drinks.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="primary-btn">
            Get Started
          </Link>
          <Link to="/login" className="outline-btn">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
