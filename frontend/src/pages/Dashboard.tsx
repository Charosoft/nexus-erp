import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Package,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { api } from "../services/api";
import type {
  Product,
  TreasuryAccount,
  TreasuryMovement,
} from "../types/dashboard";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [movements, setMovements] = useState<TreasuryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsResponse, accountsResponse, movementsResponse] =
          await Promise.all([
            api.get<{ data: Product[] }>("/stock/products"),
            api.get<{ data: TreasuryAccount[] }>("/tresorerie/accounts"),
            api.get<{ data: TreasuryMovement[] }>("/tresorerie/movements"),
          ]);

        setProducts(productsResponse.data);
        setAccounts(accountsResponse.data);
        setMovements(movementsResponse.data);
      } catch (error) {
        console.error("Erreur dashboard :", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalStock = products.reduce(
    (total, product) => total + product.stocks.quantity,
    0
  );

  const totalTreasury = accounts.reduce(
    (total, account) => total + Number(account.balance),
    0
  );

  const totalEntries = movements
    .filter((movement) => movement.type === "ENTREE")
    .reduce((total, movement) => total + Number(movement.amount), 0);

  const totalExits = movements
    .filter((movement) => movement.type === "SORTIE")
    .reduce((total, movement) => total + Number(movement.amount), 0);

  const stockAlerts = products.filter(
    (product) => product.stocks.quantity <= product.alert_threshold
  ).length;

  const recentMovements = useMemo(
    () => movements.slice(0, 5),
    [movements]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-slate-800" />
          <div className="h-4 w-72 rounded bg-slate-800" />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-2xl border border-slate-800 bg-slate-900"
              />
            ))}
          </div>

          <div className="h-80 rounded-2xl border border-slate-800 bg-slate-900" />
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Produits en stock",
      value: totalStock.toLocaleString(),
      description: `${products.length} produits référencés`,
      icon: Package,
      iconClass: "bg-blue-500/10 text-blue-400",
      valueClass: "text-white",
    },
    {
      title: "Trésorerie",
      value: `${totalTreasury.toLocaleString()} USD`,
      description: "Solde disponible",
      icon: Wallet,
      iconClass: "bg-emerald-500/10 text-emerald-400",
      valueClass: "text-white",
    },
    {
      title: "Encaissements",
      value: `${totalEntries.toLocaleString()} USD`,
      description: "Mouvements entrants",
      icon: TrendingUp,
      iconClass: "bg-violet-500/10 text-violet-400",
      valueClass: "text-white",
    },
    {
      title: "Alertes stock",
      value: stockAlerts.toLocaleString(),
      description:
        stockAlerts > 0
          ? "Produits sous le seuil"
          : "Aucune alerte active",
      icon: AlertTriangle,
      iconClass:
        stockAlerts > 0
          ? "bg-red-500/10 text-red-400"
          : "bg-emerald-500/10 text-emerald-400",
      valueClass:
        stockAlerts > 0 ? "text-red-400" : "text-emerald-400",
    },
  ];

  return (
    <div className="page-transition min-h-screen bg-slate-950 p-5 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Système opérationnel
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Vue globale de votre activité sur NEXUS ERP.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <CircleDollarSign
            size={18}
            className="text-blue-400"
          />

          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Trésorerie disponible
            </p>

            <p className="text-sm font-semibold text-white">
              {totalTreasury.toLocaleString()} USD
            </p>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="card-hover group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10"
              style={{
                animation: `fadeUp 0.45s ease-out ${index * 0.07}s both`,
              }}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition group-hover:bg-blue-500/10" />

              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  <Icon size={21} />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  NEXUS
                </span>
              </div>

              <div className="relative mt-6">
                <p className="text-sm text-slate-400">
                  {card.title}
                </p>

                <p
                  className={`mt-1 text-2xl font-bold tracking-tight ${card.valueClass}`}
                >
                  {card.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overview */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {/* Financial overview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Vue financière
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Flux de trésorerie
              </h2>
            </div>

            <div className="flex gap-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <ArrowUpRight
                    size={16}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <p className="text-[11px] text-slate-500">
                    Entrées
                  </p>
                  <p className="text-sm font-semibold text-emerald-400">
                    {totalEntries.toLocaleString()} USD
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                  <ArrowDownRight
                    size={16}
                    className="text-red-400"
                  />
                </div>

                <div>
                  <p className="text-[11px] text-slate-500">
                    Sorties
                  </p>
                  <p className="text-sm font-semibold text-red-400">
                    {totalExits.toLocaleString()} USD
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Solde actuel
                </span>

                <Wallet
                  size={17}
                  className="text-blue-400"
                />
              </div>

              <p className="mt-4 text-3xl font-bold text-white">
                {totalTreasury.toLocaleString()}{" "}
                <span className="text-sm font-medium text-slate-500">
                  USD
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Mouvements
                </span>

                <TrendingUp
                  size={17}
                  className="text-violet-400"
                />
              </div>

              <p className="mt-4 text-3xl font-bold text-white">
                {movements.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                opérations enregistrées
              </p>
            </div>
          </div>
        </div>

        {/* Stock summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Inventaire
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                État du stock
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Boxes size={19} />
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">
                  {totalStock}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  unités disponibles
                </p>
              </div>

              <span className="text-xs font-medium text-slate-500">
                {products.length} références
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      8,
                      products.length
                        ? (totalStock / (products.length * 20)) * 100
                        : 8
                    )
                  )}%`,
                }}
              />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-xs text-slate-500">
                Alertes
              </span>

              <span
                className={`text-sm font-semibold ${
                  stockAlerts > 0
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {stockAlerts} active
                {stockAlerts > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products + movements */}
      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        {/* Products */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Catalogue
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Produits
              </h2>
            </div>

            <Package
              size={19}
              className="text-slate-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    Référence
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Produit
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Prix
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    Stock
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const isAlert =
                    product.stocks.quantity <=
                    product.alert_threshold;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-800/70 transition hover:bg-slate-800/30 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-800 px-2 py-1 font-mono text-xs text-slate-400">
                          {product.reference}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-200">
                        {product.name}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {Number(
                          product.unit_price
                        ).toLocaleString()}{" "}
                        USD
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isAlert
                              ? "bg-red-500/10 text-red-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {isAlert && (
                            <AlertTriangle size={12} />
                          )}

                          {product.stocks.quantity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent movements */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Activité financière
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Mouvements récents
              </h2>
            </div>

            <Receipt
              size={19}
              className="text-slate-500"
            />
          </div>

          <div className="divide-y divide-slate-800">
            {recentMovements.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Receipt
                  size={28}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Aucun mouvement récent.
                </p>
              </div>
            ) : (
              recentMovements.map((movement) => {
                const isEntry = movement.type === "ENTREE";

                return (
                  <div
                    key={movement.id}
                    className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-800/30"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isEntry
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {isEntry ? (
                        <ArrowUpRight size={17} />
                      ) : (
                        <ArrowDownRight size={17} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {isEntry
                          ? "Entrée de trésorerie"
                          : "Sortie de trésorerie"
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(
                          movement.created_at
                        ).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <p
                      className={`whitespace-nowrap text-sm font-semibold ${
                        isEntry
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {isEntry ? "+" : "-"}
                      {Number(
                        movement.amount
                      ).toLocaleString()}{" "}
                      USD
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}