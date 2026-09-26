import { ArrowLeft, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
          <FileQuestion size={32} />
        </div>

        <h1 className="text-5xl font-bold mb-4">404</h1>

        <h2 className="text-xl font-semibold mb-3">
          Page introuvable
        </h2>

        <p className="text-slate-500 mb-8">
          La page que vous recherchez n'existe pas.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
        >
          <ArrowLeft size={18} />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}