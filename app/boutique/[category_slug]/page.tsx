"use client";

import { CardBody } from "@heroui/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

import { LBCard, LBInput } from "../../components/ui/Primitives";

type Product = {
  id?: string | number;
  code_product?: string;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
  resume?: string;
  image?: string;
  cover?: string;
  thumbnail?: string;
  picture?: string;
};

const INITIAL_BATCH = 12;
const BATCH_SIZE = 8;

const sizeClasses = [
  "aspect-[4/5]",
  "aspect-video",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[5/4]",
  "aspect-[4/3]",
];

export default function Page() {
  const params = useParams();
  const category_slug = params.category_slug as string;
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [isBatching, setIsBatching] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProductCategory = useCallback(async () => {
    if (!category_slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/catalog", {
        params: { category_slug },
      });

      const { data, message } = response.data ?? {};
      const rawProducts: unknown = data?.data ?? data;
      const parsedProducts = Array.isArray(rawProducts)
        ? rawProducts
        : Array.isArray((rawProducts as any)?.data)
        ? (rawProducts as any).data
        : [];

      if (message) {
        setError(message);
      }

      setProducts(parsedProducts as Product[]);
    } catch (err) {
      setError("Erreur lors du chargement des produits");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [category_slug]);

  useEffect(() => {
    fetchProductCategory();
  }, [fetchProductCategory]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      const name = (product.name || product.title || "").toLowerCase();
      const description = (product.description || product.resume || "").toLowerCase();
      return name.includes(term) || description.includes(term);
    });
  }, [products, searchTerm]);

  useEffect(() => {
    setVisibleCount((prev) => {
      if (filteredProducts.length === 0) {
        return 0;
      }
      if (searchTerm) {
        return Math.min(INITIAL_BATCH, filteredProducts.length);
      }
      return Math.min(Math.max(prev, INITIAL_BATCH), filteredProducts.length);
    });
  }, [filteredProducts.length, searchTerm]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isBatching) return;
    setIsBatching(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + BATCH_SIZE, filteredProducts.length)
      );
      setIsBatching(false);
    }, 250);
  }, [filteredProducts.length, hasMore, isBatching]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const renderImage = (product: Product) => {
    const src =
      product.image ||
      product.cover ||
      product.thumbnail ||
      product.picture ||
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80";

    const alt = product.name || product.title || "Produit";

    return (
      <div className="relative overflow-hidden rounded-3xl">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-4 bottom-4 text-left text-lg font-semibold text-white drop-shadow">
          {alt}
        </div>
      </div>
    );
  };

  const handleCardPress = (product: Product) => {
    const productId =
      product.code_product || product.slug || product.id?.toString();
    if (!productId) return;

    router.push(`/boutique/${category_slug}/${productId}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 md:px-6">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold capitalize md:text-4xl">
            {category_slug}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-foreground/70">
            Découvrez une sélection inspirante de produits présentés dans un
            mur visuel immersif. Faites défiler pour explorer toutes les
            pépites de la catégorie.
          </p>
        </div>
        <LBInput
          aria-label="Rechercher un produit"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="w-full max-w-md"
          startContent={
            <span className="text-foreground/40" aria-hidden>
              🔍
            </span>
          }
        />
      </div>

      {isLoading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-secondary/40 border-t-secondary" />
        </div>
      ) : (
        <>
          <div className="[column-fill:_balance] columns-1 gap-6 sm:columns-2 xl:columns-3">
            <AnimatePresence>
              {visibleProducts.map((product, idx) => {
                const key =
                  product.code_product ||
                  product.slug ||
                  product.id ||
                  `${idx}-${category_slug}`;
                const sizeClass = sizeClasses[idx % sizeClasses.length];

                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="group mb-6 block break-inside-avoid"
                  >
                    <LBCard
                      isPressable
                      onPress={() => handleCardPress(product)}
                      className="overflow-hidden border border-foreground/5 bg-background/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className={`w-full ${sizeClass}`}>
                        {renderImage(product)}
                      </div>
                      {(product.description || product.resume) && (
                        <CardBody className="space-y-2 px-5 pb-5 pt-4 text-left">
                          <p className="text-sm text-foreground/70 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                            {product.description || product.resume}
                          </p>
                        </CardBody>
                      )}
                    </LBCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {!visibleProducts.length && (
            <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold">
                Aucun produit ne correspond à votre recherche.
              </p>
              {error && (
                <p className="mt-2 max-w-xl text-sm text-foreground/70">
                  {error}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div ref={sentinelRef} aria-hidden className="h-1 w-full" />

      {hasMore && (
        <div className="flex items-center justify-center pt-10">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-secondary/40 border-t-secondary" />
        </div>
      )}

      {!isLoading && !filteredProducts.length && error && (
        <div className="mt-16 flex justify-center text-center text-foreground/70">
          {error}
        </div>
      )}
    </div>
  );
}
