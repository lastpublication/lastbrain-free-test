"use client";

import { CardBody } from "@heroui/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { LBCard, LBInput } from "../../components/ui/Primitives";
import { Search } from "lucide-react";
import { Loading } from "../../components/Loading";

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

/** Détermine 2 / 3 / 4 colonnes selon le viewport (md / lg) */
function useResponsiveCols() {
  const [cols, setCols] = useState(2); // default SSR-safe

  useEffect(() => {
    const mqMd = window.matchMedia("(min-width: 768px)"); // md
    const mqLg = window.matchMedia("(min-width: 1024px)"); // lg

    const compute = () => {
      if (mqLg.matches) return 4; // > lg => 4 colonnes
      if (mqMd.matches) return 3; // > md => 3 colonnes
      return 2; // < md => 2 colonnes
    };

    const update = () => setCols(compute());

    update();
    mqMd.addEventListener?.("change", update);
    mqLg.addEventListener?.("change", update);

    return () => {
      mqMd.removeEventListener?.("change", update);
      mqLg.removeEventListener?.("change", update);
    };
  }, []);

  return cols;
}

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

  const colCount = useResponsiveCols();

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
      const description = (
        product.description ||
        product.resume ||
        ""
      ).toLowerCase();
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
      "https://lastbrain.io/img/website/placeholder.webp";

    const alt = product.name || product.title || "Produit";

    return (
      <div className="relative overflow-hidden ">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-content2 via-content2/10  to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="px-2 bg-white/70 dark:bg-black/40 backdrop-blur-sm rounded-e-md pointer-events-none absolute  bottom-2 text-left text-lg font-semibold dark:text-white text-black hover:drop-shadow">
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

  /** Répartition des produits dans N colonnes distinctes (idx % colCount) */
  const columns = useMemo(() => {
    const cols: Product[][] = Array.from({ length: colCount }, () => []);
    visibleProducts.forEach((p, idx) => {
      cols[idx % colCount].push(p);
    });
    return cols;
  }, [visibleProducts, colCount]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 md:px-6">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold capitalize md:text-4xl">
            {category_slug}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-foreground/70">
            Découvrez une sélection inspirante de produits présentés dans un mur
            visuel immersif. Faites défiler pour explorer toutes les pépites de
            la catégorie.
          </p>
        </div>
        <LBInput
          aria-label="Rechercher un produit"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="w-full max-w-md"
          size="lg"
          startContent={<Search className="h-4 w-4 text-foreground/40" />}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {/* Conteneur en colonnes DISTINCTES (2 / 3 / 4) */}
          <div className="flex gap-6">
            {columns.map((col, cIdx) => (
              <div
                key={`col-${cIdx}`}
                className="
                  flex-1 min-w-0 flex flex-col gap-6
                  w-1/2 md:w-1/3 lg:w-1/4
                "
              >
                <AnimatePresence>
                  {col.map((product, idxInCol) => {
                    const key =
                      product.code_product ||
                      product.slug ||
                      product.id ||
                      `${cIdx}-${idxInCol}-${category_slug}`;

                    const sizeClass =
                      sizeClasses[(idxInCol + cIdx) % sizeClasses.length];

                    return (
                      <motion.div
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="group "
                      >
                        <LBCard
                          isPressable
                          onPress={() => handleCardPress(product)}
                          className="overflow-hidden bg-content2 border border-default  backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                          <div className={`w-full ${sizeClass}`}>
                            {renderImage(product)}
                          </div>
                          {(product.description || product.resume) && (
                            <div className="space-y-2 px-5 pb-5 pt-4 text-left">
                              <p className="text-sm text-foreground/70 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                                {product.description || product.resume}
                              </p>
                            </div>
                          )}
                        </LBCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ))}
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

      {/* Sentinel pour l'infinite scroll */}
      <div ref={sentinelRef} aria-hidden className="h-1 w-full" />

      {hasMore && (
        <div className="flex items-center justify-center pt-10">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-secondary/40 border-t-secondary" />
        </div>
      )}
    </div>
  );
}
