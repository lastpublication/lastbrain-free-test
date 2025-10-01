"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ScrollShadow,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { calculPriceTTC } from "../../../utils/calculTva";
import { useAuth } from "../../../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { LBButton, LBCard, LBInput } from "../../../components/ui/Primitives";
import { ShoppingCart } from "lucide-react";
import { Loading } from "../../../components/Loading";
import { VariantDetails } from "../../components/VariantDetails";
import { useInfoSociety } from "../../../context/InfoSocietyContext";

export default function Page() {
  const params = useParams();
  const infoSociety = useInfoSociety();

  const code_product = params.id as string;
  const category_slug = params.category_slug as string;
  const { isDemo } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [variant, setVariant] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<
    string,
    string
  > | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [inputQuantity, setInputQuantity] = useState<string>(String(1));
  const [cartError, setCartError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  useEffect(() => {
    if (code_product) {
      fetch(`/api/product?code_product=${code_product}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setProduct(null);
            setIsLoading(false);
            return;
          }

          setProduct(data || null);
          setMainImage(data.image);
          setIsLoading(false);
        })
        .catch(() => {
          setProduct(null);
          setIsLoading(false);
        });

      fetch(`/api/product/variant?code_product=${code_product}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setVariant(null);

            return;
          }

          setVariant(data || null);
        })
        .catch(() => {
          setVariant(null);
        });
    }
  }, [code_product]);

  const addToCart = (item: any, qty = 1) => {
    const stored = localStorage.getItem("cart");
    const cart = stored ? JSON.parse(stored) : [];
    // helper: shallow compare attributes objects (null/undefined treated as empty)
    const attrsMatch = (
      a: Record<string, any> | null | undefined,
      b: Record<string, any> | null | undefined
    ) => {
      if (!a && !b) return true;
      if (!a || !b) return false;
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((k) => String(a[k]) === String(b[k]));
    };

    // Find existing cart item only if it's the same variant (same product_id AND same attributes)
    const existingItem = cart.find((cartItem: any) => {
      return (
        cartItem.product_id === item.id &&
        attrsMatch(cartItem.attributs_grouped, selectedAttrs ?? null)
      );
    });
    const availableStock = item?.stock ?? product?.stock ?? 0;

    // if item exists in cart, check sum of quantities
    if (existingItem) {
      if (existingItem.quantity + qty > availableStock) {
        setCartError(
          "Quantité dans le panier + demandée dépasse le stock disponible"
        );
        return;
      }
      existingItem.quantity += qty;
      setCartError(null);
    } else {
      if (qty > availableStock) {
        setCartError("Quantité demandée dépasse le stock disponible");
        return;
      }
      // determine price based on canonical sale_price (assumed HT)
      const taxRate = Number(item.tax_rate || 0);
      const priceSource = Number(item.sale_price || 0);
      // Treat sale_price as price HT (hors taxe) in data source.
      const price_ht = priceSource;
      const price_ttc = Number((price_ht * (1 + taxRate / 100)).toFixed(2));

      cart.push({
        name: item.name || null,
        attributs_grouped: selectedAttrs ?? null,
        image: item.image || null,
        description: item.description || null,
        price_ht: Number(price_ht),
        price_ttc: Number(price_ttc),
        product_id: item.id || null,
        quantity: qty,
        rang: cart.length + 1,
        code_product: item.code_product || null,
        path: `/boutique/${category_slug}/${item.code_product}`,
        tva_tx: taxRate || 0,
      });
      setCartError(null);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // clear cart error when selection or quantity changes
  useEffect(() => {
    setCartError(null);
  }, [quantity, selectedVariant, selectedAttrs]);

  // keep the textual input in sync when quantity changes programmatically
  useEffect(() => {
    setInputQuantity(String(quantity));
  }, [quantity]);

  if (!product && isLoading) return <Loading />;
  if (!product && !isLoading) {
    return (
      <div className="flex items-center justify-center text-gray-400 min-h-[70vh]">
        <p>Aucun produit trouvé.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-8">
        {/* Galerie */}
        <div className="col-span-1">
          <div
            className={
              "aspect-square rounded-lg overflow-hidden flex items-center justify-center cursor-zoom-in " +
              (mainImage ? "" : "bg-content1 border")
            }
            onClick={() => mainImage && onOpenChange()}
          >
            <AnimatePresence mode="wait">
              {mainImage ? (
                <motion.img
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.img
                  key={"placeholder"}
                  src="https://lastbrain.io/img/website/placeholder.webp"
                  alt={product.name}
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-2 overflow-x-auto p-4  mt-4">
            {Array.isArray(product.gallery) &&
              product.gallery.length > 0 &&
              product.gallery.map((img: string, i: number) => (
                <Image
                  key={i}
                  src={
                    img || "https://lastbrain.io/img/website/placeholder.webp"
                  }
                  alt={product.name + " galerie " + i}
                  className={
                    "w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition " +
                    (mainImage === img ? "ring-2 ring-primary" : "")
                  }
                  onClick={() => setMainImage(img)}
                />
              ))}
          </div>
        </div>
        {/* Infos produit */}
        <LBCard className="hover:shadow-sm border-default-200 transition-all">
          <div className="flex flex-col items-start gap-1 p-4">
            <h1 className="text-3xl font-bold capitalize">{product.name}</h1>
            {product.code_product && (
              <p className="text-xs text-gray-400">
                Code produit : {product.code_product}
              </p>
            )}
            {(selectedVariant?.sku ?? product.sku) && (
              <div className="text-xs text-gray-400">
                SKU : {selectedVariant?.sku ?? product.sku}
              </div>
            )}
          </div>
          <div className="space-y-4 p-4 h-full flex flex-col justify-between">
            {product.description && (
              <div
                className=" prose prose-sm max-w-none text-black/80 dark:text-white/60"
                dangerouslySetInnerHTML={{
                  __html: product.description.replace(/\n/g, "<br/>"),
                }}
              />
            )}
            <div>
              {variant && (
                <VariantDetails
                  variant={variant}
                  onSelectionChange={(payload) => {
                    setSelectedVariant(payload?.variant ?? null);
                    setSelectedAttrs(payload?.attrs ?? null);
                  }}
                />
              )}
            </div>
            <div className="mt-2">
              <label className="block text-sm text-gray-500 mb-1">
                Quantité
              </label>
              <div className="w-full">
                <LBInput
                  className="w-full"
                  size="lg"
                  value={inputQuantity}
                  type="number"
                  min={1}
                  max={selectedVariant?.stock ?? product.stock ?? undefined}
                  onChange={(e: any) => {
                    // keep textual input while typing to avoid aggressive clamping
                    setInputQuantity(e.target.value);
                  }}
                  onBlur={() => {
                    // validate and clamp when user leaves the field
                    const v = Number(inputQuantity);
                    if (Number.isNaN(v) || v < 1) {
                      setQuantity(1);
                      setInputQuantity("1");
                      return;
                    }
                    const maxStock =
                      selectedVariant?.stock ?? product.stock ?? 1;
                    const clamped = Math.max(
                      1,
                      Math.min(Math.floor(v), maxStock)
                    );
                    setQuantity(clamped);
                    setInputQuantity(String(clamped));
                  }}
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter") {
                      // same validation as onBlur
                      const v = Number(inputQuantity);
                      if (Number.isNaN(v) || v < 1) {
                        setQuantity(1);
                        setInputQuantity("1");
                        return;
                      }
                      const maxStock =
                        selectedVariant?.stock ?? product.stock ?? 1;
                      const clamped = Math.max(
                        1,
                        Math.min(Math.floor(v), maxStock)
                      );
                      setQuantity(clamped);
                      setInputQuantity(String(clamped));
                    }
                  }}
                />
              </div>
              {quantity > (selectedVariant?.stock ?? product.stock ?? 0) && (
                <div className="text-xs text-red-500 mt-1">
                  Quantité supérieure au stock disponible
                </div>
              )}
              {cartError && (
                <div className="text-xs text-red-600 mt-1">{cartError}</div>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 mt-2">
              <span className="text-xs text-gray-500">
                {(() => {
                  const availableStock =
                    selectedVariant?.stock ?? product.stock;
                  if (availableStock > 0) {
                    const unit = selectedVariant ? "" : " " + product.unit;
                    return `En stock (${availableStock}${unit})`;
                  }
                  return "Rupture de stock";
                })()}
              </span>
              <div>
                {infoSociety?.tva === true ? (
                  (() => {
                    const priceSource = Number(
                      selectedVariant?.sale_price ?? product.sale_price
                    );
                    const priceHT = priceSource;
                    const priceTTC = calculPriceTTC(
                      Number(priceHT),
                      Number(product.tax_rate)
                    ).toFixed(2);
                    const priceHTStr = Number(priceHT).toFixed(2);
                    return (
                      <div className="text-end">
                        <div className="text-sm text-gray-500 mb-1">
                          HT {priceHTStr} €
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          {priceTTC.split(".")[0]}.
                          <span className="text-xl font-regular">
                            {priceTTC.split(".")[1]}
                          </span>{" "}
                          €
                          <span className="text-xs text-inline text-gray-500 ml-2">
                            TTC
                          </span>
                        </span>
                      </div>
                    );
                  })()
                ) : infoSociety?.tva === false ? (
                  <div className="text-end">
                    <span className="text-2xl font-bold text-primary">
                      {(() => {
                        const priceSource =
                          selectedVariant?.sale_price ?? product.sale_price;
                        // priceSource is HT in this mode
                        const priceHT = Number(priceSource).toFixed(2);
                        return (
                          <>
                            {priceHT.split(".")[0]}.
                            <span className="text-xl font-regular">
                              {priceHT.split(".")[1]}
                            </span>{" "}
                            €
                          </>
                        );
                      })()}
                    </span>
                    <div className="text-xs text-gray-500">
                      Assujetti à la TVA
                    </div>
                  </div>
                ) : (
                  // fallback: display TTC only (legacy behaviour)
                  <span className="text-2xl font-bold text-primary">
                    {(() => {
                      const priceSource =
                        selectedVariant?.sale_price ?? product.sale_price;
                      const priceTTC = calculPriceTTC(
                        Number(priceSource),
                        Number(product.tax_rate)
                      ).toFixed(2);
                      return (
                        <>
                          {priceTTC.split(".")[0]}.
                          <span className="text-xl font-regular">
                            {priceTTC.split(".")[1]}
                          </span>{" "}
                          €
                        </>
                      );
                    })()}
                  </span>
                )}
              </div>
            </div>

            {isDemo && (
              <div className="text-xs text-red-500">
                Mode démo activé, impossible d'ajouter au panier.
              </div>
            )}
            {(selectedVariant?.stock ?? product.stock) > 0 && (
              <LBButton
                isDisabled={isDemo}
                color="success"
                disabled={
                  (selectedVariant?.stock ?? product.stock) < 1 ||
                  quantity > (selectedVariant?.stock ?? product.stock ?? 0)
                }
                onPress={() =>
                  addToCart(
                    selectedVariant
                      ? { ...product, ...selectedVariant }
                      : product,
                    quantity
                  )
                }
                startContent={<ShoppingCart size={16} />}
                size="lg"
              >
                Ajouter au panier
              </LBButton>
            )}
            {(selectedVariant?.stock ?? product.stock) === 0 && (
              <Tooltip content=" Pas de stock ">
                <LBButton
                  isDisabled={isDemo}
                  className="!opacity-40 !hover:opacity-40"
                  disabled={(selectedVariant?.stock ?? product.stock) < 1}
                  size="lg"
                  color="success"
                  startContent={<ShoppingCart size={16} />}
                >
                  Ajouter au panier
                </LBButton>
              </Tooltip>
            )}
          </div>
        </LBCard>
      </div>

      {/* Modal d'image */}
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
      >
        <ModalContent>
          <ModalBody className="p-8">
            {mainImage && (
              <div className="z-1 mt-8">
                <Image
                  src={mainImage}
                  alt={product.name}
                  className=" w-full h-full object-contain no-pointer-events"
                />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
