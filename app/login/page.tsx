import { LoginForm } from "../components/LoginForm";
import Signup from "../components/Signup";

export default function Page() {
  return (
    <div className="w-full max-w-[60vw] mx-auto mt-24 pb-32">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="">
          <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
          <LoginForm />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center">Inscription</h1>
          <Signup />
        </div>
      </div>
    </div>
  );
}
