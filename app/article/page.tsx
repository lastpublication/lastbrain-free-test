"use client";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { a } from "framer-motion/client";
import { LBCard } from "../components/ui/Primitives";
import { CardBody } from "@heroui/react";

export default function Page() {
  const [articles, setArticles] = useState<any[] | null>(null);
  const fetchArticles = async () => {
    const res = await fetch("/api/article");
    const data = await res.json();
    setArticles(data.data || []);
  };

  useEffect(() => {
    !articles && fetchArticles();
  }, [articles]);

  return (
    <div className="max-w-7xl mx-auto pt-8 px-4 md:px-0">
      <h1 className="mb-8">Liste des catégories</h1>
      {!articles && <Loading />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-24">
        {articles &&
          articles.map((article, idx) => (
            <LBCard key={idx}>
              <CardBody>{article.name}</CardBody>
            </LBCard>
          ))}
      </div>
    </div>
  );
}
