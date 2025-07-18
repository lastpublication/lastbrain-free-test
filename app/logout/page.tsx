"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function LogoutPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  useEffect(() => {
    // Supprimer le token de l'utilisateur
    localStorage.removeItem("user");
    setUser(null);
    // Rediriger vers la page de connexion
    router.push("/login");
  }, []);
}
