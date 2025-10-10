import axios from "axios";

const TOKEN_KEY = "authToken";

export function setAuthToken(token, { persist = true } = {}) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      if (persist) {
        localStorage.setItem(TOKEN_KEY, token);
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch (e) {}
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Could not persist auth token:", e);
    }
  } else {
    delete axios.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
    try {
      sessionStorage.removeItem(TOKEN_KEY);
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
    const local = localStorage.getItem(TOKEN_KEY);
    if (local) return local;
    const sess = sessionStorage.getItem(TOKEN_KEY);
    return sess || null;
  } catch (e) {
    return null;
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}
