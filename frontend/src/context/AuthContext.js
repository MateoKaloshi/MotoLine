import React, { createContext, useContext, useCallback, useMemo, useState } from "react";
const AUTH_TOKEN_KEY = "auth_token";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(AUTH_TOKEN_KEY) || undefined);

  const setAuthToken = useCallback((newToken) => {
    setToken(newToken);
    try { localStorage.setItem(AUTH_TOKEN_KEY, newToken); } catch (e) {}
  }, []);

  const removeAuthToken = useCallback(() => {
    setToken(undefined);
    try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch (e) {}
  }, []);

  const contextValue = useMemo(() => ({
    accessToken: token,
    isLoggedIn: !!token,
    setAuthToken,
    removeAuthToken,
  }), [token, setAuthToken, removeAuthToken]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
