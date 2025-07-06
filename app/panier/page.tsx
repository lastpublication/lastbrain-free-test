"use client";
import { Button, NumberInput } from "@heroui/react";
import axios from "axios";
import { CreditCard, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PanierPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [totalCartHT, setTotalCartHT] = useState(0);
  const [totalCartTTC, setTotalCartTTC] = useState(0);
  // Charger le panier depuis le localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
      setTotalCartHT(
        JSON.parse(stored)
          .reduce(
            (acc: number, item: any) => acc + item.price_ht * item.quantity,
            0
          )
          .toFixed(2)
      );
      setTotalCartTTC(
        JSON.parse(stored)
          .reduce(
            (acc: number, item: any) => acc + item.price_ttc * item.quantity,
            0
          )
          .toFixed(2)
      );
    }
  }, []);

  const refreshCart = () => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const updatedCart = JSON.parse(stored);
      setCart(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
      setTotalCartHT(
        updatedCart
          .reduce(
            (acc: number, item: any) => acc + item.price_ht * item.quantity,
            0
          )
          .toFixed(2)
      );
      setTotalCartTTC(
        updatedCart
          .reduce(
            (acc: number, item: any) => acc + item.price_ttc * item.quantity,
            0
          )
          .toFixed(2)
      );
    }
  };

  // Supprimer un produit du panier
  const removeFromCart = (index: number) => {
    const updated = cart.filter((item, i) => i !== index);
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
    const first_name = "Test";
    const last_name = "Client";
    const customer_society = {
      society: "Client Society",
      last_name: last_name,
      first_name: first_name,
      name: `${first_name} ${last_name}`,
      email: "client@test.com",
      phone: "0123456789",
      address: "123 Rue de Test",
      city: "Testville",
      zip_code: "75000",
      country: "FR",
    };
    axios
      .get("/api/paiement", {
        params: {
          amount: cart.reduce((acc, item) => acc + item.sale_price, 0),
          cart: JSON.stringify(cart),
          customer_society: JSON.stringify(customer_society),
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
            {cart.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className="py-4 gap-4 flex  flex-col md:flex-row  justify-between items-center dark:border-t-white/20"
              >
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="font-semibold">
                    <div className="flex items-center gap-8">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-xl uppercase">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.ref}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <NumberInput
                      value={item.quantity}
                      min={1}
                      onChange={(value) => {
                        const updated = cart.map((cartItem) =>
                          cartItem.id === item.id
                            ? { ...cartItem, quantity: value }
                            : cartItem
                        );
                        setCart(updated);
                        localStorage.setItem("cart", JSON.stringify(updated));
                        refreshCart();
                      }}
                    />
                  </div>
                  <div className="text-md flex items-center gap-3 space-x-5 font-bold text-foreground text-end">
                    {item.price_ttc.toFixed(2)} €
                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      onPress={() => removeFromCart(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="w-full  border-t dark:border-t-white/20 pt-4">
            <div className="flex flex-col items-end">
              {" "}
              <div className="w-1/2 flex justify-between items-center gap-4">
                <div className="font-thin text-end text-foreground-400">
                  Total HT :
                </div>
                <div className=" text-end text-foreground-400">
                  {totalCartHT} €
                </div>
              </div>
              <div className="w-1/2 flex justify-between items-center gap-4">
                <div className="font-thin text-end text-foreground-400">
                  Total TVA :
                </div>
                <div className=" text-end text-foreground-400">
                  {Number(totalCartTTC - totalCartHT).toFixed(2)} €
                </div>
              </div>
              <div className="w-1/2 flex justify-between items-center gap-4">
                <div className="font-semibold text-end">Total TTC :</div>
                <div className="font-bold text-end">{totalCartTTC} €</div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-between">
            <Button color="danger" variant="light" onPress={clearCart}>
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
