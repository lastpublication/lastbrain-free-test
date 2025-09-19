"use client";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
  Link,
  Spinner,
} from "@heroui/react";
import axios from "axios";
import { TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { calculPriceTTC } from "../utils/calculTva";
import { useGlobal } from "../context/GlobalContext";
import { LBButton, LBCard } from "../components/ui/Primitives";

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/product", {
        params: { page, limit: 10 },
      });
      const newData = res.data || [];
      console.log("Fetched data:", newData);
      setData((prev) => [...prev, ...newData]);
      setData((prev) => {
        const merged = [...prev, ...newData];
        return merged.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );
      }); // Supprimer les doublons
      setHasMore(newData.length === 10);
      setError(null); // Réinitialise l’erreur si succès
    } catch (err: any) {
      setHasMore(false);
      const apiError =
        err?.response?.data?.details?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Erreur inconnue";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Scroll infini
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  // Charger les données à chaque changement de page
  useEffect(() => {
    fetchData();
  }, [page]);

  const addToCart = (item: any) => {
    const stored = localStorage.getItem("cart");
    const cart = stored ? JSON.parse(stored) : [];
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-5xl mx-auto p-4">
        {error && (
          <div className="mt-[20vh] flex flex-col items-center text-danger">
            <h3 className="font-bold mb-8">
              <TriangleAlertIcon size={64} />
            </h3>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.map((item: any, index: number) => (
              <LBCard
                key={`${item.id} - ${index}`}
                className="flex flex-col justify-between "
              >
                <CardBody>
                  <Image
                    src={item.image}
                    alt={item.name}
                    height={200}
                    width={700}
                    className="w-full object-cover rounded-md mb-2"
                  />
                  <div className="flex items-center justify-between ">
                    <h3 className="text-xl font-bold uppercase mb-1">
                      {item.name}
                    </h3>
                    <p className="text-lg text-end  font-bold">
                      {calculPriceTTC(
                        Number(item.sale_price),
                        Number(item.tax_rate)
                      ).toFixed(2)}
                      €
                    </p>
                  </div>
                  {item.code_product && (
                    <p className="text-xs  text-black/70 dark:text-white/50">
                      {item.code_product || ""}
                    </p>
                  )}
                  {item.description && (
                    <p className="  mb-2 truncate">{item.description}</p>
                  )}
                  <div className="text-sm ">
                    {item.stock > 0 && (
                      <div className="text-end">
                        <Chip> {item.stock} en stock</Chip>
                      </div>
                    )}

                    <LBButton
                      as={Link}
                      isLoading={isLoading}
                      color="default"
                      className="w-full mt-4"
                      href={`/produit/${item.code_product}`}
                    >
                      Voir le produit
                    </LBButton>
                  </div>
                </CardBody>
              </LBCard>
            ))}
          </div>
        )}
        {loading && (
          <div className="flex mt-[40vh] justify-center my-8">
            <Spinner color="default" />
          </div>
        )}
        {data.length === 0 && !loading && (
          <div className="flex mt-[40vh] justify-center my-8">
            <p className="text-gray-500">Aucun produit trouvé.</p>
          </div>
        )}
        {!hasMore && data.length > 0 && (
          <LBCard className="mt-8 p-4 text-center ">
            <span className="!font-ligth">Tous les produits chargés.</span>
          </LBCard>
        )}
      </div>
    </div>
  );
}
