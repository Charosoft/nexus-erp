import {
  Activity,
  CalendarDays,
  Clock3,
  FileText,
  UserCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getActivites,
  type Activite,
} from "../services/activites.service";

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(date));
}

function getModuleStyle(module: string) {
  switch (module) {
    case "Ventes":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    case "Fournisseurs":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";

    case "Clients":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";

    case "Stock":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";

    case "Comptabilité":
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

    case "Trésorerie":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

export default function Activites() {
  const [activites, setActivites] =
    useState<Activite[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadActivites() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getActivites();

      setActivites(data);
    } catch (error) {
      console.error(
        "Erreur chargement activités :",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les activités."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivites();
  }, []);

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-400">
            <Activity size={18} />

            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Journal
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Mes activités
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Historique de vos opérations dans NEXUS.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <FileText
            size={17}
            className="text-blue-400"
          />

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Activités
            </p>

            <p className="text-sm font-semibold text-white">
              {activites.length}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          ERREUR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl shadow-black/10">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">

                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Activité
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Module
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Utilisateur
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">

              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">

                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

                      <p className="text-sm text-slate-500">
                        Chargement des activités...
                      </p>

                    </div>
                  </td>
                </tr>
              ) : activites.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <Activity
                      size={32}
                      className="mx-auto mb-3 text-slate-700"
                    />

                    <p className="text-sm font-medium text-slate-400">
                      Aucune activité
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Vos opérations apparaîtront ici.
                    </p>
                  </td>
                </tr>
              ) : (
                activites.map(
                  (activite) => (
                    <tr
                      key={activite.id}
                      className="transition hover:bg-white/[0.025]"
                    >

                      {/* Activité */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                            <Activity
                              size={17}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white">
                              {activite.action}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-600">
                              ID :{" "}
                              {activite.id.slice(
                                0,
                                8
                              )}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Module */}

                      <td className="px-5 py-4">

                        <span
                          className={[
                            "inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium",
                            getModuleStyle(
                              activite.module
                            ),
                          ].join(" ")}
                        >
                          {activite.module}
                        </span>

                      </td>

                      {/* Description */}

                      <td className="max-w-md px-5 py-4">

                        <p className="text-sm leading-6 text-slate-300">
                          {activite.description ||
                            "Aucune description."}
                        </p>

                      </td>

                      {/* Utilisateur */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                            <UserCircle
                              size={17}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-300">
                              {activite.user_name ||
                                "Utilisateur"}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Date */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-400">

                          <CalendarDays
                            size={15}
                            className="text-slate-600"
                          />

                          <span>
                            {formatDate(
                              activite.created_at
                            )}
                          </span>

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          INFO
      ================================================= */}

      {!loading &&
        activites.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock3 size={13} />

            <span>
              Les activités sont classées de la plus récente à la plus ancienne.
            </span>
          </div>
        )}

    </div>
  );
}