import React, { useEffect, useState, useRef } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { Card, Button, ProgressBar } from "react-bootstrap";
import "../CSS/uploadImagesStyle.css";

export default function UploadImagesComp() {
  const { bikeId } = useParams();
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState(() => getAuthToken());
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    function onAuthChanged() {
      setAuthToken(getAuthToken());
    }
    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);
    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    };
  }, []);

  if (!authToken) return <Navigate to="/login" replace />;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSizeBytes = 5 * 1024 * 1024;

  const normalizeFiles = (fileList) => {
    const chosen = Array.from(fileList || []);
    const validated = [];
    for (const file of chosen) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Unsupported file type: ${file.name}`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        setError(`File too large (max 5MB): ${file.name}`);
        continue;
      }
      validated.push({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}_${file.size}_${Date.now()}`,
      });
    }
    return validated;
  };

  const onFileChange = (e) => {
    const mapped = normalizeFiles(e.target.files);
    if (mapped.length === 0 && files.length === 0) return;
    setFiles((prev) => [...prev, ...mapped]);
    setError(null);
    if (inputRef.current) inputRef.current.value = null;
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const mapped = normalizeFiles(e.dataTransfer.files);
    if (mapped.length) setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id) => {
    const f = files.find((x) => x.id === id);
    if (f && f.preview) URL.revokeObjectURL(f.preview);
    setFiles((prev) => prev.filter((x) => x.id !== id));
  };

  const clearAll = () => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  const handleUpload = async () => {
    if (!bikeId) {
      setError("Missing bike id");
      return;
    }
    if (files.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const url = `${base}/api/upload`;

      const formData = new FormData();
      formData.append("bike_id", bikeId);
      files.forEach((f) => formData.append("images", f.file));

      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        onUploadProgress: (evt) => {
          if (evt.total)
            setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      setFiles([]);

      navigate(`/bikes/${bikeId}`);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <main className="container py-4">
      <Card className="p-3 upload-images-card">
        <div className="upload-header mb-2">
          <div>
            <h5 className="upload-title">Upload your bike images</h5>
            <div className="small-muted">
              Add clear photos — closeups, full bike, & details. Up to 5MB each.
            </div>
          </div>
          <div className="small-muted">
            {files.length} {files.length === 1 ? "image" : "images"} selected
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="upload-body">
          <div
            className={`dropzone ${dragging ? "dragging" : ""}`}
            onClick={() => inputRef.current && inputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                inputRef.current && inputRef.current.click();
            }}
            aria-label="Add images by click or drag and drop"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M12 3v10"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 7l4-4 4 4"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="3"
                y="13"
                width="18"
                height="8"
                rx="2"
                stroke="#374151"
                strokeWidth="1.2"
              />
            </svg>
            <p style={{ margin: 0 }}>
              Drag & drop images here, or <strong>click to choose</strong>
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            style={{ display: "none" }}
          />

          <div className="file-grid">
            {files.map((f) => (
              <div className="thumb" key={f.id}>
                <div className="img-wrap" style={{ position: "relative" }}>
                  <img src={f.preview} alt={f.file.name} />
                  <button
                    className="remove-btn"
                    title="Remove"
                    onClick={() => removeFile(f.id)}
                    aria-label={`Remove ${f.file.name}`}
                  >
                    ×
                  </button>
                </div>
                <div className="meta" title={f.file.name}>
                  {f.file.name}
                </div>
              </div>
            ))}
          </div>

          {uploading && (
            <div style={{ marginTop: 12 }}>
              <ProgressBar
                now={progress}
                label={`${progress}%`}
                className="mb-2"
              />
              <div className="small-muted">
                Uploading — please keep this tab open until finished.
              </div>
            </div>
          )}
        </div>

        <div className="controls">
          <div className="left-controls">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(-1)}
              disabled={uploading}
            >
              Back
            </Button>
            <Button
              variant="outline-danger"
              onClick={clearAll}
              disabled={uploading || files.length === 0}
            >
              Clear
            </Button>
          </div>

          <Button
            variant="danger"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="upload-btn"
          >
            {uploading
              ? `Uploading (${progress}%)`
              : `Upload ${files.length > 0 ? `— ${files.length}` : ""}`}
          </Button>
        </div>
      </Card>
    </main>
  );
}
