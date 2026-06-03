import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "fitit_auth_token";

// Initialize the API client token getter
setAuthTokenGetter(() => {
  return localStorage.getItem(TOKEN_KEY);
});

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [, setLocation] = useLocation();

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken(null);
    setLocation("/login");
  };

  return {
    token,
    setToken,
    logout,
    isAuthenticated: !!token,
  };
}
