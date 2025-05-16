"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any | null | []>(null);
  const fecthData = async () => {
    axios
      .get("/api/product")
      .then((res) => {
        console.log(res.data);
        setData(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        setData([]);
      });
  };

  useEffect(() => {
    if (!data) {
      fecthData();
    }
  }, [data]);
  return (
    <>
      <h1 className="mt-24 w-full  text-center text-2xl font-semibold  pb-8">
        Hello LastBrain.
      </h1>

      <div className="min-h-screen ">
        <div className="max-w-3xl mx-auto p-4">
          {!data && (
            <div className="flex h-[30vh] items-center justify-center ">
              <div className="h-5 w-5 bg-gray-700 dark:bg-gray-200 rounded-full animate-ping"></div>
            </div>
          )}
          {data && (
            <div className="grid grid-cols-2 gap-8">
              {data?.map((item: any) => (
                <div
                  key={item.id}
                  className="p-6 border rounded shadow-sm bg-white/40 dark:bg-black/40"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                  <h3 className="text-xl font-bold uppercase mb-1 text-center">
                    {item.name}
                  </h3>
                  <p className="text-center  mb-2">
                    {item.description || "Aucune description."}
                  </p>
                  <div className="text-sm ">
                    <p>
                      <strong>Prix d'achat :</strong> {item.purchase_price} €
                    </p>
                    <p>
                      <strong>Prix de vente :</strong> {item.sale_price} €
                    </p>
                    <p>
                      <strong>Stock :</strong> {item.stock} {item.unit}
                    </p>
                    <p>
                      <strong>Code produit :</strong> {item.code_product}
                    </p>
                    <p>
                      <strong>Statut :</strong> {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {data && data.length === 0 && (
            <div className="p-4 border rounded">
              <h3 className="font-bold">No data found...</h3>
              <p>Try again later</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
