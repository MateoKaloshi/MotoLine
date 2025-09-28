import axios from "axios";

const TOKEN_KEY = "authToken";

export function setAuthToken(token, { persist = true } = {}) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (persist) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch (e) {
        console.warn("Could not persist auth token:", e);
      }
    }
  } else {
    delete axios.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }

  try {
    window.dispatchEvent(new CustomEvent("authChanged", { detail: { token } }));
  } catch (e) {
  
    const evt = document.createEvent("Event");
    evt.initEvent("authChanged", true, true);
    window.dispatchEvent(evt);
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}
