import { useEffect, useState } from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "./lib/supabase";

import { getMyModules } from "./services/permissions.service";
import type { ModuleKey } from "./types/permissions";

// Pages publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";
import Equipe from "./pages/Equipe";
import NotFound from "./pages/NotFound";
import Utilisateurs from "./pages/admin/Utilisateurs";

// Pages privées
import Espace from "./pages/Espace";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Stock from "./pages/Stock";
import Ventes from "./pages/Ventes";
import Fournisseurs from "./pages/Fournisseurs";
import Comptabilite from "./pages/Comptabilite";
import Tresorerie from "./pages/Tresorerie";
import Profil from "./pages/Profil";
import Activites from "./pages/Activites";

// Administration
import AdminEquipe from "./pages/AdminEquipe";

// Layout
import Sidebar from "./components/layout/Sidebar";

type ModuleGuardProps = {
  module: ModuleKey;
  children: React.ReactNode;
};

function ModuleGuard({
  module,
  children,
}: ModuleGuardProps) {
  const [allowed, setAllowed] =
    useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkPermission() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setAllowed(false);
          }
          return;
        }

        const {
          data: adminData,
          error: adminError,
        } = await supabase.rpc("est_admin");

        if (adminError) {
          throw adminError;
        }

        if (adminData === true) {
          if (mounted) {
            setAllowed(true);
          }
          return;
        }

        const modules = await getMyModules();

        if (mounted) {
          setAllowed(modules.includes(module));
        }
      } catch (error) {
        console.error(
          "Erreur vérification permission :",
          error
        );

        if (mounted) {
          setAllowed(false);
        }
      }
    }

    checkPermission();

    return () => {
      mounted = false;
    };
  }, [module]);

  if (allowed === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="text-sm text-slate-400">
            Vérification des autorisations...
          </p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            🔒
          </div>

          <h2 className="mb-2 text-xl font-semibold text-white">
            Accès refusé
          </h2>

          <p className="mb-6 text-sm leading-6 text-slate-400">
            Vous n'avez pas les autorisations nécessaires
            pour accéder à ce module.
          </p>

          <button
            onClick={() => {
              window.location.href = "/espace";
            }}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Retour à mon espace
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] =
    useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setIsAdmin(false);
          }
          return;
        }

        const {
          data,
          error,
        } = await supabase.rpc("est_admin");

        if (error) {
          throw error;
        }

        if (mounted) {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error(
          "Erreur vérification administrateur :",
          error
        );

        if (mounted) {
          setIsAdmin(false);
        }
      }
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="text-slate-400">
            Vérification des autorisations...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/espace"
        replace
      />
    );
  }

  return <>{children}</>;
}

function ProtectedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((current) => !current)
        }
      />

      <main
        className={[
          "min-h-screen transition-all duration-300",
          sidebarCollapsed
            ? "md:ml-20"
            : "md:ml-72",
        ].join(" ")}
      >
        <header className="flex h-16 items-center border-b border-slate-800/80 bg-slate-950/95 px-4 backdrop-blur-xl md:hidden">
          <div className="pl-12">
            <div className="text-sm font-bold tracking-wide text-white">
              NEXUS
            </div>

            <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-blue-400">
              ERP System
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-5 md:p-8">
          <Routes>
            <Route
              path="/espace"
              element={<Espace />}
            />

            <Route
              path="/dashboard"
              element={
                <ModuleGuard module="dashboard">
                  <Dashboard />
                </ModuleGuard>
              }
            />

            <Route
              path="/clients"
              element={
                <ModuleGuard module="clients">
                  <Clients />
                </ModuleGuard>
              }
            />

            <Route
              path="/stock"
              element={
                <ModuleGuard module="stock">
                  <Stock />
                </ModuleGuard>
              }
            />

            <Route
              path="/ventes"
              element={
                <ModuleGuard module="ventes">
                  <Ventes />
                </ModuleGuard>
              }
            />

            <Route
              path="/fournisseurs"
              element={
                <ModuleGuard module="fournisseurs">
                  <Fournisseurs />
                </ModuleGuard>
              }
            />

            <Route
              path="/comptabilite"
              element={
                <ModuleGuard module="comptabilite">
                  <Comptabilite />
                </ModuleGuard>
              }
            />

            <Route
              path="/tresorerie"
              element={
                <ModuleGuard module="tresorerie">
                  <Tresorerie />
                </ModuleGuard>
              }
            />

            <Route
              path="/profil"
              element={<Profil />}
            />

            <Route
              path="/activites"
              element={<Activites />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/espace"
                  replace
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setSession(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="text-slate-400">
            Chargement de NEXUS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/equipe"
        element={<Equipe />}
      />

      <Route
        path="/inscription"
        element={<Inscription />}
      />

      <Route
        path="/login"
        element={
          session ? (
            <Navigate
              to="/espace"
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/admin"
        element={
          session ? (
            <AdminGuard>
              <AdminEquipe />
            </AdminGuard>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      <Route
        path="/admin/utilisateurs"
        element={
          session ? (
            <AdminGuard>
              <Utilisateurs />
            </AdminGuard>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {session ? (
        <Route
          path="/*"
          element={<ProtectedLayout />}
        />
      ) : (
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      )}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}