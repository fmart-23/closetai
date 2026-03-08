import { useCallback, useEffect, useState } from "react";
import { getClothing, updateClothingItem } from "../services/api";
import ClothingCard from "../components/ClothingCard";

const CLOTHING_TYPES = [
  "T-Shirt", "Shirt", "Blouse", "Sweater", "Hoodie",
  "Jacket", "Coat", "Blazer", "Dress", "Skirt",
  "Jeans", "Pants", "Shorts", "Shoes", "Sneakers",
  "Boots", "Accessories",
];

const STYLES = ["Casual", "Formal", "Sporty", "Business", "Streetwear"];
const SEASONS = ["Summer", "Winter", "Fall", "Spring", "All-Season"];

export default function Closet() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    clothing_type: "",
    style: "",
    season: "",
    search: "",
  });
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const active = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "")
      );
      const data = await getClothing(active);
      setItems(data);
    } catch (err) {
      console.error("Failed to load clothing:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handleDelete = (deletedId) => {
    setItems((prev) => prev.filter((i) => i.id !== deletedId));
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const updated = await updateClothingItem(editItem.id, {
        name: editItem.name,
        clothing_type: editItem.clothing_type,
        color: editItem.color,
        style: editItem.style,
        season: editItem.season,
        brand: editItem.brand,
        notes: editItem.notes,
      });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setEditItem(null);
    } catch {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page closet-page">
      <div className="page-header">
        <h1>👗 My Closet</h1>
        <p>Browse, filter, and manage your wardrobe.</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 Search…"
          className="filter-search"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
        <select
          value={filters.clothing_type}
          onChange={(e) => handleFilterChange("clothing_type", e.target.value)}
        >
          <option value="">All Types</option>
          {CLOTHING_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filters.style}
          onChange={(e) => handleFilterChange("style", e.target.value)}
        >
          <option value="">All Styles</option>
          {STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.season}
          onChange={(e) => handleFilterChange("season", e.target.value)}
        >
          <option value="">All Seasons</option>
          {SEASONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn btn-ghost" onClick={() => setFilters({ clothing_type: "", style: "", season: "", search: "" })}>
          Clear Filters
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="page-loading">
          <div className="spinner" />
          <p>Loading wardrobe…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👗</div>
          <h2>No items found</h2>
          <p>
            {Object.values(filters).some(Boolean)
              ? "Try clearing your filters."
              : "Upload clothing photos to build your digital wardrobe."}
          </p>
          <a href="/upload" className="btn btn-primary">Upload Item</a>
        </div>
      ) : (
        <>
          <p className="results-count">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          <div className="clothing-grid">
            {items.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onEdit={setEditItem}
              />
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Item</h2>
              <button className="modal-close" onClick={() => setEditItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem((i) => ({ ...i, name: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={editItem.clothing_type || ""}
                    onChange={(e) => setEditItem((i) => ({ ...i, clothing_type: e.target.value }))}
                  >
                    <option value="">Select type</option>
                    {CLOTHING_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Style</label>
                  <select
                    value={editItem.style || ""}
                    onChange={(e) => setEditItem((i) => ({ ...i, style: e.target.value }))}
                  >
                    <option value="">Select style</option>
                    {STYLES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    value={editItem.color || ""}
                    onChange={(e) => setEditItem((i) => ({ ...i, color: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Season</label>
                  <select
                    value={editItem.season || ""}
                    onChange={(e) => setEditItem((i) => ({ ...i, season: e.target.value }))}
                  >
                    <option value="">Select season</option>
                    {SEASONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={editItem.brand || ""}
                  onChange={(e) => setEditItem((i) => ({ ...i, brand: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows={2}
                  value={editItem.notes || ""}
                  onChange={(e) => setEditItem((i) => ({ ...i, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
