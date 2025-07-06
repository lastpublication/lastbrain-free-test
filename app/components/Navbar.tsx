"use client";
import {
  Badge,
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { ThemeSwitch } from "./SwitchMode";
import { Home, ShoppingBag, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfoSociety } from "../context/InfoSocietyContext";

export const NavbarComponent = () => {
  const infoSociety = useInfoSociety();

  const [number, setNumber] = useState(0);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setNumber(
          JSON.parse(stored).reduce(
            (acc: number, item: { quantity: number }) =>
              acc + (item.quantity || 1),
            0
          )
        );
      } catch {
        setNumber(0);
      }
    } else {
      setNumber(0);
    }

    // Optionnel : écoute le stockage pour MAJ en temps réel
    const onStorage = () => {
      const updated = localStorage.getItem("cart");
      if (!updated) return;
      setNumber(
        JSON.parse(updated).reduce(
          (acc: number, item: { quantity: number }) =>
            acc + (item.quantity || 1),
          0
        )
      );
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const updateNumber = () => {
      const stored = localStorage.getItem("cart");
      setNumber(
        stored
          ? Number(
              JSON.parse(stored).reduce(
                (acc: number, item: { quantity: number }) =>
                  acc + (item.quantity || 1),
                0
              )
            )
          : 0
      );
    };

    updateNumber();

    window.addEventListener("cartUpdated", updateNumber);
    window.addEventListener("storage", updateNumber);

    return () => {
      window.removeEventListener("cartUpdated", updateNumber);
      window.removeEventListener("storage", updateNumber);
    };
  }, []);

  if (typeof window !== "undefined" && typeof window.btoa === "undefined") {
    window.btoa = (str) => Buffer.from(str, "binary").toString("base64");
  }

  if (!mounted) return null;

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      shouldHideOnScroll
      className=" glass shadow-sm"
      position="sticky"
    >
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
      <NavbarBrand>
        {infoSociety && infoSociety.logo_url && infoSociety?.name && (
          <Link
            color="foreground"
            as={"button"}
            onPress={() => {
              router.push("/");
            }}
          >
            {infoSociety?.logo_url ? (
              <>
                <img
                  src={infoSociety.logo_url}
                  alt={infoSociety.name || "Mon Entreprise"}
                  className="h-8"
                />
                {infoSociety?.name || "Mon Entreprise"}
              </>
            ) : (
              <>{infoSociety?.name || "Mon Entreprise"}</>
            )}
          </Link>
        )}
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link
            as={"button"}
            onPress={() => {
              router.push("/produit");
            }}
            color="foreground"
            underline="hover"
          >
            Produit
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end" className="gap-4">
        {number > 0 ? (
          <Badge content={number} color="primary">
            <Button
              onPress={() => {
                router.push("/panier");
              }}
              variant="light"
              isIconOnly
              radius="full"
              color="primary"
            >
              <ShoppingCart size={24} />
            </Button>
          </Badge>
        ) : (
          <Button
            as={Link}
            isDisabled
            href="/panier"
            variant="light"
            isIconOnly
            radius="full"
            color="primary"
          >
            <ShoppingCart size={24} />
          </Button>
        )}
        <ThemeSwitch />
      </NavbarContent>
      <NavbarMenu className="pt-5 space-y-5">
        <NavbarMenuItem>
          <Link
            className="w-full text-2xl"
            as={"button"}
            onPress={() => {
              setIsMenuOpen(false);
              router.push("/");
            }}
            color="foreground"
          >
            <Home size={24} className="me-5" />
            Accueil
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link
            className="w-full text-2xl"
            as={"button"}
            onPress={() => {
              setIsMenuOpen(false);

              router.push("/produit");
            }}
            color="foreground"
          >
            <ShoppingBag size={24} className="me-5" />
            Produit
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link
            className="w-full text-2xl"
            as={"button"}
            onPress={() => {
              setIsMenuOpen(false);
              router.push("/panier");
            }}
            color="foreground"
          >
            <ShoppingCart size={24} className="me-5" />
            Panier
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};
