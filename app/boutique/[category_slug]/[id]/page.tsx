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
import { LBButton, LBCard } from "../../../components/ui/Primitives";
import { ShoppingCart } from "lucide-react";

export default function Page() {
  const params = useParams();
  const code_product = params.id as string;
  const { isDemo } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  useEffect(() => {
    console.log("Fetching product", code_product);
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
    }
  }, [code_product]);

  const addToCart = (item: any) => {
    const stored = localStorage.getItem("cart");
    const cart = stored ? JSON.parse(stored) : [];

    const existingItem = cart.find(
      (cartItem: any) => cartItem.product_id === item.id
    );
    if (!existingItem) {
      cart.push({
        name: item.name || null,
        attributs_grouped: null,
        image: item.image || null,
        description: item.description || null,
        price_ht:
          item && item.sale_price && item.tax_rate
            ? Number(item.sale_price)
            : item.sale_price,
        price_ttc:
          item && item.sale_price && item.tax_rate
            ? calculPriceTTC(Number(item.sale_price), Number(item.tax_rate))
            : item.sale_price,
        product_id: item.id || null,
        quantity: 1,
        rang: cart.length + 1,
        ref: item.code_product || null,
        tva_tx: item.tax_rate || 0,
      });
    } else {
      existingItem.quantity += 1;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (!product && isLoading)
    return (
      <div className="flex items-center justify-center text-gray-400 min-h-[70vh]">
        <Spinner color="secondary" />
      </div>
    );
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
                <motion.div
                  key="placeholder"
                  className="text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Aucune image disponible
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-2 overflow-x-auto p-4  mt-4">
            {Array.isArray(product.gallery) &&
              product.gallery.length > 0 &&
              product.gallery.map((img: string, i: number) => (
                <Image
                  key={i}
                  src={img}
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
        <LBCard className="hover:scale-105 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-col items-start gap-1">
            <h1 className="text-3xl font-bold capitalize">{product.name}</h1>
            {product.code_product && (
              <p className="text-xs text-gray-400">
                Code produit : {product.code_product}
              </p>
            )}
          </CardHeader>
          <CardBody className="space-y-4 p-4 h-full flex flex-col justify-between">
            {product.description && (
              <div
                className="flex-1 prose prose-sm max-w-none text-black/80 dark:text-white/60"
                dangerouslySetInnerHTML={{
                  __html: product.description.replace(/\n/g, "<br/>"),
                }}
              />
            )}
            <div className="flex items-center justify-between gap-4 mt-2">
              <span className="text-xs text-gray-500">
                {product.stock > 0
                  ? "En stock (" + product.stock + " " + product.unit + ")"
                  : "Rupture de stock"}
              </span>
              <span className="text-2xl font-bold text-primary">
                {
                  calculPriceTTC(
                    Number(product.sale_price),
                    Number(product.tax_rate)
                  )
                    .toFixed(2)
                    .split(".")[0]
                }
                .
                <span className="text-xl font-regular">
                  {
                    calculPriceTTC(
                      Number(product.sale_price),
                      Number(product.tax_rate)
                    )
                      .toFixed(2)
                      .split(".")[1]
                  }
                </span>{" "}
                €
              </span>
            </div>
            {product.sku && (
              <div className="text-xs text-gray-400">SKU : {product.sku}</div>
            )}
            {isDemo && (
              <div className="text-xs text-red-500">
                Mode démo activé, impossible d'ajouter au panier.
              </div>
            )}
            {product.stock > 0 && (
              <LBButton
                isDisabled={isDemo}
                color="success"
                disabled={product.stock < 1}
                onPress={() => addToCart(product)}
                startContent={<ShoppingCart size={16} />}
                size="lg"
              >
                Ajouter au panier
              </LBButton>
            )}
            {product.stock === 0 && (
              <Tooltip content=" Pas de stock ">
                <LBButton
                  isDisabled={isDemo}
                  className="!opacity-40 !hover:opacity-40"
                  disabled={product.stock < 1}
                  size="lg"
                  color="success"
                  startContent={<ShoppingCart size={16} />}
                >
                  Ajouter au panier
                </LBButton>
              </Tooltip>
            )}
          </CardBody>
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
