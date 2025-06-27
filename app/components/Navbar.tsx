"use client";
import {
  Badge,
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";
import { ThemeSwitch } from "./SwitchMode";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const NavbarComponent = () => {
  const [number, setNumber] = useState(0);
  const router = useRouter();
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
    <Navbar shouldHideOnScroll className=" glass shadow-sm" position="sticky">
      <NavbarBrand>
        <Link
          color="foreground"
          as={"button"}
          onPress={() => {
            router.push("/");
          }}
        >
          Hello LastBrain.
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
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
      </NavbarContent>
      <NavbarContent justify="end" className="gap-4">
        {number > 0 ? (
          <Badge content={number} color="danger">
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
    </Navbar>
  );
};
