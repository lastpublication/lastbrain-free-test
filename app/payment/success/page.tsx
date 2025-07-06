import React from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-900 dark:via-gray-950 dark:to-green-900">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 flex flex-col items-center border border-green-100 dark:border-green-800">
        <CheckCircle2 className="text-green-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
          Paiement réussi !
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-6 text-center max-w-md">
          Merci pour votre achat. Votre paiement a bien été pris en compte.
          <br />
          Vous recevrez un email de confirmation avec votre facture.
        </p>
        <Link
          href="/"
          className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
