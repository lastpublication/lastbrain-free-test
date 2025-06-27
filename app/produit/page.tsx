"use client";
import { Button, Card, CardBody, Image, Link, Spinner } from "@heroui/react";
import axios from "axios";
import { TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
      setData((prev) => [...prev, ...newData]);
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
              <Card
                radius="sm"
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
                  <h3 className="text-xl font-bold uppercase mb-1 text-center">
                    {item.name}
                  </h3>
                  {item.code_product && (
                    <p className="text-xs text-center text-black/70 dark:text-white/50">
                      {item.code_product}
                    </p>
                  )}
                  <p className="text-center  mb-2 truncate">
                    {item.description || "Aucune description."}
                  </p>
                  <div className="text-sm ">
                    <p>
                      <strong>Stock :</strong> {item.stock} {item.unit}
                    </p>
                    <p className="text-lg text-end  font-bold">
                      {item.sale_price.toFixed(2)} €
                    </p>

                    <Button
                      as={Link}
                      isLoading={isLoading}
                      variant="solid"
                      color="success"
                      radius="none"
                      className="w-full mt-4"
                      href={`/produit/${item.id}`}
                    >
                      Voir le produit
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
        {loading && (
          <div className="flex mt-[40vh] justify-center my-8">
            <Spinner color="default" />
          </div>
        )}
        {!hasMore && data.length > 0 && (
          <div className="p-4 border border-black/40 dark:border-white/40  rounded text-center mt-8">
            <h3 className="font-bold text-black/30 dark:text-white/40">
              Tous les produits chargés.
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
