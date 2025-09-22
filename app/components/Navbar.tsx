"use client";
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@heroui/react";
import { ThemeSwitch } from "./SwitchMode";
import {
  FileText,
  Home,
  Power,
  ShoppingBag,
  ShoppingCart,
  User,
  User2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfoSociety } from "../context/InfoSocietyContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { LBButton } from "./ui/Primitives";
import { Loading } from "./Loading";

export const NavbarComponent = () => {
  const infoSociety = useInfoSociety();
  const { user, setUser } = useAuth();
  const [number, setNumber] = useState(0);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [menuProduct, SetMenuProduct] = useState<any | null>(null);
  const [menuArticle, SetMenuArticle] = useState<any | null>(null);

  const [mounted, setMounted] = useState(false);
  const [openBoutique, setOpenBoutique] = useState(false);
  const [openArticle, setOpenArticle] = useState(false);
  const fetchMenu = async () => {
    axios.get("/api/catalog").then((response) => {
      if (response.data.data) {
        SetMenuProduct(response.data.data || []);
      } else {
        SetMenuProduct([]);
      }
    });

    axios.get("/api/article").then((response) => {
      if (response.data) {
        SetMenuArticle(response.data.data || []);
      } else {
        SetMenuArticle([]);
      }
    });
  };
  useEffect(() => {
    setMounted(true);
    if (!menuProduct) fetchMenu();
  }, [menuProduct]);
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

  if (!menuProduct && !menuArticle) return <Loading />;

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      shouldHideOnScroll
      maxWidth="2xl"
      className=" glass shadow-none "
      position="sticky"
    >
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
      <NavbarBrand>
        {infoSociety && infoSociety.logo_url && infoSociety?.name ? (
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
                  className="h-8 me-4"
                />
                {infoSociety?.name || "Mon Entreprise"}
              </>
            ) : (
              <>{infoSociety?.name || "Mon Entreprise"}</>
            )}
          </Link>
        ) : (
          <div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        )}
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <div
          onMouseEnter={() => {
            setOpenBoutique(true);
          }}
          onMouseLeave={() => setOpenBoutique(false)}
        >
          {menuProduct && menuProduct.length > 0 ? (
            <Dropdown isOpen={openBoutique} onOpenChange={setOpenBoutique}>
              <NavbarItem>
                <DropdownTrigger>
                  <LBButton
                    as={Link}
                    onPress={() => {
                      router.push("/boutique");
                    }}
                    startContent={<ShoppingBag size={24} className="me-1" />}
                  >
                    Boutique
                  </LBButton>
                </DropdownTrigger>
              </NavbarItem>
              <DropdownMenu
                aria-label={"Menu des catégories"}
                itemClasses={{
                  base: "gap-4",
                }}
              >
                {menuProduct.map((category: any) => (
                  <DropdownItem
                    onPress={() => {
                      setOpenBoutique(false);
                      router.push(`/boutique/${category.slug}`);
                    }}
                    className="capitalize"
                    key={category.id}
                  >
                    {category.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <LBButton
              as={Link}
              onPress={() => {
                router.push("/boutique");
              }}
              startContent={<ShoppingBag size={24} className="me-1" />}
            >
              Boutique
            </LBButton>
          )}
        </div>
        <div
          onMouseEnter={() => {
            setOpenArticle(true);
          }}
          onMouseLeave={() => setOpenArticle(false)}
        >
          {Array.isArray(menuArticle) && menuArticle.length > 0 ? (
            <Dropdown isOpen={openArticle} onOpenChange={setOpenArticle}>
              <NavbarItem>
                <DropdownTrigger>
                  <LBButton
                    as={Link}
                    onPress={() => {
                      router.push("/article");
                    }}
                    startContent={<FileText size={24} className="me-1" />}
                  >
                    Article
                  </LBButton>
                </DropdownTrigger>
              </NavbarItem>
              <DropdownMenu
                aria-label={"Menu des catégories"}
                itemClasses={{
                  base: "gap-4",
                }}
              >
                {menuArticle.map((article: any) => (
                  <DropdownItem
                    onPress={() => {
                      setOpenBoutique(false);
                      router.push(`/article/${article.slug}`);
                    }}
                    className="capitalize"
                    key={article.id}
                  >
                    {article.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <LBButton
              as={Link}
              onPress={() => {
                router.push("/article");
              }}
              startContent={<FileText size={24} className="me-1" />}
            >
              Article
            </LBButton>
          )}
        </div>
      </NavbarContent>
      <NavbarContent justify="end" className="gap-4">
        {number > 0 ? (
          <Badge content={number} color="secondary" className="text-foreground">
            <LBButton
              onPress={() => {
                router.push("/panier");
              }}
              isIconOnly
            >
              <ShoppingCart size={24} />
            </LBButton>
          </Badge>
        ) : (
          <LBButton as={Link} isDisabled href="/panier" isIconOnly>
            <ShoppingCart size={24} />
          </LBButton>
        )}
        {!user && (
          <LBButton isIconOnly onPress={() => router.push("/login")}>
            <User2 size={24} className="text-foreground" />
          </LBButton>
        )}
        {user && (
          <>
            <LBButton
              className="hidden md:flex"
              onPress={() => router.push("/private")}
            >
              <User2 size={24} className="text-foreground" />
              {user?.first_name || ""} {user?.last_name?.slice(0, 1) || ""}.
            </LBButton>
            <LBButton
              className="flex md:hidden"
              isIconOnly
              onPress={() => {
                router.push("/private");
                setIsMenuOpen(false);
              }}
            >
              <User2 size={24} className="text-foreground" />
            </LBButton>
          </>
        )}
        {user && (
          <LBButton
            isIconOnly
            className="hidden md:flex"
            color="danger"
            onPress={() => {
              axios.post("/api/logout").then(() => {
                localStorage.removeItem("cart");
                router.push("/");
                setUser(null);
                window.localStorage.removeItem("user");
              });
            }}
          >
            <Power size={24} />
          </LBButton>
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

              router.push("/boutique");
            }}
            color="foreground"
          >
            <ShoppingBag size={24} className="me-5" />
            Boutique
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link
            className="w-full text-2xl"
            as={"button"}
            onPress={() => {
              setIsMenuOpen(false);

              router.push("/article");
            }}
            color="foreground"
          >
            <FileText size={24} className="me-5" />
            Article
          </Link>
        </NavbarMenuItem>
        {!user && (
          <NavbarMenuItem>
            <Link
              className="w-full text-2xl"
              as={"button"}
              onPress={() => {
                setIsMenuOpen(false);
                router.push("/login");
              }}
              color="foreground"
            >
              <User2 size={24} className="me-5" />
              Connexion
            </Link>
          </NavbarMenuItem>
        )}

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
        {user && (
          <>
            <NavbarMenuItem>
              <Link
                className="mt-8 w-full text-2xl"
                as={"button"}
                onPress={() => {
                  setIsMenuOpen(false);
                  axios.post("/api/logout").then(() => {
                    localStorage.removeItem("cart");
                    router.push("/");
                    setUser(null);
                    window.localStorage.removeItem("user");
                  });
                }}
                color="foreground"
              >
                <Power size={24} className="me-5" />
                Déconnexion
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
};
