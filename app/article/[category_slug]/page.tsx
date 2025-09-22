"use client";

import { CardBody } from "@heroui/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { LBCard, LBInput } from "../../components/ui/Primitives";
import { Search } from "lucide-react";

type Article = {
  id?: string | number;
  slug?: string;
  title?: string;
  name?: string;
  excerpt?: string;
  resume?: string;
  description?: string;
  content?: string;
  image?: string;
  cover?: string;
  thumbnail?: string;
  picture?: string;
  url?: string;
};

const INITIAL_BATCH = 12;
const BATCH_SIZE = 8;

const sizeClasses = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-video",
  "aspect-[4/3]",
  "aspect-[5/4]",
];

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const category_slug = params.category_slug as string;

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [isBatching, setIsBatching] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchArticles = useCallback(async () => {
    if (!category_slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/article", {
        params: { categorySlug: category_slug },
      });

      const { data, message } = response.data ?? {};
      const rawArticles: unknown = data ?? [];
      const parsedArticles = Array.isArray(rawArticles)
        ? rawArticles
        : Array.isArray((rawArticles as any)?.data)
        ? (rawArticles as any).data
        : [];

      if (message) {
        setError(message);
      }

      setArticles(parsedArticles as Article[]);
    } catch (err) {
      setError("Erreur lors du chargement des articles");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [category_slug]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return articles;

    return articles.filter((article) => {
      const title = (article.title || article.name || "").toLowerCase();
      const content = (
        article.excerpt ||
        article.resume ||
        article.description ||
        article.content ||
        ""
      ).toLowerCase();
      return title.includes(term) || content.includes(term);
    });
  }, [articles, searchTerm]);

  useEffect(() => {
    setVisibleCount((prev) => {
      if (filteredArticles.length === 0) {
        return 0;
      }
      if (searchTerm) {
        return Math.min(INITIAL_BATCH, filteredArticles.length);
      }
      return Math.min(Math.max(prev, INITIAL_BATCH), filteredArticles.length);
    });
  }, [filteredArticles.length, searchTerm]);

  const visibleArticles = useMemo(
    () => filteredArticles.slice(0, visibleCount),
    [filteredArticles, visibleCount]
  );

  const hasMore = visibleCount < filteredArticles.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isBatching) return;
    setIsBatching(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + BATCH_SIZE, filteredArticles.length)
      );
      setIsBatching(false);
    }, 250);
  }, [filteredArticles.length, hasMore, isBatching]);

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

  const renderImage = (article: Article) => {
    const src =
      article.image ||
      article.cover ||
      article.thumbnail ||
      article.picture ||
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80";
    const alt = article.title || article.name || "Article";

    return (
      <div className="relative overflow-hidden ">
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

  const handleCardPress = (article: Article) => {
    const articleSlug = article.slug || article.id?.toString();
    if (!articleSlug) {
      if (article.url) {
        window.open(article.url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    const target = article.slug
      ? `/article/${articleSlug}`
      : `/article/${category_slug}/${articleSlug}`;

    router.push(target);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 md:px-6">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold capitalize md:text-4xl">
            {category_slug}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-foreground/70">
            Explorez les articles de la catégorie et laissez-vous inspirer par
            une lecture immersive mise en avant dans une grille fluide.
          </p>
        </div>
        <LBInput
          aria-label="Rechercher un article"
          placeholder="Rechercher un article..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="w-full max-w-md"
          startContent={<Search className="h-4 w-4 text-foreground/40" />}
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
              {visibleArticles.map((article, idx) => {
                const key =
                  article.slug || article.id || `${idx}-${category_slug}`;
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
                      onPress={() => handleCardPress(article)}
                      className="overflow-hidden border border-foreground/5 bg-background/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className={`w-full ${sizeClass}`}>
                        {renderImage(article)}
                      </div>
                      <CardBody className="space-y-3 px-5 pb-5 pt-4 text-left">
                        <p className="text-base font-semibold text-foreground">
                          {article.title || article.name}
                        </p>
                        {(article.excerpt ||
                          article.resume ||
                          article.description) && (
                          <p className="text-sm text-foreground/70 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                            {article.excerpt ||
                              article.resume ||
                              article.description}
                          </p>
                        )}
                      </CardBody>
                    </LBCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {!visibleArticles.length && (
            <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold">
                Aucun article ne correspond à votre recherche.
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

      {!isLoading && !filteredArticles.length && error && (
        <div className="mt-16 flex justify-center text-center text-foreground/70">
          {error}
        </div>
      )}
    </div>
  );
}
