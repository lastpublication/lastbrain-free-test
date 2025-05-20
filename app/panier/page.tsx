"use client";
import { Button } from "@heroui/react";
import axios from "axios";
import { CreditCard, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PanierPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Charger le panier depuis le localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Supprimer un produit du panier
  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const createPayment = () => {
    setIsLoading(true);
    axios
      .get("/api/paiement", {
        params: {
          amount: cart.reduce((acc, item) => acc + item.sale_price, 0),
        },
      })
      .then((res) => {
        router.push(res.data.url);
      })
      .catch((err) => {
        alert("Erreur lors de la création du paiement");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mon panier</h1>
      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <>
          <ul className="divide-y">
            {cart.map((item) => (
              <li
                key={item.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.sale_price} €
                  </div>
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  color="danger"
                  onPress={() => removeFromCart(item.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t pt-4">
            <span className="font-semibold">Total :</span>
            <span className="font-bold">
              {cart.reduce((acc, item) => acc + item.sale_price, 0).toFixed(2)}{" "}
              €
            </span>
          </div>
          <div className="mt-8 flex justify-between">
            <Button color="danger" onPress={clearCart}>
              <Trash2 size={16} />
              Vider le panier
            </Button>
            <Button
              isLoading={isLoading}
              color="success"
              onPress={() => createPayment()}
            >
              <CreditCard size={16} />
              Payer
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
