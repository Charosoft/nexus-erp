import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleUserRound,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { getMyModules } from "../services/permissions.service";
import { MODULES } from "../types/permissions";
import type { ModuleKey } from "../types/permissions";

type Profil = {
  nom_complet: string | null;
  telephone: string | null;
  fonction: string | null;
  module: string | null;
  avatar_url: string | null;
};

const moduleIcons: Record<
  ModuleKey,
  React.ComponentType<{ size?: number }>
> = {
  dashboard: BarChart3,
  clients: CircleUserRound,
  stock: Package,
  ventes: ShoppingCart,
  fournisseurs: Truck,
  comptabilite: Receipt,
  tresorerie: Wallet,
};

const moduleRoutes: Record<ModuleKey, string> = {
  dashboard: "/dashboard",
  clients: "/clients",
  stock: "/stock",
  ventes: "/ventes",
  fournisseurs: "/fournisseurs",
  comptabilite: "/comptabilite",
  tresorerie: "/tresorerie",
};

export default function Espace() {
  const [profil, setProfil] =
    useState<Profil | null>(null);

  const [modules, setModules] =
    useState<ModuleKey[]>([]);

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadEspace() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        setEmail(user.email ?? "");

        const [
          { data: profilData, error: profilError },
          modulesData,
        ] = await Promise.all([
          supabase
            .from("profils")
            .select(
              "nom_complet, telephone, fonction, module, avatar_url"
            )
            .eq("id", user.id)
            .maybeSingle(),

          getMyModules(),
        ]);

        if (profilError) {
          throw profilError;
        }

        if (mounted) {
          setProfil(profilData);
          setModules(modulesData);
        }
      } catch (error) {
        console.error(
          "Erreur chargement espace personnel :",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEspace();

    return () => {
      mounted = false;
    };
  }, []);

  const displayName =
    profil?.nom_complet ||
    email.split("@")[0] ||
    "Utilisateur";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");

  const availableModules = MODULES.filter(
    (module) => modules.includes(module.key)
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="text-sm text-slate-400">
            Chargement de votre espace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* En-tête */}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/15 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            {profil?.avatar_url ? (
              <img
                src={profil.avatar_url}
                alt="Photo de profil"
                className="h-20 w-20 shrink-0 rounded-full border-4 border-slate-800 object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-slate-800 bg-blue-500/10 text-xl font-bold text-blue-400">
                {initials || (
                  <CircleUserRound size={34} />
                )}
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
                <BriefcaseBusiness size={17} />
                <span>Mon espace</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Bonjour, {displayName}
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                {profil?.fonction ||
                  "Utilisateur NEXUS"}
              </p>
            </div>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <CircleUserRound size={30} />
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-400">
          Bienvenue dans votre espace personnel NEXUS.
          Retrouvez ici vos informations et les modules
          auxquels vous avez accès.
        </p>
      </section>

      {/* Informations compte */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Compte
          </p>

          <p className="mt-2 truncate text-sm font-medium text-white">
            {email || "Adresse non disponible"}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 size={14} />
            Compte actif
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Fonction
          </p>

          <p className="mt-2 text-sm font-medium text-white">
            {profil?.fonction ||
              "Fonction non définie"}
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Profil professionnel
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Modules autorisés
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {modules.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            module{modules.length > 1 ? "s" : ""} métier
            disponible
            {modules.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Modules */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Mes modules
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Accès disponibles pour votre compte
          </p>
        </div>

        {availableModules.length === 0 ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <BriefcaseBusiness size={25} />
            </div>

            <h3 className="text-base font-semibold text-white">
              Aucun module métier attribué
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Votre compte est actif, mais aucun module
              métier ne vous a encore été attribué.
              Contactez votre administrateur.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableModules.map((module) => {
              const Icon =
                moduleIcons[module.key];

              return (
                <Link
                  key={module.key}
                  to={moduleRoutes[module.key]}
                  className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-blue-500/30 hover:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Icon size={21} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                    />
                  </div>

                  <h3 className="mt-4 font-semibold text-white">
                    {module.label}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Accéder au module
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Liens personnels */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/profil"
          className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-blue-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <CircleUserRound size={21} />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Mon profil
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Consulter vos informations personnelles
              </p>
            </div>

            <ArrowRight
              size={18}
              className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
            />
          </div>
        </Link>

        <Link
          to="/activites"
          className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-blue-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Activity size={21} />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Mes activités
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Consulter l'historique de vos actions
              </p>
            </div>

            <ArrowRight
              size={18}
              className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-purple-400"
            />
          </div>
        </Link>
      </section>
    </div>
  );
}