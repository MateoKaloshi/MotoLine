import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { Card, Button, ProgressBar } from "react-bootstrap";

export default function UploadImagesComp() {
  const { bikeId } = useParams();
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState(() => getAuthToken());
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    function onAuthChanged() { setAuthToken(getAuthToken()); }
    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);
    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, []);

  if (!authToken) return <Navigate to="/login" replace />;

  const onFileChange = (e) => {
    const chosen = Array.from(e.target.files || []);
    const mapped = chosen.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setFiles(prev => [...prev, ...mapped]);
    setError(null);
  };

  const removeFile = idx => {
    URL.revokeObjectURL(files[idx].preview);
    setFiles(prev => prev.filter((_, i) => i !== idx));
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
      files.forEach(f => formData.append("images", f.file));

      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        onUploadProgress: (evt) => { if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total)); }
      });

      console.log("Upload response:", res.data);

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
      <Card className="p-3">
        <h5>Upload images for bike</h5>
        {error && <div className="alert alert-danger">{error}</div>}

        <input type="file" accept="image/*" multiple onChange={onFileChange} />
        <div className="d-flex flex-wrap gap-2 my-2">
          {files.map((f, i) => (
            <div key={i} style={{ width: 120 }}>
              <div style={{ position: "relative" }}>
                <img src={f.preview} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6 }} />
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeFile(i)} style={{ position: "absolute", right: 6, top: 6 }}>×</button>
              </div>
              <div className="small text-truncate mt-1">{f.file.name}</div>
            </div>
          ))}
        </div>

        {uploading && <ProgressBar now={progress} label={`${progress}%`} className="mb-2" />}

        <div className="d-flex gap-2 mt-2">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={uploading}>Back</Button>
          <Button variant="primary" onClick={handleUpload} disabled={uploading || files.length===0}>
            {uploading ? "Uploading..." : "Upload Images"}
          </Button>
        </div>
      </Card>
    </main>
  );
}
