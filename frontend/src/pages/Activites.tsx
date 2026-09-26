import {
  useEffect,
  useState,
  type ComponentType,
} from "react";

import {
  Activity,
  RefreshCw,
  User,
  Package,
  ShoppingCart,
  Wallet,
  Calculator,
  Truck,
} from "lucide-react";

import {
  getActivites,
  type Activite,
} from "../services/activites.service";

const moduleIcons: Record<
  string,
  ComponentType<{ size?: number }>
> = {
  Stock: Package,
  "Stock & Inventaire": Package,
  Ventes: ShoppingCart,
  Trésorerie: Wallet,
  Comptabilité: Calculator,
  Fournisseurs: Truck,
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function Activites() {
  const [activites, setActivites] = useState<Activite[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function chargerActivites() {
    try {
      setLoading(true);
      setError("");

      const data = await getActivites();

      setActivites(data);
    } catch (err) {
      console.error(err);

      setError(
        "Impossible de charger les activités."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    chargerActivites();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Mes activités
          </h1>

          <p className="mt-2 text-slate-600">
            Historique des opérations enregistrées
            dans NEXUS.
          </p>
        </div>

        <button
          type="button"
          onClick={chargerActivites}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          Chargement des activités...
        </div>
      ) : activites.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Activity
              size={28}
              className="text-slate-600"
            />
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            Aucune activité
          </h2>

          <p className="mt-2 text-slate-500">
            Les opérations effectuées dans NEXUS
            apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {activites.map((activite) => {
              const Icon =
                moduleIcons[activite.module] ??
                Activity;

              return (
                <div
                  key={activite.id}
                  className="flex flex-col gap-4 p-6 md:flex-row md:items-center"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {activite.action}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {activite.module}
                      </span>
                    </div>

                    {activite.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {activite.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <User size={13} />

                        {activite.user_id
                          ? activite.user_id
                          : "Système"}
                      </span>

                      <span>•</span>

                      <span>
                        {formatDate(
                          activite.created_at
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}