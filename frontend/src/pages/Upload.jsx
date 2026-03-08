import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadClothing } from "../services/api";

const ACCEPTED_TYPES = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] };

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState({ name: "", brand: "", notes: "" });
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (!accepted.length) return;
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image first.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const item = await uploadClothing(file, metadata);
      setResult(item);
      setFile(null);
      setPreview(null);
      setMetadata({ name: "", brand: "", notes: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setMetadata({ name: "", brand: "", notes: "" });
  };

  return (
    <div className="page upload-page">
      <div className="page-header">
        <h1>📷 Add Clothing Item</h1>
        <p>Upload a photo and let AI classify your clothing automatically.</p>
      </div>

      {result ? (
        // ── Success state ─────────────────────────────────────────────────────
        <div className="upload-success">
          <div className="success-icon">✅</div>
          <h2>Item Added!</h2>
          <div className="result-card">
            <h3>{result.name}</h3>
            <div className="result-tags">
              {result.clothing_type && (
                <span className="tag tag-type">{result.clothing_type}</span>
              )}
              {result.color && (
                <span className="tag tag-color">{result.color}</span>
              )}
              {result.pattern && (
                <span className="tag">{result.pattern}</span>
              )}
              {result.style && (
                <span className="tag tag-style">{result.style}</span>
              )}
              {result.season && (
                <span className="tag tag-season">{result.season}</span>
              )}
            </div>
            {result.description && (
              <p className="result-desc">{result.description}</p>
            )}
          </div>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={handleReset}>
              Add Another Item
            </button>
            <a href="/closet" className="btn btn-secondary">
              View My Closet
            </a>
          </div>
        </div>
      ) : (
        // ── Upload form ───────────────────────────────────────────────────────
        <form className="upload-form" onSubmit={handleSubmit}>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "dropzone-active" : ""} ${
              preview ? "dropzone-has-image" : ""
            }`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="dropzone-preview"
              />
            ) : isDragActive ? (
              <div className="dropzone-content">
                <span className="dropzone-icon">📂</span>
                <p>Drop it here!</p>
              </div>
            ) : (
              <div className="dropzone-content">
                <span className="dropzone-icon">📷</span>
                <p>
                  <strong>Drag & drop</strong> a photo here, or{" "}
                  <span className="dropzone-link">click to browse</span>
                </p>
                <p className="dropzone-hint">
                  Supports JPG, PNG, WEBP · Max 10 MB
                </p>
              </div>
            )}
          </div>

          {/* Optional metadata */}
          <div className="form-group">
            <label htmlFor="name">Item Name (optional)</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Blue Summer Dress"
              value={metadata.name}
              onChange={(e) =>
                setMetadata((m) => ({ ...m, name: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="brand">Brand (optional)</label>
            <input
              id="brand"
              type="text"
              placeholder="e.g. Zara"
              value={metadata.brand}
              onChange={(e) =>
                setMetadata((m) => ({ ...m, brand: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Any additional notes…"
              value={metadata.notes}
              onChange={(e) =>
                setMetadata((m) => ({ ...m, notes: e.target.value }))
              }
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-primary btn-full"
            type="submit"
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner-sm" /> Classifying with AI…
              </>
            ) : (
              "🤖 Classify & Save to Closet"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
