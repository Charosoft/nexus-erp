import React from "react";

import {
  Activity,
  BarChart3,
  Building2,
  Calculator,
  CircleDollarSign,
  Home,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Truck,
  UserCircle,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { getMyModules } from "../../services/permissions.service";
import { MODULES } from "../../types/permissions";
import type { ModuleKey } from "../../types/permissions";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const moduleIcons: Record<
  ModuleKey,
  React.ComponentType<{ size?: number }>
> = {
  dashboard: BarChart3,
  clients: UserCircle,
  stock: Package,
  ventes: ShoppingCart,
  fournisseurs: Truck,
  comptabilite: Calculator,
  tresorerie: CircleDollarSign,
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

export default function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const navigate = useNavigate();

  const [allowedModules, setAllowedModules] =
    React.useState<ModuleKey[]>([]);

  const [isAdmin, setIsAdmin] =
    React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
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
            setIsAdmin(true);
            setAllowedModules(
              MODULES.map(
                (module) => module.key
              )
            );
          }

          return;
        }

        const modules =
          await getMyModules();

        if (mounted) {
          setAllowedModules(modules);
        }
      } catch (error) {
        console.error(
          "Erreur chargement permissions Sidebar :",
          error
        );
      }
    }

    loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const visibleModules = MODULES.filter(
    (module) =>
      isAdmin ||
      allowedModules.includes(module.key)
  );

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-300 shadow-lg md:hidden"
      >
        {collapsed ? (
          <Menu size={20} />
        ) : (
          <X size={20} />
        )}
      </button>

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-slate-950 transition-all duration-300",
          collapsed
            ? "w-20"
            : "w-72",
          "max-md:w-72",
          collapsed
            ? "max-md:-translate-x-full"
            : "max-md:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
            <Building2 size={21} />
          </div>

          {!collapsed && (
            <div>
              <p className="font-bold tracking-wide text-white">
                NEXUS
              </p>

              <p className="text-xs text-slate-500">
                ERP Management
              </p>
            </div>
          )}

          <button
            onClick={onToggle}
            className="ml-auto hidden rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white md:block"
          >
            {collapsed ? (
              <Menu size={18} />
            ) : (
              <X size={18} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Mon espace
            </p>
          )}

          <NavLink
            to="/espace"
            title="Mon espace"
            className={({ isActive }) =>
              [
                "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isActive
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                collapsed
                  ? "justify-center"
                  : "",
              ].join(" ")
            }
          >
            <Home size={18} />

            {!collapsed && (
              <span>Mon espace</span>
            )}
          </NavLink>

          {!collapsed && (
            <div className="my-5 border-t border-white/10" />
          )}

          {!collapsed && (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Modules
            </p>
          )}

          <div className="space-y-1">
            {visibleModules.map((module) => {
              const Icon =
                moduleIcons[module.key];

              return (
                <NavLink
                  key={module.key}
                  to={moduleRoutes[module.key]}
                  title={module.label}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      isActive
                        ? "bg-blue-600/15 text-blue-400"
                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                      collapsed
                        ? "justify-center"
                        : "",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />

                  {!collapsed && (
                    <span>{module.label}</span>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="my-5 border-t border-white/10" />

          {!collapsed && (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Personnel
            </p>
          )}

          <div className="space-y-1">
            <NavLink
              to="/profil"
              title="Mon profil"
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-blue-600/15 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                  collapsed
                    ? "justify-center"
                    : "",
                ].join(" ")
              }
            >
              <UserCircle size={18} />

              {!collapsed && (
                <span>Mon profil</span>
              )}
            </NavLink>

            <NavLink
              to="/activites"
              title="Mes activités"
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-blue-600/15 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                  collapsed
                    ? "justify-center"
                    : "",
                ].join(" ")
              }
            >
              <Activity size={18} />

              {!collapsed && (
                <span>Mes activités</span>
              )}
            </NavLink>
          </div>
        </nav>

        {/* Déconnexion */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400",
              collapsed
                ? "justify-center"
                : "",
            ].join(" ")}
          >
            <LogOut size={18} />

            {!collapsed && (
              <span>Déconnexion</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}