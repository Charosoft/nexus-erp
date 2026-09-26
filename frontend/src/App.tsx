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
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-h-screen md:ml-64">
        <div className="p-6 md:p-8">
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard />}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
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
      {/* =========================
          PAGES PUBLIQUES
      ========================== */}

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

      {/* =========================
          ADMINISTRATION
          Aucun lien public
      ========================== */}

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
        element={<Utilisateurs />} 
      />

      {/* =========================
          ESPACE CONNECTÉ
      ========================== */}

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

      {/* =========================
          404
      ========================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}