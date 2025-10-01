"use client";
import Signup from "../../components/Signup";
import { LoginForm } from "../../components/LoginForm";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginStep({ user, onNext }: any) {
  const auth = useAuth();
  useEffect(() => {
    if (auth.user) onNext();
  }, [auth.user]);

  if (auth.user) return null;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Connexion</h3>
          <div className="w-full md:w-2/3 mx-auto">
            <LoginForm />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Inscription</h3>

          <Signup />
        </div>
      </div>
    </div>
  );
}
