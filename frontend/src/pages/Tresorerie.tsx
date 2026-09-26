import { useEffect, useState } from "react";
import {
  Wallet,
  Landmark,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { api } from "../services/api";

interface TreasuryAccount {
  id: string;
  name: string;
  type: "CAISSE" | "BANQUE";
  account_number?: string;
  currency: string;
  balance: number;
  is_active: boolean;
}

interface TreasuryMovement {
  id: string;
  type: "ENTREE" | "SORTIE";
  amount: number;
  reference: string;
  description?: string;
  payment_method: string;
  source_type: string;
  created_at: string;
  comptes_tresorerie?: {
    id: string;
    name: string;
    type: "CAISSE" | "BANQUE";
    currency: string;
  };
}

export default function Tresorerie() {
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [movements, setMovements] = useState<TreasuryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const [accountsResponse, movementsResponse] = await Promise.all([
        api.get<{ data: TreasuryAccount[] }>("/tresorerie/accounts"),
        api.get<{ data: TreasuryMovement[] }>("/tresorerie/movements"),
      ]);

      setAccounts(accountsResponse.data);
      setMovements(movementsResponse.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger la trésorerie"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const bankAccounts = accounts.filter(
    (account) => account.type === "BANQUE"
  );

  const cashAccounts = accounts.filter(
    (account) => account.type === "CAISSE"
  );

  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  const totalBank = bankAccounts.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  const totalCash = cashAccounts.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  const totalIncoming = movements
    .filter((movement) => movement.type === "ENTREE")
    .reduce((sum, movement) => sum + Number(movement.amount || 0), 0);

  const totalOutgoing = movements
    .filter((movement) => movement.type === "SORTIE")
    .reduce((sum, movement) => sum + Number(movement.amount || 0), 0);

  const netMovement = totalIncoming - totalOutgoing;

  const formatMoney = (value: number, currency = "USD") =>
    `${value.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;

  if (loading) {
    return (
      <div className="min-h-full bg-slate-950 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-10 w-72 rounded-xl bg-slate-800" />

          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl border border-slate-800 bg-slate-900"
              />
            ))}
          </div>

          <div className="mb-8 h-64 rounded-2xl border border-slate-800 bg-slate-900" />

          <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 p-6 text-slate-100 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-950/20">
              <Wallet size={24} />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Trésorerie
                </h1>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                  Connectée
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Suivi des comptes, encaissements et décaissements
              </p>
            </div>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Actualiser
          </button>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <Activity size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Erreur de chargement</p>
              <p className="mt-1 text-red-300/80">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* KPI */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Solde total
                </p>

                <p className="mt-3 text-2xl font-bold tracking-tight text-white">
                  {formatMoney(totalBalance)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Tous les comptes actifs
                </p>
              </div>

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <Wallet size={20} />
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Banque
                </p>

                <p className="mt-3 text-2xl font-bold tracking-tight text-white">
                  {formatMoney(totalBank)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {bankAccounts.length} compte
                  {bankAccounts.length > 1 ? "s" : ""} bancaire
                  {bankAccounts.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <Landmark size={20} />
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Caisse
                </p>

                <p className="mt-3 text-2xl font-bold tracking-tight text-white">
                  {formatMoney(totalCash)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {cashAccounts.length} caisse
                  {cashAccounts.length > 1 ? "s" : ""} disponible
                  {cashAccounts.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <Banknote size={20} />
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Solde des mouvements
                </p>

                <p
                  className={`mt-3 text-2xl font-bold tracking-tight ${
                    netMovement >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {netMovement >= 0 ? "+" : ""}
                  {formatMoney(netMovement)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Entrées − sorties
                </p>
              </div>

              <div
                className={`rounded-xl p-3 ${
                  netMovement >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {netMovement >= 0 ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* VUE FINANCIÈRE */}
        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                <ArrowDownLeft size={19} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total des entrées
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-400">
                  +{formatMoney(totalIncoming)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-500/10 p-2.5 text-red-400">
                <ArrowUpRight size={19} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total des sorties
                </p>
                <p className="mt-1 text-xl font-bold text-red-400">
                  -{formatMoney(totalOutgoing)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  Mouvements enregistrés
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {movements.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPTES */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-2 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Comptes de trésorerie
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Vue consolidée des disponibilités financières
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
              {accounts.length} compte
              {accounts.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="card-hover rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-xl p-3 ${
                        account.type === "BANQUE"
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {account.type === "BANQUE" ? (
                        <Landmark size={21} />
                      ) : (
                        <Banknote size={21} />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {account.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {account.type === "BANQUE"
                          ? "Compte bancaire"
                          : "Caisse physique"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      account.is_active
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 bg-slate-800 text-slate-500"
                    }`}
                  >
                    {account.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Solde disponible
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                      {formatMoney(
                        Number(account.balance || 0),
                        account.currency
                      )}
                    </p>
                  </div>

                  <span className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-400">
                    {account.currency}
                  </span>
                </div>

                {account.account_number && (
                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <p className="text-xs text-slate-500">
                      N° compte
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {account.account_number}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {accounts.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-700 py-12 text-center">
                <Wallet
                  size={30}
                  className="mx-auto mb-3 text-slate-600"
                />
                <p className="text-sm font-medium text-slate-400">
                  Aucun compte de trésorerie
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Aucun compte n'est actuellement disponible.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* MOUVEMENTS */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-2 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Historique des mouvements
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Toutes les opérations financières enregistrées
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
              {movements.length} mouvement
              {movements.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="bg-slate-950/70 text-left">
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Compte
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Référence
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Source
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Paiement
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Montant
                  </th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => {
                  const isEntry = movement.type === "ENTREE";

                  return (
                    <tr
                      key={movement.id}
                      className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(
                          movement.created_at
                        ).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            isEntry
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border-red-500/20 bg-red-500/10 text-red-400"
                          }`}
                        >
                          {isEntry ? (
                            <ArrowDownLeft size={13} />
                          ) : (
                            <ArrowUpRight size={13} />
                          )}

                          {isEntry ? "ENTRÉE" : "SORTIE"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-200">
                            {movement.comptes_tresorerie?.name ?? "—"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-600">
                            {movement.comptes_tresorerie?.type ?? ""}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-300">
                        {movement.reference || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                          {movement.source_type || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {movement.payment_method || "—"}
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-bold ${
                          isEntry
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {isEntry ? "+" : "-"}
                        {formatMoney(Number(movement.amount || 0))}
                      </td>
                    </tr>
                  );
                })}

                {movements.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-14 text-center"
                    >
                      <Activity
                        size={32}
                        className="mx-auto mb-3 text-slate-700"
                      />

                      <p className="text-sm font-medium text-slate-400">
                        Aucun mouvement de trésorerie
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Les entrées et sorties apparaîtront ici.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>

              {movements.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-950/80">
                    <td
                      colSpan={6}
                      className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Solde des mouvements
                    </td>

                    <td
                      className={`px-5 py-4 text-right font-bold ${
                        netMovement >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {netMovement >= 0 ? "+" : ""}
                      {formatMoney(netMovement)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {/* FOOTER INFO */}
        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-400" />
            <span>
              Données synchronisées avec le système financier NEXUS
            </span>
          </div>

          <span>
            {accounts.filter((account) => account.is_active).length} compte
            {accounts.filter((account) => account.is_active).length > 1
              ? "s"
              : ""}{" "}
            actif
            {accounts.filter((account) => account.is_active).length > 1
              ? "s"
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}