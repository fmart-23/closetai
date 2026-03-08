import { getImageUrl } from "../services/api";

export default function OutfitCard({ outfit, onDelete }) {
  const handleDelete = async () => {
    if (!window.confirm("Remove this saved outfit?")) return;
    onDelete(outfit.id);
  };

  return (
    <div className="outfit-card">
      <div className="outfit-card-header">
        <h3>{outfit.name || "Outfit"}</h3>
        <div className="outfit-card-badges">
          {outfit.occasion && (
            <span className="badge badge-occasion">{outfit.occasion}</span>
          )}
          {outfit.weather && (
            <span className="badge badge-weather">{outfit.weather}</span>
          )}
        </div>
      </div>

      <div className="outfit-items-grid">
        {(outfit.items || []).map((item) => {
          const imgUrl = getImageUrl(item.image_path);
          return (
            <div key={item.id} className="outfit-item-thumb">
              {imgUrl ? (
                <img src={imgUrl} alt={item.name} loading="lazy" />
              ) : (
                <div className="outfit-item-placeholder">
                  <span>👔</span>
                </div>
              )}
              <span className="outfit-item-label">{item.clothing_type || item.name}</span>
            </div>
          );
        })}
        {(!outfit.items || outfit.items.length === 0) && (
          <p className="no-items-msg">No items found for this outfit.</p>
        )}
      </div>

      {outfit.description && (
        <p className="outfit-description">{outfit.description}</p>
      )}
      {outfit.styling_tips && (
        <div className="outfit-tips">
          <span className="tips-icon">💡</span>
          <p>{outfit.styling_tips}</p>
        </div>
      )}

      <div className="outfit-card-footer">
        {onDelete && (
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
