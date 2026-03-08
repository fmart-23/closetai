import { useState } from "react";
import { getImageUrl, deleteClothingItem } from "../services/api";

export default function ClothingCard({ item, onDelete, onEdit }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const imageUrl = getImageUrl(item.image_path);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteClothingItem(item.id);
      onDelete(item.id);
    } catch {
      alert("Failed to delete item.");
      setIsDeleting(false);
    }
  };

  const styleColor = {
    Casual: "#4ade80",
    Formal: "#a78bfa",
    Sporty: "#60a5fa",
    Business: "#fbbf24",
    Streetwear: "#f87171",
  };

  return (
    <div
      className="clothing-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="clothing-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <div className="clothing-card-placeholder">
            <span>👔</span>
          </div>
        )}
        {showActions && (
          <div className="clothing-card-actions">
            {onEdit && (
              <button
                className="btn-icon btn-edit"
                onClick={() => onEdit(item)}
                title="Edit"
              >
                ✏️
              </button>
            )}
            <button
              className="btn-icon btn-delete"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete"
            >
              {isDeleting ? "⏳" : "🗑️"}
            </button>
          </div>
        )}
      </div>

      <div className="clothing-card-body">
        <h3 className="clothing-card-name">{item.name}</h3>
        <div className="clothing-card-meta">
          {item.clothing_type && (
            <span className="tag tag-type">{item.clothing_type}</span>
          )}
          {item.color && (
            <span className="tag tag-color">
              <span
                className="color-dot"
                style={{ background: item.color.toLowerCase() }}
              />
              {item.color}
            </span>
          )}
          {item.style && (
            <span
              className="tag tag-style"
              style={{ background: styleColor[item.style] || "#e2e8f0" }}
            >
              {item.style}
            </span>
          )}
          {item.season && <span className="tag tag-season">{item.season}</span>}
        </div>
        {item.description && (
          <p className="clothing-card-desc">{item.description}</p>
        )}
      </div>
    </div>
  );
}
