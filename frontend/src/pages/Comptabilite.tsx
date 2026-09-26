import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Calculator,
  CircleDollarSign,
  FileText,
  RefreshCw,
  Scale,
} from "lucide-react";

import { api } from "../services/api";

interface AccountingAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  description?: string;
  is_active: boolean;
}

interface AccountingLine {
  id: string;
  description?: string;
  debit: number;
  credit: number;
  comptes_comptables?: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
}

interface AccountingEntry {
  id: string;
  reference: string;
  date_ecriture: string;
  description?: string;
  source_type: string;
  journaux?: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  lignes_ecriture?: AccountingLine[];
}

export default function Comptabilite() {
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [accountsResponse, entriesResponse] = await Promise.all([
        api.get<{ data: AccountingAccount[] }>(
          "/comptabilite/accounts"
        ),
        api.get<{ data: AccountingEntry[] }>(
          "/comptabilite/entries"
        ),
      ]);

      setAccounts(accountsResponse.data);
      setEntries(entriesResponse.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger la comptabilité"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalDebit = entries.reduce(
    (sum, entry) =>
      sum +
      (entry.lignes_ecriture ?? []).reduce(
        (lineSum, line) =>
          lineSum + Number(line.debit || 0),
        0
      ),
    0
  );

  const totalCredit = entries.reduce(
    (sum, entry) =>
      sum +
      (entry.lignes_ecriture ?? []).reduce(
        (lineSum, line) =>
          lineSum + Number(line.credit || 0),
        0
      ),
    0
  );

  const balance = totalDebit - totalCredit;

  const journalLines = useMemo(
    () =>
      entries.flatMap((entry) =>
        (entry.lignes_ecriture ?? []).map((line) => ({
          entry,
          line,
        }))
      ),
    [entries]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-lg bg-slate-800" />
          <div className="h-4 w-96 rounded bg-slate-800" />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-2xl bg-slate-900" />
            <div className="h-28 rounded-2xl bg-slate-900" />
            <div className="h-28 rounded-2xl bg-slate-900" />
          </div>

          <div className="h-72 rounded-2xl bg-slate-900" />
          <div className="h-96 rounded-2xl bg-slate-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <section className="animate-[fadeUp_0.45s_ease-out]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-400">
                <Calculator size={17} />
                <span>Finance & comptabilité</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Comptabilité
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Consultez le plan comptable SYSCOHADA et les écritures
                générées automatiquement par les opérations NEXUS.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500/40 hover:bg-slate-800"
            >
              <RefreshCw size={17} />
              Actualiser
            </button>
          </div>
        </section>

        {/* ERROR */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 animate-[fadeUp_0.3s_ease-out]">
            <FileText
              size={20}
              className="mt-0.5 shrink-0"
            />

            <span>{errorMessage}</span>
          </div>
        )}

        {/* KPI */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* DEBIT */}
          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total débits
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {totalDebit.toLocaleString()} USD
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Mouvements débités
                </p>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400">
                <ArrowDownLeft size={22} />
              </div>
            </div>
          </div>

          {/* CREDIT */}
          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total crédits
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {totalCredit.toLocaleString()} USD
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Mouvements crédités
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
                <ArrowUpRight size={22} />
              </div>
            </div>
          </div>

          {/* ECRITURES */}
          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Écritures
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {entries.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Opérations comptables
                </p>
              </div>

              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-400">
                <BookOpen size={22} />
              </div>
            </div>
          </div>
        </section>

        {/* EQUILIBRE */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400">
                <Scale size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Équilibre comptable
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Contrôle des débits et crédits
                </h2>
              </div>
            </div>

            <div
              className={`rounded-xl border px-4 py-3 ${
                Math.abs(balance) < 0.01
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : "border-amber-500/20 bg-amber-500/10"
              }`}
            >
              <p className="text-xs text-slate-500">
                Écart
              </p>

              <p
                className={`mt-1 text-lg font-bold ${
                  Math.abs(balance) < 0.01
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {balance.toLocaleString()} USD
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Débits
                </span>

                <ArrowDownLeft
                  size={17}
                  className="text-blue-400"
                />
              </div>

              <p className="mt-2 text-xl font-bold text-white">
                {totalDebit.toLocaleString()} USD
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Crédits
                </span>

                <ArrowUpRight
                  size={17}
                  className="text-emerald-400"
                />
              </div>

              <p className="mt-2 text-xl font-bold text-white">
                {totalCredit.toLocaleString()} USD
              </p>
            </div>
          </div>
        </section>

        {/* PLAN COMPTABLE */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400">
                <BookOpen size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Plan comptable
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Référentiel SYSCOHADA utilisé par NEXUS
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400">
              {accounts.length} comptes
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    Compte
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Intitulé
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Type
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    État
                  </th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-t border-slate-800 transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 font-mono text-xs font-bold text-blue-400">
                        {account.code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200">
                        {account.name}
                      </p>

                      {account.description && (
                        <p className="mt-1 text-xs text-slate-500">
                          {account.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {account.type}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          account.is_active
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-slate-700 bg-slate-800 text-slate-500"
                        }`}
                      >
                        {account.is_active
                          ? "Actif"
                          : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}

                {accounts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Aucun compte comptable disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* JOURNAL */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
                <CircleDollarSign size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Journal des écritures
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Écritures issues des opérations intégrées
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              {journalLines.length} lignes
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    Date
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Référence
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Journal
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Source
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Compte
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    Débit
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    Crédit
                  </th>
                </tr>
              </thead>

              <tbody>
                {journalLines.map(({ entry, line }) => (
                  <tr
                    key={line.id}
                    className="border-t border-slate-800 transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(
                        entry.date_ecriture
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-blue-400">
                        {entry.reference}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                        {entry.journaux?.code ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-400">
                        {entry.source_type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-slate-200">
                          {line.comptes_comptables?.code}
                        </span>

                        <p className="mt-1 text-xs text-slate-500">
                          {line.comptes_comptables?.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right font-medium text-blue-400">
                      {Number(
                        line.debit || 0
                      ).toLocaleString()}{" "}
                      USD
                    </td>

                    <td className="px-6 py-4 text-right font-medium text-emerald-400">
                      {Number(
                        line.credit || 0
                      ).toLocaleString()}{" "}
                      USD
                    </td>
                  </tr>
                ))}

                {journalLines.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Aucune écriture comptable enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>

              {journalLines.length > 0 && (
                <tfoot>
                  <tr className="border-t border-slate-700 bg-slate-950/70">
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Totaux
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-blue-400">
                      {totalDebit.toLocaleString()} USD
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      {totalCredit.toLocaleString()} USD
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}