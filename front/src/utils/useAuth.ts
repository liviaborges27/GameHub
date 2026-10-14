"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const AUTH_CHANGE_EVENT = "gamehub-auth-change";

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      setIsAuthenticated(Boolean(window.localStorage.getItem("gamehub-token")));
    }

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, []);

  function logout() {
    window.localStorage.removeItem("gamehub-token");
    window.localStorage.removeItem("gamehub-user");
    window.sessionStorage.removeItem("gamehub-token");
    window.sessionStorage.removeItem("gamehub-user");
    document.cookie = "gamehub-token=; Max-Age=0; path=/; SameSite=Lax";
    document.cookie = "gamehub-user=; Max-Age=0; path=/; SameSite=Lax";
    setIsAuthenticated(false);
    router.push("/login");
  }

  return { isAuthenticated, logout };
}
