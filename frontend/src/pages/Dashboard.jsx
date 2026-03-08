import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getClothing, getOutfits } from "../services/api";
import ClothingCard from "../components/ClothingCard";

export default function Dashboard() {
  const [recentItems, setRecentItems] = useState([]);
  const [outfitCount, setOutfitCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [items, outfits] = await Promise.all([getClothing(), getOutfits()]);
        setRecentItems(items.slice(0, 4));
        setOutfitCount(outfits.length);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Loading your closet…</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your AI-Powered Closet</h1>
          <p>
            Scan your clothes, organise your wardrobe, and get outfit
            recommendations tailored just for you.
          </p>
          <div className="hero-actions">
            <Link to="/upload" className="btn btn-primary">
              📷 Add Clothing
            </Link>
            <Link to="/outfits" className="btn btn-secondary">
              ✨ Get Outfit Ideas
            </Link>
          </div>
        </div>
        <div className="hero-illustration">👗</div>
      </section>

      {/* Stats */}
      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">👔</div>
          <div className="stat-value">{recentItems.length > 0 ? "—" : "0"}</div>
          <div className="stat-label">Items in Closet</div>
          <Link to="/closet" className="stat-link">View all →</Link>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-value">{outfitCount}</div>
          <div className="stat-label">Saved Outfits</div>
          <Link to="/outfits" className="stat-link">View all →</Link>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">AI</div>
          <div className="stat-label">Powered by OpenAI</div>
          <Link to="/upload" className="stat-link">Scan item →</Link>
        </div>
      </section>

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Recently Added</h2>
            <Link to="/closet" className="btn btn-ghost">See all →</Link>
          </div>
          <div className="clothing-grid">
            {recentItems.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onDelete={(id) =>
                  setRecentItems((prev) => prev.filter((i) => i.id !== id))
                }
              />
            ))}
          </div>
        </section>
      )}

      {recentItems.length === 0 && (
        <section className="empty-state">
          <div className="empty-icon">👗</div>
          <h2>Your closet is empty</h2>
          <p>Start by uploading photos of your clothing items.</p>
          <Link to="/upload" className="btn btn-primary">
            Upload Your First Item
          </Link>
        </section>
      )}
    </div>
  );
}
