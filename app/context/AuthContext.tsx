"use client";
import React, { createContext, useContext, useRef, useState } from "react";

export const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";

  // Met à jour le localStorage à chaque changement de user
  React.useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      // localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
}
