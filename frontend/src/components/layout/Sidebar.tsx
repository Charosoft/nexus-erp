import {
  BarChart3,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShoppingCart,
  UserCircle,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
};

export default function Sidebar({
  collapsed = false,
  onToggle,
}: SidebarProps) {
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("est_admin");
      setIsAdmin(data === true);
    };

    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const links = [
    {
      label: "Tableau de bord",
      to: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Stock & Inventaire",
      to: "/stock",
      icon: Boxes,
    },
    {
      label: "Ventes",
      to: "/ventes",
      icon: ShoppingCart,
    },
    {
      label: "Fournisseurs",
      to: "/fournisseurs",
      icon: Building2,
    },
    {
      label: "Comptabilité",
      to: "/comptabilite",
      icon: Receipt,
    },
    {
      label: "Trésorerie",
      to: "/tresorerie",
      icon: Wallet,
    },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* BOUTON BURGER MOBILE                                     */}
      {/* ========================================================= */}

      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/95 text-slate-200 shadow-xl backdrop-blur-xl transition hover:bg-slate-800 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
      )}

      {/* ========================================================= */}
      {/* OVERLAY MOBILE                                           */}
      {/* ========================================================= */}

      {mobileOpen && (
        <button
          aria-label="Fermer le menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR                                                   */}
      {/* ========================================================= */}

      <aside
        className={[
          "fixed left-0 top-0 z-50 flex h-screen flex-col",
          "border-r border-slate-800/80 bg-slate-950/95",
          "backdrop-blur-xl transition-all duration-300",

          // Desktop
          collapsed ? "md:w-20" : "md:w-72",

          // Mobile
          "w-72",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* ======================================================= */}
        {/* LOGO                                                     */}
        {/* ======================================================= */}

        <div
          className={[
            "flex h-20 items-center border-b border-slate-800/80",
            collapsed
              ? "md:justify-center md:px-3"
              : "justify-between px-5",
          ].join(" ")}
        >
          <button
            onClick={() => {
              navigate("/dashboard");
              closeMobileMenu();
            }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <BarChart3 size={22} />
            </div>

            <div className="text-left">
              <div className="text-lg font-bold tracking-tight text-white">
                NEXUS
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-400">
                ERP System
              </div>
            </div>
          </button>

          {/* Fermer sur mobile */}
          <button
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>

          {/* Réduire sur desktop */}
          {!collapsed && onToggle && (
            <button
              onClick={onToggle}
              className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white md:block"
              title="Réduire"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* ======================================================= */}
        {/* NAVIGATION                                               */}
        {/* ======================================================= */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {/* GESTION */}

          <div
            className={[
              "mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600",
              collapsed ? "md:hidden" : "",
            ].join(" ")}
          >
            Gestion
          </div>

          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-xl px-3 py-3",
                    "text-sm font-medium transition",
                    isActive
                      ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white",
                    collapsed ? "md:justify-center" : "",
                  ].join(" ")
                }
                title={collapsed ? link.label : undefined}
              >
                <Icon size={19} />

                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}

          {/* ===================================================== */}
          {/* PERSONNEL                                               */}
          {/* ===================================================== */}

          <div
            className={[
              "my-5 border-t border-slate-800/70",
              collapsed ? "md:mx-2" : "",
            ].join(" ")}
          />

          <div
            className={[
              "mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600",
              collapsed ? "md:hidden" : "",
            ].join(" ")}
          >
            Personnel
          </div>

          <NavLink
            to="/profil"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-3",
                "text-sm font-medium transition",
                isActive
                  ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-white",
                collapsed ? "md:justify-center" : "",
              ].join(" ")
            }
            title={collapsed ? "Mon profil" : undefined}
          >
            <UserCircle size={19} />

            {!collapsed && <span>Mon profil</span>}
          </NavLink>

          <NavLink
            to="/activites"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-3",
                "text-sm font-medium transition",
                isActive
                  ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-white",
                collapsed ? "md:justify-center" : "",
              ].join(" ")
            }
            title={collapsed ? "Mes activités" : undefined}
          >
            <FileText size={19} />

            {!collapsed && <span>Mes activités</span>}
          </NavLink>

          {/* ===================================================== */}
          {/* ADMINISTRATION                                         */}
          {/* ===================================================== */}

          {isAdmin && (
            <>
              <div
                className={[
                  "my-5 border-t border-slate-800/70",
                  collapsed ? "md:mx-2" : "",
                ].join(" ")}
              />

              <div
                className={[
                  "mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600",
                  collapsed ? "md:hidden" : "",
                ].join(" ")}
              >
                Administration
              </div>

              <NavLink
                to="/admin"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-3",
                    "text-sm font-medium transition",
                    isActive
                      ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white",
                    collapsed ? "md:justify-center" : "",
                  ].join(" ")
                }
                title={collapsed ? "Administration" : undefined}
              >
                <Users size={19} />

                {!collapsed && <span>Administration</span>}
              </NavLink>

              <NavLink
                to="/admin/utilisateurs"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-3",
                    "text-sm font-medium transition",
                    isActive
                      ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white",
                    collapsed ? "md:justify-center" : "",
                  ].join(" ")
                }
                title={collapsed ? "Utilisateurs" : undefined}
              >
                <Settings size={19} />

                {!collapsed && <span>Utilisateurs</span>}
              </NavLink>
            </>
          )}
        </nav>

        {/* ======================================================= */}
        {/* DÉCONNEXION                                              */}
        {/* ======================================================= */}

        <div className="border-t border-slate-800/80 p-3">
          <button
            onClick={handleLogout}
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3 py-3",
              "text-sm font-medium text-slate-400 transition",
              "hover:bg-red-500/10 hover:text-red-400",
              collapsed ? "md:justify-center" : "",
            ].join(" ")}
            title={collapsed ? "Déconnexion" : undefined}
          >
            <LogOut size={19} />

            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>

        {/* ======================================================= */}
        {/* BOUTON OUVRIR DESKTOP                                    */}
        {/* ======================================================= */}

        {collapsed && onToggle && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-24 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg transition hover:text-white md:flex"
            title="Ouvrir"
          >
            <ChevronRight size={15} />
          </button>
        )}
      </aside>
    </>
  );
}