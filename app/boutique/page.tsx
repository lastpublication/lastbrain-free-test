"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { LBCard } from "../components/ui/Primitives";
import { useRouter } from "next/navigation";

export default function Page() {
  const [categories, setCategories] = useState<any[] | null>(null);
  const router = useRouter();
  const fetchcategories = async () => {
    axios.get("/api/catalog").then((res) => {
      setCategories(res.data.data || []);
    });
  };

  useEffect(() => {
    !categories && fetchcategories();
  }, [categories]);
  return (
    <div className="max-w-7xl mx-auto pt-8 px-4 md:px-0">
      <h1 className="mb-8">Liste des categories</h1>
      {!categories && <Loading />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-24">
        {categories &&
          categories.map((category) => (
            <LBCard
              isPressable
              onPress={() => {
                setTimeout(() => {
                  router.push(`/boutique/${category.slug}`);
                }, 400);
              }}
              key={category.id}
              className="p-4 border mb-4 hover:scale-105 hover:border-secondary"
            >
              <CardHeader className="mb-2">
                <h2 className="capitalize text-2xl font-bold mb-2">
                  {category.name}
                </h2>
              </CardHeader>
              <CardBody>
                <p>{category.description}</p>
              </CardBody>
            </LBCard>
          ))}
      </div>
    </div>
  );
}
