import {
  BarChart3,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,

  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShoppingCart,
  UserCircle,
  Users,
  Wallet,
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
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex h-20 items-center border-b border-slate-800/80 ${
          collapsed ? "justify-center px-3" : "justify-between px-5"
        }`}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <BarChart3 size={22} />
          </div>

          {!collapsed && (
            <div className="text-left">
              <div className="text-lg font-bold tracking-tight text-white">
                NEXUS
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-400">
                ERP System
              </div>
            </div>
          )}
        </button>

        {!collapsed && onToggle && (
          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
            title="Réduire"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <div
          className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 ${
            collapsed ? "hidden" : ""
          }`}
        >
          Gestion
        </div>

        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? link.label : undefined}
            >
              <Icon size={19} />

              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}

        <div
          className={`my-5 border-t border-slate-800/70 ${
            collapsed ? "mx-2" : ""
          }`}
        />

        <div
          className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 ${
            collapsed ? "hidden" : ""
          }`}
        >
          Personnel
        </div>

        <NavLink
          to="/profil"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
            } ${collapsed ? "justify-center" : ""}`
          }
          title={collapsed ? "Mon profil" : undefined}
        >
          <UserCircle size={19} />
          {!collapsed && <span>Mon profil</span>}
        </NavLink>

        <NavLink
          to="/activites"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
            } ${collapsed ? "justify-center" : ""}`
          }
          title={collapsed ? "Mes activités" : undefined}
        >
          <FileText size={19} />
          {!collapsed && <span>Mes activités</span>}
        </NavLink>

        {isAdmin && (
          <>
            <div
              className={`my-5 border-t border-slate-800/70 ${
                collapsed ? "mx-2" : ""
              }`}
            />

            <div
              className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 ${
                collapsed ? "hidden" : ""
              }`}
            >
              Administration
            </div>

            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? "Administration" : undefined}
            >
              <Users size={19} />
              {!collapsed && <span>Administration</span>}
            </NavLink>

            <NavLink
              to="/admin/utilisateurs"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? "Utilisateurs" : undefined}
            >
              <Settings size={19} />
              {!collapsed && <span>Utilisateurs</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* Déconnexion */}
      <div className="border-t border-slate-800/80 p-3">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut size={19} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Bouton ouvrir quand réduit */}
      {collapsed && onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-24 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg transition hover:text-white"
          title="Ouvrir"
        >
          <ChevronRight size={15} />
        </button>
      )}
    </aside>
  );
}