import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { uploadAvatar } from "../services/avatar.service";
import { getMyModules } from "../services/permissions.service";
import { MODULES, type ModuleKey } from "../types/permissions";

type ProfilData = {
  nom_complet: string | null;
  telephone: string | null;
  fonction: string | null;
  module: string | null;
  avatar_url: string | null;
};

export default function Profil() {
  const [profile, setProfile] =
    useState<ProfilData | null>(null);

  const [modules, setModules] =
    useState<ModuleKey[]>([]);

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // MOT DE PASSE
  // =========================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

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

      setEmail(user.email ?? "");

      const {
        data,
        error: profileError,
      } = await supabase
        .from("profils")
        .select(
          "nom_complet, telephone, fonction, module, avatar_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(profileError.message);
      }

      setProfile(data);

      const authorizedModules =
        await getMyModules();

      setModules(authorizedModules);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le profil."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // PHOTO DE PROFIL
  // =========================

  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const avatarUrl =
        await uploadAvatar(file);

      setProfile((current) =>
        current
          ? {
              ...current,
              avatar_url: avatarUrl,
            }
          : current
      );

      setMessage(
        "Photo de profil mise à jour."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier la photo."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // =========================
  // CHANGEMENT MOT DE PASSE
  // =========================

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword) {
      setError(
        "Veuillez saisir votre mot de passe actuel."
      );
      return;
    }

    if (!newPassword) {
      setError(
        "Veuillez saisir votre nouveau mot de passe."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "Les deux nouveaux mots de passe ne correspondent pas."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "Le nouveau mot de passe doit être différent de l'ancien."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user?.email) {
        throw new Error(
          "Impossible de récupérer votre adresse e-mail."
        );
      }

      // Vérification de l'ancien mot de passe
      const {
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (loginError) {
        throw new Error(
          "Votre mot de passe actuel est incorrect."
        );
      }

      // Modification du mot de passe
      const {
        error: updateError,
      } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Nettoyage
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        "Votre mot de passe a été modifié avec succès."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le mot de passe."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  // =========================
  // OUTILS
  // =========================

  function getInitials(
    name: string | null
  ) {
    if (!name) {
      return "U";
    }

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  function getModuleLabel(
    moduleKey: ModuleKey
  ) {
    return (
      MODULES.find(
        (module) =>
          module.key === moduleKey
      )?.label ?? moduleKey
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Chargement du profil...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* =========================
          EN-TÊTE
      ========================= */}

      <div>
        <p className="text-sm text-blue-400">
          Mon espace
        </p>

        <h1 className="mt-1 text-2xl font-bold text-white">
          Mon profil
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Consultez vos informations personnelles,
          vos autorisations et la sécurité de votre compte.
        </p>
      </div>

      {/* =========================
          MESSAGES
      ========================= */}

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* =========================
            CARTE IDENTITÉ
        ========================= */}

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}

            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Photo de profil"
                  className="h-32 w-32 rounded-full border-4 border-slate-800 object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-800 bg-blue-600 text-3xl font-bold text-white">
                  {getInitials(
                    profile?.nom_complet ?? null
                  )}
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-slate-900 bg-blue-600 text-white transition hover:bg-blue-500"
                title="Modifier la photo"
              >
                {uploading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Camera size={17} />
                )}
              </label>

              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              {profile?.nom_complet ||
                "Utilisateur"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {profile?.fonction ||
                "Aucune fonction définie"}
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Compte actif
            </div>
          </div>
        </div>

        {/* =========================
            INFORMATIONS
        ========================= */}

        <div className="space-y-6">
          {/* Informations personnelles */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <UserCircle size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Informations personnelles
                </h2>

                <p className="text-xs text-slate-500">
                  Informations associées à votre compte
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">
                  Nom complet
                </p>

                <p className="mt-1 text-sm text-slate-200">
                  {profile?.nom_complet ||
                    "Non renseigné"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Adresse e-mail
                </p>

                <p className="mt-1 break-all text-sm text-slate-200">
                  {email || "Non renseignée"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Téléphone
                </p>

                <p className="mt-1 text-sm text-slate-200">
                  {profile?.telephone ||
                    "Non renseigné"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Fonction
                </p>

                <p className="mt-1 text-sm text-slate-200">
                  {profile?.fonction ||
                    "Non renseignée"}
                </p>
              </div>
            </div>
          </div>

          {/* =========================
              SÉCURITÉ
          ========================= */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <KeyRound size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Sécurité du compte
                </h2>

                <p className="text-xs text-slate-500">
                  Modifiez votre mot de passe à tout moment.
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePasswordChange}
              className="space-y-4"
            >
              {/* Ancien mot de passe */}

              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Mot de passe actuel
                </label>

                <div className="relative">
                  <input
                    id="current-password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                    placeholder="Votre mot de passe actuel"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    aria-label={
                      showCurrentPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Nouveau mot de passe
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                    placeholder="Minimum 8 caractères"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    aria-label={
                      showNewPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-slate-600">
                  Minimum 8 caractères.
                </p>
              </div>

              {/* Confirmation */}

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Confirmer le nouveau mot de passe
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingPassword ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Modification...
                    </>
                  ) : (
                    <>
                      <KeyRound size={17} />
                      Modifier le mot de passe
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* =========================
              MODULES AUTORISÉS
          ========================= */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Modules autorisés
                </h2>

                <p className="text-xs text-slate-500">
                  Modules auxquels vous avez actuellement accès
                </p>
              </div>
            </div>

            {modules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/50 px-4 py-6 text-center">
                <p className="text-sm text-slate-400">
                  Aucun module ne vous a encore été attribué.
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Contactez un administrateur pour obtenir
                  des autorisations.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {modules.map((module) => (
                  <div
                    key={module}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {getModuleLabel(module)}
                      </p>

                      <p className="text-xs text-emerald-400">
                        Autorisé
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profile?.module && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs text-slate-600">
                  Ancien module principal :{" "}
                  <span className="text-slate-400">
                    {profile.module}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}