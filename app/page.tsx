"use client";
import { Spinner, Card, CardBody, Button, Chip, Link, Image } from "@heroui/react";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

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
    public_tags = [],
    social_media = [],
  } = infoSociety;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-200 via-background to-stone-200 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900 p-6">
      <Card className="w-full max-w-3xl p-8">
        <CardBody className="flex flex-col items-center text-center gap-6">
          {logo_url && (
            <Image
              src={logo_url}
              alt={name}
              width={96}
              height={96}
              radius="lg"
              className="object-contain"
            />
          )}
          <h1 className="text-4xl font-bold text-stone-700 dark:text-stone-200">{name}</h1>
          <p className="text-lg text-stone-600 dark:text-stone-300">{description}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {public_tags.slice(0, 6).map((tag: string) => (
              <Chip key={tag} color="primary" variant="flat">
                {tag}
              </Chip>
            ))}
            {public_tags.length > 6 && (
              <Chip variant="bordered">+{public_tags.length - 6}</Chip>
            )}
          </div>
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 text-left text-sm text-stone-600 dark:text-stone-300">
            <p>
              <MapPin className="inline-block mr-2" size={16} />
              {city}, {country}
            </p>
            {website && (
              <p>
                <Globe className="inline-block mr-2" size={16} />
                <Link href={website} target="_blank" className="text-primary">
                  {website}
                </Link>
              </p>
            )}
            <p>
              <Mail className="inline-block mr-2" size={16} />
              {email}
            </p>
            <p>
              <Phone className="inline-block mr-2" size={16} />
              {phone || "-"}
            </p>
          </div>
          {social_media.length > 0 && (
            <div className="flex gap-4 mt-4">
              {social_media.map((s: any) => (
                <Link
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {s.social}
                </Link>
              ))}
            </div>
          )}
          <Button
            as={Link}
            href="/produit"
            color="primary"
            radius="full"
            className="mt-6"
          >
            Découvrir les produits
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
