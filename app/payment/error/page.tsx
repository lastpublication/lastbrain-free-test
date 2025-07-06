import React from "react";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentErrorPage() {
  return (
    <main className="absolute top-0 w-screen flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-100/50 via-white to-red-300/30 dark:from-red-900/40 dark:via-gray-950 dark:to-red-900/20">
      <div className="bg-white dark:bg-background rounded-2xl shadow-xl p-10 flex flex-col items-center border border-red-100 dark:border-red-800">
        <XCircle className="text-red-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
          Erreur de paiement
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-6 text-center max-w-md">
          Une erreur est survenue lors du traitement de votre paiement.
          <br />
          Veuillez réessayer ou contacter le support si le problème persiste.
        </p>
        <Link
          href="/"
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
