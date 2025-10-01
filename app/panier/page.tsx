"use client";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Image,
  Input,
  Link,
  NumberInput,
  Textarea,
} from "@heroui/react";
import axios from "axios";
import { CreditCard, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { LoginForm } from "../components/LoginForm";
import Signup from "../components/Signup";
import CartStep from "./step/cart";
import LoginStep from "./step/login";
import DeliveryStep from "./step/delivery";
import PurchaseStep from "./step/purchase";
import { useAuth } from "../context/AuthContext";
import { useInfoSociety } from "../context/InfoSocietyContext";
import {
  LBButton,
  LBCard,
  LBInput,
  LBTextarea,
} from "../components/ui/Primitives";

export default function PanierPage() {
  const { user, isDemo, isMobile } = useAuth();
  const infoSociety = useInfoSociety();
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [totalCartHT, setTotalCartHT] = useState(0);
  const [totalCartTTC, setTotalCartTTC] = useState(0);
  const [step, setStep] = useState<number>(0); // 0: cart, 1: login, 2: delivery, 3: purchase
  const [shipping, setShipping] = useState<any>(null);
  const [customerSociety] = useState({
    society: "",
    last_name: "",
    first_name: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip_code: "",
    country: "FR",
    note: "",
  });
  // Charger le panier depuis le localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCart(parsed);
      const ht = parsed.reduce(
        (acc: number, item: any) =>
          acc + Number(item.price_ht) * Number(item.quantity),
        0
      );
      const ttc = parsed.reduce(
        (acc: number, item: any) =>
          acc + Number(item.price_ttc) * Number(item.quantity),
        0
      );
      setTotalCartHT(Number(ht.toFixed(2)));
      setTotalCartTTC(Number(ttc.toFixed(2)));
    }
    // auto-advance to delivery if user already logged in
    if (user) setStep(2);
  }, []);

  useEffect(() => {
    const onCartUpdated = () => {
      const stored = localStorage.getItem("cart");
      if (!stored) {
        setCart([]);
        setTotalCartHT(0);
        setTotalCartTTC(0);
        return;
      }
      const parsed = JSON.parse(stored);
      setCart(parsed);
      const ht = parsed.reduce(
        (acc: number, item: any) =>
          acc + Number(item.price_ht) * Number(item.quantity),
        0
      );
      const ttc = parsed.reduce(
        (acc: number, item: any) =>
          acc + Number(item.price_ttc) * Number(item.quantity),
        0
      );
      setTotalCartHT(Number(ht.toFixed(2)));
      setTotalCartTTC(Number(ttc.toFixed(2)));
    };
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => window.removeEventListener("cartUpdated", onCartUpdated);
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      router.replace("/payment/success");
    } else if (success === "false") {
      router.replace("/payment/error");
    }
  }, [searchParams, router]);

  const refreshCart = () => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const updatedCart = JSON.parse(stored);
      setCart(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
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

  const validationSchema = Yup.object({
    last_name: Yup.string().required("Nom requis"),
    first_name: Yup.string().required("Prénom requis"),
    email: Yup.string().email("Email invalide").required("Email requis"),
    phone: Yup.string().required("Téléphone requis"),
    address: Yup.string().required("Adresse requise"),
    city: Yup.string().required("Ville requise"),
    zip_code: Yup.string().required("Code postal requis"),
  });

  const createPayment = (values: typeof customerSociety) => {
    setIsLoading(true);
    const customer = {
      ...values,
      name: `${values.first_name} ${values.last_name}`,
    };
    const shippingFee = Number(shipping?.fee_ttc || 0);
    const amount = Number((Number(totalCartTTC) + shippingFee).toFixed(2));

    axios
      .get("/api/paiement", {
        params: {
          amount,
          cart: JSON.stringify(cart),
          shipping: JSON.stringify(shipping),
          note: customerSociety.note,
          customer: JSON.stringify(customer),
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mon panier</h1>

      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Stepper content */}
            {step === 0 && (
              <CartStep
                cart={cart}
                onNext={() => setStep(1)}
                onChangeQuantity={(index: number, qty: number) => {
                  const updated = cart.map((c, i) =>
                    i === index ? { ...c, quantity: qty } : c
                  );
                  setCart(updated);
                  localStorage.setItem("cart", JSON.stringify(updated));
                  refreshCart();
                }}
                onRemove={(index: number) => {
                  removeFromCart(index);
                }}
              />
            )}

            {step === 1 && <LoginStep user={user} onNext={() => setStep(2)} />}

            {step === 2 && (
              <DeliveryStep
                cart={cart}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                onSelect={(opt: any) => setShipping(opt)}
              />
            )}

            {step === 3 && (
              <PurchaseStep
                cart={cart}
                shipping={shipping}
                totalTTC={Number(totalCartTTC) + Number(shipping?.fee_ttc || 0)}
                onBack={() => setStep(2)}
                onPay={() => {
                  // open signup if not user
                  if (!user) setStep(1);
                }}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right: totals & checkout (sticky on desktop) */}
          <aside className="md:col-span-1">
            <LBCard className="md:sticky md:top-24  p-6">
              <h2 className="text-lg font-semibold mb-4">Cart Totals</h2>
              <div className="flex justify-between text-sm text-foreground-400">
                <div>Subtotal (HT)</div>
                <div className="font-semibold">{totalCartHT.toFixed(2)} €</div>
              </div>

              {infoSociety?.tva !== false && (
                <div className="flex justify-between text-sm text-foreground-400 mt-2">
                  <div>Tax</div>
                  <div className="font-semibold">
                    {Number(Number(totalCartTTC) - Number(totalCartHT)).toFixed(
                      2
                    )}{" "}
                    €
                  </div>
                </div>
              )}

              <div className="flex justify-between text-sm text-foreground-400 mt-2">
                <div>Frais de port</div>
                <div className="font-semibold">
                  {(shipping?.fee_ttc || 0).toFixed(2)} €
                </div>
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <div className="font-semibold">Total (TTC)</div>
                <div className="text-xl font-bold">
                  {(
                    Number(totalCartTTC) + Number(shipping?.fee_ttc || 0)
                  ).toFixed(2)}{" "}
                  €
                </div>
              </div>

              <div className="mt-6">
                {step < 1 && (
                  <LBButton
                    color="success"
                    className="w-full"
                    isDisabled={cart.length === 0}
                    onPress={() => setStep(1)}
                  >
                    Continuer
                  </LBButton>
                )}
                {step >= 1 && (
                  <LBButton
                    color="success"
                    className="w-full"
                    isDisabled={cart.length === 0}
                    onPress={() => {
                      if (!user) {
                        // prompt login/signup
                        setStep(1);
                        return;
                      }
                      // if user logged -> go to delivery or purchase
                      if (step < 2) setStep(2);
                      else if (step === 2) setStep(3);
                    }}
                  >
                    Continuer
                  </LBButton>
                )}
                {user && step === 3 && (
                  <Button
                    type="submit"
                    color="success"
                    className="w-full mt-2"
                    isLoading={isLoading}
                    isDisabled={cart.length === 0}
                    onPress={() => createPayment(customerSociety)}
                  >
                    <CreditCard size={16} /> Payer
                  </Button>
                )}
              </div>
            </LBCard>
          </aside>
        </div>
      )}
    </div>
  );
}
