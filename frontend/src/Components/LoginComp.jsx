import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/loginStyle.css";
import { setAuthToken, getAuthToken } from "../utils/auth";
import helmet from "../Images/Login/helmeticon.png";

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const existing = getAuthToken();
    if (existing) setAuthToken(existing, { persist: true });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { email, password, remember } = form;
    if (!email || !password) return setError("Please enter both email and password.");

    setIsLoading(true);
    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await axios.post(`${base}/api/login`, { email, password });
      const token = res?.data?.token;
      if (!token) throw new Error("No token returned from server");

      setAuthToken(token, { persist: !!remember });
      setSuccess("Logged in — redirecting...");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  document.body.classList.add("bg-login-hero");

  return () => {
    document.body.classList.remove("bg-login-hero");
  };
}, []);

  return (
    <main className="login-form-page d-flex align-items-center justify-content-center">
      <div className="card login-form-card shadow-lg">
        <div className="card-body p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className="avatar">
              <img src={helmet} alt="Helmet Icon" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true" />
            </div>
          </div>

          <h3 className="text-center mb-4">Welcome back</h3>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-group input-group-lg login-input-group login-input-group2">
                <span className="input-group-text bg-white border-end-0" id="email-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control form-control-lg border-start-0"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  aria-describedby="email-addon"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group input-group-lg login-input-group">
                <span className="input-group-text bg-white border-end-0" id="pwd-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M17 8V7a5 5 0 0 0-10 0v1H5v12h14V8h-2zM9 7a3 3 0 0 1 6 0v1H9V7z" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control form-control-lg border-start-0"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  aria-describedby="pwd-addon"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="form-check-input login-rememberStyle"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <label htmlFor="remember" className="form-check-label">Remember me</label>
              </div>
            </div>

            <div className="d-grid mb-3">
              <button className="btn btn-primary btn-lg login-buttonStyle" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>

            <div className="text-center mt-2">
              <p className="mb-0">Don't have an account? <Link to="/register" className="login-createStyle">Create one</Link></p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
