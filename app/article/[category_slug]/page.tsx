"use client";
import { useEffect, useState } from "react";

import { a } from "framer-motion/client";

import { CardBody } from "@heroui/react";
import { useParams } from "next/navigation";
import { Loading } from "../../components/Loading";
import { LBCard } from "../../components/ui/Primitives";
import axios from "axios";

export default function Page() {
  const params = useParams();
  const category_slug = params.category_slug as string;
  const [articles, setArticles] = useState<any[] | null>(null);
  const fetchArticles = async () => {
    await axios
      .get(`/api/article?categorySlug=${category_slug}`)
      .then((res) => {
        console.log(res.data.data);
        setArticles(res.data.data || []);
      })
      .catch(() => {
        setArticles([]);
      });
  };

  useEffect(() => {
    !articles && fetchArticles();
  }, [articles]);

  return (
    <div className="max-w-7xl mx-auto pt-8 px-4 md:px-0">
      <h1 className="mb-8">Liste des catégories</h1>
      {!articles && <Loading />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-24">
        {Array.isArray(articles) &&
          articles.length > 0 &&
          articles.map((article, idx) => (
            <LBCard key={idx}>
              <CardBody>{article.title}</CardBody>
            </LBCard>
          ))}
      </div>
    </div>
  );
}
