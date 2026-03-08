import { useEffect, useState } from "react";
import { recommendOutfit, saveOutfit, getOutfits, deleteOutfit } from "../services/api";
import OutfitCard from "../components/OutfitCard";

const OCCASIONS = ["Casual", "Work", "Date Night", "Formal Event", "Gym", "Travel", "Party"];
const WEATHERS = ["Hot", "Warm", "Mild", "Cool", "Cold", "Rainy"];
const STYLES = ["Classic", "Trendy", "Minimalist", "Bold", "Romantic", "Sporty"];

export default function Outfits() {
  const [tab, setTab] = useState("recommend"); // "recommend" | "saved"
  const [form, setForm] = useState({
    occasion: "Casual",
    weather: "Mild",
    style_preference: "Classic",
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [error, setError] = useState(null);

  const loadSaved = async () => {
    setLoadingSaved(true);
    try {
      const data = await getOutfits();
      setSavedOutfits(data);
    } catch (err) {
      console.error("Failed to load outfits:", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (tab === "saved") loadSaved();
  }, [tab]);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendation(null);
    try {
      const result = await recommendOutfit({
        occasion: form.occasion,
        weather: form.weather,
        style_preference: form.style_preference,
      });
      setRecommendation(result);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to get recommendation. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!recommendation) return;
    setSaving(true);
    try {
      await saveOutfit({
        name: `${form.occasion} Outfit`,
        occasion: form.occasion,
        weather: form.weather,
        style_preference: form.style_preference,
        item_ids: recommendation.item_ids,
        description: recommendation.description,
        styling_tips: recommendation.styling_tips,
      });
      alert("Outfit saved! 🎉");
      setTab("saved");
    } catch {
      alert("Failed to save outfit.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOutfit = async (id) => {
    try {
      await deleteOutfit(id);
      setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Failed to delete outfit.");
    }
  };

  return (
    <div className="page outfits-page">
      <div className="page-header">
        <h1>✨ Outfits</h1>
        <p>Get AI-powered outfit suggestions or browse your saved looks.</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${tab === "recommend" ? "tab-active" : ""}`}
          onClick={() => setTab("recommend")}
        >
          🤖 Get Recommendation
        </button>
        <button
          className={`tab ${tab === "saved" ? "tab-active" : ""}`}
          onClick={() => setTab("saved")}
        >
          💾 Saved Outfits
        </button>
      </div>

      {/* Recommend Tab */}
      {tab === "recommend" && (
        <div className="recommend-section">
          <form className="recommend-form" onSubmit={handleRecommend}>
            <div className="form-row">
              <div className="form-group">
                <label>Occasion</label>
                <select
                  value={form.occasion}
                  onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))}
                >
                  {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Weather</label>
                <select
                  value={form.weather}
                  onChange={(e) => setForm((f) => ({ ...f, weather: e.target.value }))}
                >
                  {WEATHERS.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Style</label>
                <select
                  value={form.style_preference}
                  onChange={(e) => setForm((f) => ({ ...f, style_preference: e.target.value }))}
                >
                  {STYLES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-sm" /> Generating outfit…</>
              ) : (
                "✨ Generate Outfit"
              )}
            </button>
          </form>

          {error && <div className="alert alert-error">{error}</div>}

          {recommendation && (
            <div className="recommendation-result">
              <h2>Your Outfit ✨</h2>
              <div className="outfit-items-grid">
                {(recommendation.items || []).map((item) => {
                  const imgUrl = item.image_path
                    ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${item.image_path}`
                    : null;
                  return (
                    <div key={item.id} className="outfit-item-thumb">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.name} loading="lazy" />
                      ) : (
                        <div className="outfit-item-placeholder">
                          <span>👔</span>
                        </div>
                      )}
                      <span className="outfit-item-label">
                        {item.clothing_type || item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              {recommendation.description && (
                <p className="outfit-description">{recommendation.description}</p>
              )}
              {recommendation.styling_tips && (
                <div className="outfit-tips">
                  <span className="tips-icon">💡</span>
                  <p>{recommendation.styling_tips}</p>
                </div>
              )}
              <div className="recommendation-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "💾 Save Outfit"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleRecommend}
                  disabled={loading}
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}

          {!recommendation && !loading && !error && (
            <div className="empty-state empty-state-sm">
              <div className="empty-icon">✨</div>
              <p>Fill in your preferences and click <strong>Generate Outfit</strong> to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Saved Tab */}
      {tab === "saved" && (
        <div className="saved-section">
          {loadingSaved ? (
            <div className="page-loading">
              <div className="spinner" />
              <p>Loading saved outfits…</p>
            </div>
          ) : savedOutfits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💾</div>
              <h2>No saved outfits yet</h2>
              <p>Generate an outfit recommendation and save it here!</p>
              <button className="btn btn-primary" onClick={() => setTab("recommend")}>
                Get Recommendation
              </button>
            </div>
          ) : (
            <div className="outfits-grid">
              {savedOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onDelete={handleDeleteOutfit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
