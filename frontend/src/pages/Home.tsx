import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Layers3,
  LockKeyhole,
  LogIn,
  LogOut,
  Network,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const modules = [
  {
    title: "Stock & Inventaire",
    description: "Suivez les produits, mouvements et niveaux de stock.",
    icon: Boxes,
  },
  {
    title: "Ventes",
    description: "Gérez les ventes et automatisez leur traitement.",
    icon: ShoppingCart,
  },
  {
    title: "Fournisseurs",
    description: "Centralisez fournisseurs, achats et approvisionnements.",
    icon: Building2,
  },
  {
    title: "Comptabilité",
    description: "Suivez les écritures et les opérations comptables.",
    icon: Receipt,
  },
  {
    title: "Trésorerie",
    description: "Contrôlez les entrées, sorties et soldes financiers.",
    icon: Wallet,
  },
];

const stats = [
  { value: "05", label: "Modules intégrés" },
  { value: "01", label: "Base de données" },
  { value: "100%", label: "Processus centralisés" },
];

export default function Home() {
  const navigate = useNavigate();

  const [session, setSession] = useState<Awaited<
    ReturnType<typeof supabase.auth.getSession>
  >["data"]["session"]>(null);

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    await supabase.auth.signOut();

    setSession(null);
    setLoggingOut(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute right-[-10rem] top-[30%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-[-15rem] left-[-10rem] h-[30rem] w-[30rem] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 transition duration-300 group-hover:scale-105 group-hover:shadow-blue-600/40">
              <Network size={21} />
            </div>

            <div className="text-left">
              <div className="text-lg font-bold tracking-tight">
                NEXUS
              </div>

              <div className="text-[9px] uppercase tracking-[0.25em] text-blue-400">
                Integrated ERP
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a
              href="#modules"
              className="transition hover:text-white"
            >
              Modules
            </a>

            <a
              href="#integration"
              className="transition hover:text-white"
            >
              Intégration
            </a>

            <a
              href="#equipe"
              className="transition hover:text-white"
            >
              Équipe
            </a>
          </nav>

          {/* Session */}
          {session ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="hidden items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:border-blue-500/40 hover:bg-blue-500/15 sm:flex"
              >
                <UserRound size={16} />
                Tableau de bord
              </button>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Se déconnecter"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">
                  {loggingOut ? "..." : "Déconnexion"}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold transition duration-300 hover:border-blue-500/50 hover:bg-blue-500/10"
            >
              <LogIn size={16} />
              Connexion
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div className="animate-[fadeUp_.7s_ease-out]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-xs font-medium text-blue-300">
              <Sparkles size={14} />
              Mini-ERP intégré
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Gérez votre entreprise
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                depuis un seul espace.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              NEXUS centralise les ventes, le stock, les fournisseurs,
              la comptabilité et la trésorerie dans une plateforme
              unique et cohérente.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {session ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/30"
                >
                  Accéder au tableau de bord
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/30"
                >
                  Accéder à NEXUS
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              )}

              <a
                href="#modules"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-3.5 font-semibold text-slate-300 transition duration-300 hover:border-slate-600 hover:bg-slate-800"
              >
                Découvrir les modules
                <ChevronRight size={17} />
              </a>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 border-t border-slate-800 pt-7">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-[2rem] bg-blue-500/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    Vue globale
                  </div>

                  <div className="text-xs text-slate-500">
                    Activité du système
                  </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <BarChart3 size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Chiffre d'affaires", "$24,850", "↗ 12.8%"],
                  ["Trésorerie", "$8,420", "↗ 6.4%"],
                  ["Produits", "1,284", "Stock actif"],
                  ["Commandes", "186", "Ce mois"],
                ].map(([title, value, meta]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30"
                  >
                    <div className="text-xs text-slate-500">
                      {title}
                    </div>

                    <div className="mt-2 text-xl font-bold">
                      {value}
                    </div>

                    <div className="mt-1 text-[11px] text-emerald-400">
                      {meta}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      Performance
                    </div>

                    <div className="text-xs text-slate-500">
                      Activité commerciale
                    </div>
                  </div>

                  <CircleDollarSign
                    size={19}
                    className="text-blue-400"
                  />
                </div>

                <div className="flex h-32 items-end gap-2">
                  {[38, 55, 42, 70, 58, 82, 67, 94, 76, 88, 72, 100].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="group relative flex-1"
                      >
                        <div
                          className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-blue-700 to-blue-400 opacity-70 transition duration-300 group-hover:opacity-100"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section
        id="modules"
        className="relative z-10 border-t border-slate-800/60 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Une architecture modulaire
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce dont votre gestion a besoin.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Cinq modules spécialisés, conçus pour fonctionner ensemble
              au sein d'un même système.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <div
                  key={module.title}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:bg-slate-900"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition duration-300 group-hover:scale-110 group-hover:bg-blue-500/15">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 font-semibold">
                    {module.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {module.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1 text-xs font-medium text-slate-500 transition group-hover:text-blue-400">
                    Explorer
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section
        id="integration"
        className="relative z-10 overflow-hidden border-y border-slate-800/60 bg-slate-900/30 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Intégration
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Une opération ne s'arrête jamais à un seul module.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-400">
                NEXUS fait circuler l'information entre les différents
                domaines afin de conserver une vision cohérente de
                l'activité.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Données centralisées",
                  "Processus interconnectés",
                  "Suivi financier cohérent",
                  "Gestion sécurisée des accès",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-emerald-400"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                <div className="mb-7 flex items-center gap-3">
                  <Layers3 className="text-blue-400" size={20} />
                  <span className="font-semibold">
                    Flux intégré
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { number: "01", title: "Vente", icon: ShoppingCart },
                    { number: "02", title: "Stock", icon: Boxes },
                    { number: "03", title: "Trésorerie", icon: Wallet },
                    { number: "04", title: "Comptabilité", icon: Receipt },
                  ].map(({ number, title, icon: Icon }) => (
                    <div
                      key={title}
                      className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-blue-500/30"
                    >
                      <span className="text-xs font-mono text-slate-600">
                        {number}
                      </span>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                        <Icon size={17} />
                      </div>

                      <span className="font-medium">
                        {title}
                      </span>

                      {number !== "04" && (
                        <ArrowRight
                          size={15}
                          className="ml-auto text-slate-600"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Accès contrôlé",
                text: "Gestion des utilisateurs et rôles administrateurs.",
              },
              {
                icon: LockKeyhole,
                title: "Données protégées",
                text: "Architecture sécurisée avec contrôle des accès.",
              },
              {
                icon: Network,
                title: "Architecture centralisée",
                text: "Une même plateforme pour tous les processus.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
                >
                  <Icon size={22} className="text-blue-400" />

                  <h3 className="mt-5 font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section
        id="equipe"
        className="relative z-10 border-t border-slate-800/60 py-24"
      >
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Équipe projet
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Une équipe. Un système. Un projet.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            NEXUS est conçu comme une plateforme collaborative où
            chaque domaine contribue à un système de gestion unifié.
          </p>

          <button
            onClick={() => navigate("/equipe")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold transition hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            Découvrir l'équipe
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 via-slate-900 to-slate-950 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <BarChart3 size={23} />
          </div>

          <h2 className="mt-6 text-3xl font-bold">
            {session
              ? "Votre espace NEXUS vous attend."
              : "Prêt à entrer dans NEXUS ?"}
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            {session
              ? "Retrouvez toutes vos opérations dans votre tableau de bord."
              : "Accédez à votre espace de gestion et retrouvez toutes vos opérations au même endroit."}
          </p>

          <button
            onClick={() =>
              navigate(session ? "/dashboard" : "/login")
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            {session ? "Ouvrir le tableau de bord" : "Se connecter"}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <span className="font-semibold text-slate-300">
              NEXUS
            </span>{" "}
            — Mini-ERP intégré
          </div>

          <div>Projet académique • Charosoft</div>
        </div>
      </footer>
    </main>
  );
}