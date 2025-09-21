import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/loginStyle.css";
import { setAuthToken, getAuthToken } from "../utils/auth";

export default function LoginComponent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // If a token was already persisted, attach it to axios on mount
  useEffect(() => {
    const existing = getAuthToken();
    if (existing) {
      setAuthToken(existing, { persist: true });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { email, password, remember } = form;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.post(`${base}/api/login`, { email, password });

      const token = response?.data?.token;
      if (token) {
        setAuthToken(token, { persist: !!remember });
        console.log("Login successful, token stored. token:", token);

        setSuccess("Login successful! Redirecting...");
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        throw new Error("No token returned from server");
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="form-page-main">
      <section className="login-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h3 className="card-title mb-3">Login to your account</h3>

                  {/* ✅ Success alert */}
                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}

                  {/* ❌ Error alert */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        className="form-control"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="password"
                        minLength={8}
                        required
                      />
                    </div>

                    <div className="form-check mb-3">
                      <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        className="form-check-input"
                        checked={form.remember}
                        onChange={handleChange}
                      />
                      <label htmlFor="remember" className="form-check-label">
                        Remember me
                      </label>
                    </div>

                    <div className="d-grid mb-2">
                      <button className="btn btn-primary" type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            />
                            Logging in...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>

                    <div className="text-end mb-0">
                      <Link to="/">Forgot Password?</Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
