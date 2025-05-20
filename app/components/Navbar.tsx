"use client";
import {
  Badge,
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";
import { SwitchMode } from "./SwitchMode";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export const NavbarComponent = () => {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setNumber(JSON.parse(stored).length);
      } catch {
        setNumber(0);
      }
    } else {
      setNumber(0);
    }

    // Optionnel : écoute le stockage pour MAJ en temps réel
    const onStorage = () => {
      const updated = localStorage.getItem("cart");
      setNumber(updated ? JSON.parse(updated).length : 0);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const updateNumber = () => {
      const stored = localStorage.getItem("cart");
      setNumber(stored ? JSON.parse(stored).length : 0);
    };

    updateNumber();

    window.addEventListener("cartUpdated", updateNumber);
    window.addEventListener("storage", updateNumber);

    return () => {
      window.removeEventListener("cartUpdated", updateNumber);
      window.removeEventListener("storage", updateNumber);
    };
  }, []);
  return (
    <Navbar shouldHideOnScroll>
      <NavbarBrand>
        <Link color="foreground" href="/">
          Hello LastBrain.
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <Link href="/produit" color="foreground" underline="hover">
          Produit
        </Link>
      </NavbarContent>
      <NavbarContent justify="end" className="gap-4">
        {number > 0 ? (
          <Badge content={number} color="danger">
            <Button
              as={Link}
              href="/panier"
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
        <SwitchMode />
      </NavbarContent>
    </Navbar>
  );
};
