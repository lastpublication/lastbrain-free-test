import { Suspense } from "react";
import "../styles/globals.css";
import { NavbarComponent } from "./components/Navbar";
import { Providers } from "./Providers";
import { InfoSocietyProvider } from "./context/InfoSocietyContext";
import { AuthProvider } from "./context/AuthContext";
import { TriangleAlert } from "lucide-react";
import AffProvider from "./context/AffContext";
import { readAffiliateCookie } from "./utils/aff";
import { GlobalProvider } from "./context/GlobalContext";
import Link from "next/link";

export const metadata = {
  title: "lastbrain - Site de démonstration",
  description: "Une plateforme e-commerce de démonstration pour lastbrain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const aff = readAffiliateCookie(); // server-side

  const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";
  return (
    <html suppressHydrationWarning lang="en">
      <body className=" bg-background min-h-screen">
        <GlobalProvider>
          <AffProvider initial={aff}>
            <InfoSocietyProvider>
              <Providers
                themeProps={{ attribute: "data-theme", defaultTheme: "light" }}
              >
                <AuthProvider>
                  <Suspense fallback={<div>Loading...</div>}>
                    {isDemo && (
                      <div className="w-screen relative top-0 h-10 bg-danger z-50 flex items-center justify-center text-white text-sm uppercase gap-5">
                        <TriangleAlert size={24} />
                        {"Demo Mode"}
                      </div>
                    )}
                    <NavbarComponent />
                    {children}
                  </Suspense>
                  <div className=" fixed bottom-0 left-0 right-0 bg-white/10 dark:bg-black/10 backdrop-blur-lg shadow">
                    <div className="container mx-auto px-4 py-2">
                      {/* Footer content goes here */}
                      <div className="flex justify-end gap-4">
                        <div className="hover:text-sm text-[.6em] transition-all  ease-out">
                          <Link href="https://lastbrain.io">
                            copyright © 2025 lastbrain
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </AuthProvider>
              </Providers>
            </InfoSocietyProvider>
          </AffProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
