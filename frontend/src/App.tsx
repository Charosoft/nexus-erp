import { useEffect, useState } from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "./lib/supabase";

// Pages publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";
import Equipe from "./pages/Equipe";
import NotFound from "./pages/NotFound";
import Utilisateurs from "./pages/admin/Utilisateurs";

// Pages privées
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

function ProtectedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ===================================================== */}
      {/* SIDEBAR                                               */}
      {/* ===================================================== */}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((current) => !current)
        }
      />

      {/* ===================================================== */}
      {/* CONTENU PRINCIPAL                                     */}
      {/* ===================================================== */}

      <main
        className={[
          "min-h-screen transition-all duration-300",
          sidebarCollapsed
            ? "md:ml-20"
            : "md:ml-72",
        ].join(" ")}
      >
        {/* =================================================== */}
        {/* HEADER MOBILE                                       */}
        {/* =================================================== */}

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

        {/* =================================================== */}
        {/* PAGES PRIVÉES                                       */}
        {/* =================================================== */}

        <div className="p-4 sm:p-5 md:p-8">
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/clients"
              element={<Clients />}
            />

            <Route
              path="/stock"
              element={<Stock />}
            />

            <Route
              path="/ventes"
              element={<Ventes />}
            />

            <Route
              path="/fournisseurs"
              element={<Fournisseurs />}
            />

            <Route
              path="/comptabilite"
              element={<Comptabilite />}
            />

            <Route
              path="/tresorerie"
              element={<Tresorerie />}
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
                  to="/dashboard"
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

  {/* ======================================================= */}
  {/* CHARGEMENT                                              */}
  {/* ======================================================= */}

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
      {/* ===================================================== */}
      {/* PAGES PUBLIQUES                                      */}
      {/* ===================================================== */}

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
              to="/dashboard"
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* ===================================================== */}
      {/* ADMINISTRATION                                       */}
      {/* ===================================================== */}

      <Route
        path="/admin"
        element={
          session ? (
            <AdminEquipe />
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
            <Utilisateurs />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* ===================================================== */}
      {/* ESPACE CONNECTÉ                                      */}
      {/* ===================================================== */}

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

      {/* ===================================================== */}
      {/* 404                                                   */}
      {/* ===================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}