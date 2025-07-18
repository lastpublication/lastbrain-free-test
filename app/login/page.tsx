import { LoginForm } from "../components/LoginForm";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
        <LoginForm />
      </div>
    </div>
  );
}
