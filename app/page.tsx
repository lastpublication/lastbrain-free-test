"use client";
import { Spinner } from "@heroui/react";

import { useInfoSociety } from "./context/InfoSocietyContext";

export default function Home() {
  const infoSociety = useInfoSociety();
  if (!infoSociety) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const {
    name,
    logo_url,
    description,
    city,
    country,
    website,
    email,
    phone,
    siret,
    tva_number,
    sector_of_activity,
    date_establishment,
    public_tags = [],
    social_media = [],
  } = infoSociety;

  return (
    <main
      className="absolute top-0 pt-12 w-screen min-h-screen bg-gradient-to-br from-stone-300 via-background to-stone-300 dark:from-stone-900 dark:via-stone-950 dark:to-back
     flex flex-col items-center justify-start p-5"
    >
      <section className=" w-full max-w-3xl mx-auto mt-16 p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-stone-100 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
          {logo_url && (
            <img
              src={logo_url}
              alt={name}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-stone-200 dark:border-stone-900 shadow-lg bg-white"
            />
          )}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-stone-700 dark:text-stone-300 mb-2 drop-shadow-lg">
              {name}
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-300 font-medium mb-1">
              {sector_of_activity}
            </p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
              {public_tags.slice(0, 4).map((tag: string) => (
                <span
                  key={tag}
                  className="bg-stone-100 dark:bg-stone-950 text-stone-700 dark:text-stone-200 px-2 py-1 rounded-full text-xs font-semibold shadow"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mb-8 text-xl text-stone-700 dark:text-stone-200 leading-relaxed text-center sm:text-left">
          {description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <span className="font-semibold text-stone-600 dark:text-stone-300">
              Ville :
            </span>{" "}
            {city}
          </div>
          <div>
            <span className="font-semibold text-stone-600 dark:text-stone-300">
              Pays :
            </span>{" "}
            {country}
          </div>
          <div>
            <span className="font-semibold text-stone-600 dark:text-stone-300">
              SIRET :
            </span>{" "}
            {siret}
          </div>
          <div>
            <span className="font-semibold text-stone-600 dark:text-stone-300">
              TVA :
            </span>{" "}
            {tva_number || "-"}
          </div>
          <div>
            <span className="font-semibold text-stone-600 dark:text-stone-300">
              Création :
            </span>{" "}
            {date_establishment}
          </div>

          <div>
            <span className="font-semibold text-stone-600 dark:text-stone-300">
              Email :
            </span>{" "}
            {email}
          </div>
          <div>
            <span className="font-semibold text-stone-600 dark:text-stone-300">
              Téléphone :
            </span>{" "}
            {phone || "-"}
          </div>
        </div>
        {Array.isArray(public_tags) && public_tags.length > 4 && (
          <div className="mb-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            {public_tags.slice(4, 12).map((tag: string) => (
              <span
                key={tag}
                className="bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-200 px-2 py-1 rounded-full text-xs font-semibold shadow"
              >
                {tag}
              </span>
            ))}
            {public_tags.length > 12 && (
              <span className="text-xs text-stone-400">
                +{public_tags.length - 12} autres
              </span>
            )}
          </div>
        )}
        {Array.isArray(social_media) && social_media.length > 0 && (
          <div className="flex gap-6 mt-6 justify-center sm:justify-start">
            {social_media.map((s: any) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-500 dark:text-stone-300 hover:underline text-lg font-semibold flex items-center gap-2"
              >
                {s.social}
              </a>
            ))}
          </div>
        )}
        <div className="mt-10 flex justify-center">
          <a
            href={"/produit"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transition"
          >
            Découvrir les produits
          </a>
        </div>
      </section>
    </main>
  );
}
