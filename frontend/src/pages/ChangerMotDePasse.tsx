import { useState } from "react";
import type { FormEvent } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

export default function ChangerMotDePasse() {
  const navigate = useNavigate();

  const [nouveauMotDePasse, setNouveauMotDePasse] =
    useState("");

  const [confirmation, setConfirmation] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (nouveauMotDePasse.length < 8) {
      setError(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (nouveauMotDePasse !== confirmation) {
      setError(
        "Les deux mots de passe ne correspondent pas."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("Utilisateur non connecté.");
      }

      const { error: passwordError } =
        await supabase.auth.updateUser({
          password: nouveauMotDePasse,
        });

      if (passwordError) {
        throw new Error(passwordError.message);
      }

      const { error: profileError } =
        await supabase
          .from("profils")
          .update({
            doit_changer_mot_de_passe: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/espace", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le mot de passe."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={32} />
          </div>

          <h1 className="mt-5 text-xl font-bold">
            Mot de passe modifié
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Votre nouveau mot de passe a été enregistré.
          </p>

          <p className="mt-4 text-xs text-slate-600">
            Redirection vers votre espace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
          {/* Logo / icône */}
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400">
              <ShieldCheck size={28} />
            </div>
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-bold">
              Changement de mot de passe
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Pour sécuriser votre compte, vous devez
              modifier votre mot de passe avant de
              continuer.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            {/* Nouveau mot de passe */}
            <div>
              <label
                htmlFor="nouveau-mot-de-passe"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Nouveau mot de passe
              </label>

              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  id="nouveau-mot-de-passe"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={nouveauMotDePasse}
                  onChange={(event) =>
                    setNouveauMotDePasse(
                      event.target.value
                    )
                  }
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label
                htmlFor="confirmation"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirmer le mot de passe
              </label>

              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  id="confirmation"
                  type={
                    showConfirmation
                      ? "text"
                      : "password"
                  }
                  value={confirmation}
                  onChange={(event) =>
                    setConfirmation(
                      event.target.value
                    )
                  }
                  placeholder="Retapez votre mot de passe"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmation(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  tabIndex={-1}
                >
                  {showConfirmation ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Règles */}
            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs font-medium text-slate-400">
                Exigences du mot de passe
              </p>

              <div className="mt-2 space-y-1.5 text-xs text-slate-500">
                <p>• Au moins 8 caractères</p>
                <p>• Les deux mots de passe doivent être identiques</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Modification...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Enregistrer le nouveau mot de passe
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-600">
          NEXUS ERP Management
        </p>
      </div>
    </div>
  );
}