"use client";
import axios from "axios";
import { useParams } from "next/navigation";

import { useEffect, useState } from "react";
import { Loading } from "../../../components/Loading";
import { LBButton, LBCard } from "../../../components/ui/Primitives";
import { ShareButtons } from "../../../components/ShareButtons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Article = {
  id?: string | number;
  slug?: string;
  title?: string;
  name?: string;
  excerpt?: string | null;
  resume?: string | null;
  description?: string | null;
  content?: string | null;
  cover_image?: string | null;
  image_legacy?: string | null;
  thumbnails: string[];
  picture?: string | null;
  url?: string | null;
  subtitle?: string | null;
  date_publication?: string | null;
  gallery?: string[] | null;
  tags?: string[] | null;
};

export default function Page() {
  const params = useParams();

  const category_slug = params.category_slug as string;
  const article_slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!article_slug) return;
    setLoading(true);
    axios
      .get(`/api/article`, { params: { slug: article_slug } })
      .then((response) => {
        // backend returns { data: ... } in many routes; handle both shapes
        const payload = response.data?.data ?? response.data;
        // If payload is an array, pick first; if object, use directly
        const art = Array.isArray(payload)
          ? payload[0] ?? null
          : payload ?? null;
        setArticle(art);
        // expose a lightweight client-side `window.article` object so ShareButtons
        // and other client widgets can access thumbnails and metadata without
        // re-fetching. Keep only public fields to avoid leaking sensitive data.
        try {
          if (typeof window !== "undefined") {
            (window as any).article = {
              id: art?.id ?? null,
              slug: art?.slug ?? null,
              title: art?.title ?? null,
              thumbnails: Array.isArray(art?.thumbnails) ? art.thumbnails : [],
              cover_image: art?.cover_image ?? null,
              url: art?.url ?? null,
            };
          }
        } catch (e) {
          // ignore
        }
      })
      .catch((e) => {
        console.error("Error fetching article:", e);
        setArticle(null);
      })
      .finally(() => setLoading(false));
  }, [article_slug]);

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-12 pb-24">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <Loading />
        ) : article ? (
          <>
            <div className="flex justify-end mb-4">
              <LBButton
                startContent={<ArrowLeft />}
                as={Link}
                href={`/article/${category_slug}`}
              >
                retour
              </LBButton>
            </div>
            <article className="ProseMirror grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="block md:hidden">
                <ShareButtons />
              </div>
              {/* Main card */}
              <LBCard className="bg-content1 border border-default-200 lg:col-span-2">
                <div className="  overflow-hidden">
                  {article.cover_image ? (
                    <div className="w-full h-72 sm:h-96 lg:h-[32rem] relative overflow-hidden">
                      <img
                        src={article.cover_image}
                        alt={article.title || "cover"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-default-800 leading-tight">
                      {article.title}
                    </h1>
                    {article.subtitle && (
                      <p className="mt-2 text-default-600 text-lg">
                        {article.subtitle}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between text-sm text-default-500">
                      <div>
                        Publié le{" "}
                        <time>
                          {article.date_publication
                            ? new Date(
                                article.date_publication
                              ).toLocaleDateString()
                            : ""}
                        </time>
                      </div>
                    </div>

                    <div className="prose prose-lg max-w-none mt-6 text-default-800">
                      {/* render HTML content safely */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: article.content || article.description || "",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </LBCard>

              {/* Sidebar: suggestions / gallery */}
              <aside className="flex  flex-col-reverse md:flex-col gap-6 ">
                <div className="">
                  <ShareButtons />
                </div>
                <LBCard className="bg-content1 border border-default-200 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-default-700">
                    À propos de cet article
                  </h3>
                  <p className="mt-2 text-sm text-default-600">
                    {article.excerpt || article.description}
                  </p>
                </LBCard>

                <LBCard className="bg-content1 border border-default-200 p-4 ">
                  <h3 className="text-sm font-semibold text-default-700">
                    Galerie
                  </h3>
                  <div className="mt-3 flex flex-col gap-4">
                    {/* If there is a gallery or image, show thumbnails. Fallback to cover image. */}
                    {article.gallery && article.gallery.length ? (
                      article.gallery.map((g: any, i: number) => (
                        <LBCard key={i} className="w-full">
                          <img
                            src={g}
                            alt={`gallery-${i}`}
                            className="w-full h-auto  rounded-sm"
                          />
                        </LBCard>
                      ))
                    ) : article.cover_image ? (
                      <LBCard className="w-full">
                        <img
                          src={article.cover_image}
                          alt="cover"
                          className="w-full h-auto rounded-sm col-span-3"
                        />
                      </LBCard>
                    ) : (
                      <div className="col-span-3 h-20 bg-default-100 rounded-sm" />
                    )}
                  </div>
                </LBCard>

                <LBCard className="bg-content1 border border-default-200 p-4  shadow-sm">
                  <h3 className="text-sm font-semibold text-default-700">
                    Tags
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {article.tags && article.tags.length ? (
                      article.tags.map((t: any) => (
                        <span
                          key={t}
                          className="text-xs bg-default-100 px-2 py-1 rounded-md"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-default-500">
                        Aucun tag
                      </span>
                    )}
                  </div>
                </LBCard>
              </aside>
            </article>
          </>
        ) : (
          <div className="text-center py-24">Article non trouvé.</div>
        )}
      </div>
    </main>
  );
}
