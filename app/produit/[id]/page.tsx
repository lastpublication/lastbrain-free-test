"use client";

import { Button, ScrollShadow, Spinner } from "@heroui/react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { calculPriceTTC } from "../../utils/calculTva";

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/product?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setMainImage(data.image);
        });
    }
  }, [id]);

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

  if (!product)
    return (
      <div className="text-center py-20 text-gray-400">
        <Spinner color="secondary" />
      </div>
    );
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Galerie */}
      <div>
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
          <img
            src={mainImage || product.image}
            alt={product.name}
            className="object-contain w-full h-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 p-4">
          {product.gallery?.map((img: string, i: number) => (
            <img
              key={i}
              src={img}
              alt={product.name + " galerie " + i}
              className={`w-20 h-20 object-cover rounded border hover:scale-105 transition cursor-pointer ${
                mainImage === img ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>
      </div>
      {/* Infos produit */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold ">{product.name}</h1>
        <ScrollShadow className="max-h-[400px] overflow-y-auto" hideScrollBar>
          <div
            className=" prose prose-sm max-w-none text-black/80 dark:text-white/60"
            dangerouslySetInnerHTML={{
              __html: product.description.replace(/\n/g, "<br/>"),
            }}
          />
        </ScrollShadow>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-2xl font-semibold text-primary">
            {calculPriceTTC(
              Number(product.sale_price),
              Number(product.tax_rate)
            ).toFixed(2)}
            €
          </span>
          <span className="text-xs text-gray-500">
            {product.stock > 0
              ? `En stock (${product.stock} ${product.unit})`
              : "Rupture de stock"}
          </span>
        </div>
        <div className="text-xs text-gray-400">SKU : {product.sku}</div>
        <Button
          color="primary"
          disabled={product.stock < 1}
          onPress={() => addToCart(product)}
        >
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
}
