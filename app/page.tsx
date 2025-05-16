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
      <h1 className="mt-24 w-full  text-center bg-gray-100 text-2xl font-semibold text-gray-800">
        Hello LastBrain.
      </h1>

      <div className="min-h-screen flex items-center justify-center ">
        <div className="max-w-5xl mx-auto p-4">
          {!data && (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 bg-gray-700 rounded-full animate-ping"></div>
            </div>
          )}
          {data && (
            <div className="grid grid-cols-2 gap-8">
              {data?.map((item: any) => (
                <div key={item.id} className="p-8 border rounded">
                  <h3 className="font-bold text-center text-3xl uppercase">
                    {item.name}
                  </h3>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          {data && data.length === 0 && (
            <div className="p-4 border rounded">
              <h3 className="font-bold">No data found</h3>
              <p>Try again later</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
