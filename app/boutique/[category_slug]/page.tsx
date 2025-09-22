"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { CardBody, CardHeader, Spinner } from "@heroui/react";
import { LBCard } from "../../components/ui/Primitives";

export default function Page() {
  const params = useParams();
  const category_slug = params.category_slug as string;
  const [products, setProducts] = useState<any[] | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const fetchPoductCategory = async () => {
    axios
      .get(`/api/catalog?category_slug=${category_slug}`)
      .then((res) => {
        if (res.data.message) {
          setError(res.data.message);
          setProducts([]);
          return;
        }
        if (res.data.data.data) {
          setProducts(res.data.data.data || []);
        } else {
          setProducts([]);
        }
      })
      .catch(() => {
        setError("Erreur lors du chargement des produits");
        setProducts([]);
      });
  };

  useEffect(() => {
    if (category_slug && !products) {
      fetchPoductCategory();
    }
  }, [category_slug]);

  return (
    <div className="max-w-7xl mx-auto pt-8 px-4 md:px-0">
      <h1 className="mb-8 capitalize font-bold">{category_slug}</h1>
      {!products && (
        <div className="min-h-[60vh] w-full flex justify-center items-center">
          <Spinner color="secondary" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-24">
        {Array.isArray(products) &&
          products.length > 0 &&
          products.map((product, idx) => (
            <LBCard
              key={idx}
              isPressable
              className="hover:border hover:border-secondary hover:scale-105"
              onPress={() => {
                setTimeout(() => {
                  router.push(
                    `/boutique/${category_slug}/${product.code_product}`
                  );
                }, 400);
              }}
            >
              <CardHeader className="p-0 flex flex-col">
                {product.image && product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 p-0"
                  />
                )}
                <h2 className="px-4 text-secondary  w-full capitalize text-left text-2xl font-bold mb-2">
                  {product.name}
                </h2>
              </CardHeader>
              <CardBody className="p-4">
                <p>{product.description}</p>
              </CardBody>
            </LBCard>
          ))}
      </div>

      {Array.isArray(products) && products.length === 0 && (
        <div className="w-full flex justify-center mt-24">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
