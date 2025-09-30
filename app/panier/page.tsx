"use client";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
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
import { useAuth } from "../context/AuthContext";
import {
  LBButton,
  LBCard,
  LBInput,
  LBTextarea,
} from "../components/ui/Primitives";

export default function PanierPage() {
  const { user, isDemo } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [totalCartHT, setTotalCartHT] = useState(0);
  const [totalCartTTC, setTotalCartTTC] = useState(0);
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

    axios
      .get("/api/paiement", {
        params: {
          amount: cart.reduce((acc, item) => acc + item.sale_price, 0),
          cart: JSON.stringify(cart),
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
                      <Link
                        href={`/produit/${item.code_product}`}
                        className="flex-shrink-0"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-xl uppercase">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.ref}</p>
                        </div>
                      </Link>
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
                    <LBButton
                      isIconOnly
                      color="danger"
                      onPress={() => removeFromCart(index)}
                    >
                      <Trash2 size={16} />
                    </LBButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="w-full  border-t dark:border-t-white/20 pt-4 mb-24">
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
          {!user && (
            <>
              <LoginForm />
              <LBCard className="my-6">
                <div className="p-5">
                  <Formik
                    initialValues={customerSociety}
                    validationSchema={validationSchema}
                    onSubmit={createPayment}
                    enableReinitialize
                  >
                    {({
                      isValid,
                      dirty,
                      values,
                      handleChange,
                      isSubmitting,
                      errors,
                      touched,
                      submitCount,
                    }) => (
                      <Form className=" space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <LBInput
                            size="lg"
                            label="Société"
                            name="society"
                            placeholder="Nom de la société"
                            className="input input-bordered w-full col-span-2 md:col-span-1"
                            value={values.society}
                            onChange={handleChange}
                          />

                          <LBInput
                            size="lg"
                            label="Nom *"
                            name="last_name"
                            placeholder="Nom"
                            className="input input-bordered w-full col-span-2 md:col-span-1"
                            isInvalid={Boolean(
                              (touched.last_name || submitCount > 0) &&
                                errors.last_name
                            )}
                            errorMessage={
                              ((touched.last_name || submitCount > 0) &&
                                errors.last_name) ||
                              ""
                            }
                            value={values.last_name}
                            onChange={handleChange}
                          />

                          <LBInput
                            size="lg"
                            label="Prénom *"
                            name="first_name"
                            placeholder="Prénom"
                            className="input input-bordered w-full col-span-2 md:col-span-1"
                            isInvalid={Boolean(
                              (touched.first_name || submitCount > 0) &&
                                errors.first_name
                            )}
                            errorMessage={
                              ((touched.first_name || submitCount > 0) &&
                                errors.first_name) ||
                              ""
                            }
                            value={values.first_name}
                            onChange={handleChange}
                          />

                          <LBInput
                            size="lg"
                            label="Email *"
                            name="email"
                            type="email"
                            placeholder="Email"
                            className="input input-bordered w-full col-span-2 md:col-span-1"
                            isInvalid={Boolean(
                              (touched.email || submitCount > 0) && errors.email
                            )}
                            errorMessage={
                              ((touched.email || submitCount > 0) &&
                                errors.email) ||
                              ""
                            }
                            value={values.email}
                            onChange={handleChange}
                          />

                          <LBInput
                            size="lg"
                            label="Téléphone *"
                            name="phone"
                            placeholder="Téléphone"
                            className="input input-bordered w-full col-span-2 md:col-span-1"
                            isInvalid={Boolean(
                              (touched.phone || submitCount > 0) && errors.phone
                            )}
                            errorMessage={
                              ((touched.phone || submitCount > 0) &&
                                errors.phone) ||
                              ""
                            }
                            value={values.phone}
                            onChange={handleChange}
                          />

                          <LBInput
                            size="lg"
                            label="Adresse *"
                            name="address"
                            placeholder="Adresse"
                            className="input input-bordered w-full col-span-2 md:col-span-1"
                            isInvalid={Boolean(
                              (touched.address || submitCount > 0) &&
                                errors.address
                            )}
                            errorMessage={
                              ((touched.address || submitCount > 0) &&
                                errors.address) ||
                              ""
                            }
                            value={values.address}
                            onChange={handleChange}
                          />

                          <LBInput
                            size="lg"
                            label="Ville  *"
                            name="city"
                            placeholder="Ville"
                            className="input input-bordered w-full col-span-2 md:col-span-1"
                            isInvalid={Boolean(
                              (touched.city || submitCount > 0) && errors.city
                            )}
                            errorMessage={
                              ((touched.city || submitCount > 0) &&
                                errors.city) ||
                              ""
                            }
                            value={values.city}
                            onChange={handleChange}
                          />

                          <LBInput
                            size="lg"
                            label="Code postal *"
                            name="zip_code"
                            placeholder="Code postal"
                            className="input input-bordered w-full col-span-2 md:col-span-1"
                            isInvalid={Boolean(
                              (touched.zip_code || submitCount > 0) &&
                                errors.zip_code
                            )}
                            errorMessage={
                              ((touched.zip_code || submitCount > 0) &&
                                errors.zip_code) ||
                              ""
                            }
                            value={values.zip_code}
                            onChange={handleChange}
                          />

                          <LBTextarea
                            size="lg"
                            label="Commentaire"
                            name="note"
                            placeholder="Commentaire"
                            className="input input-bordered w-full col-span-2 md:col-span-2"
                            value={values.note}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="flex justify-end">
                          <LBButton
                            type="submit"
                            color="success"
                            disabled={isDemo}
                            className="w-full"
                            isLoading={isLoading}
                            size="lg"
                            isDisabled={isSubmitting || cart.length === 0}
                          >
                            <CreditCard size={16} />
                            Payer
                          </LBButton>
                          {isDemo && (
                            <span className="text-sm text-gray-500">
                              " (Demo Mode)"
                            </span>
                          )}
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </LBCard>
            </>
          )}

          {user && (
            <div className="flex justify-end mt-8">
              <Button
                type="submit"
                color="success"
                disabled={isDemo}
                className="w-full rounded-md"
                isLoading={isLoading}
                size="lg"
                isDisabled={cart.length === 0}
                onPress={() => createPayment(user)}
              >
                <CreditCard size={16} />
                Payer
              </Button>
              {isDemo && (
                <span className="text-sm text-gray-500">" (Demo Mode)"</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
