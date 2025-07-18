"use client";
import axios from "axios";
import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

export default function Page() {
  const [orders, setOrders] = useState<[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchOrders = async () => {
    axios
      .get("/api/customer")
      .then((response) => {
        console.log("Orders fetched successfully:", response.data);
        setOrders(response.data || []);
      })
      .catch((error) => {
        setOrders([]);
        setError(
          error.response.data.message ||
            "Erreur lors de la récupération des commandes"
        );
      });
  };

  useEffect(() => {
    if (orders) return;
    fetchOrders();
  }, [orders]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <TriangleAlert size={128} className="text-danger mb-4" />
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-danger font-bold">{error}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Private Page</h1>
      <p className="text-gray-600">
        This page is protected and requires authentication.
      </p>
      {JSON.stringify(orders, null, 2)}
    </div>
  );
}
