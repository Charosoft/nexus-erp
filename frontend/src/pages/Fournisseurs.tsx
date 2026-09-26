import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Package,
  PackagePlus,
  RefreshCw,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  getFournisseurs,
  getAchats,
  createPurchase,
} from "../services/fournisseurs.service";

import type {
  Fournisseur,
  Achat,
  PurchaseForm,
} from "../types/fournisseurs";

import type { Product } from "../types/dashboard";

import {
  getProducts,
  getTreasuryAccounts,
} from "../services/ventes.service";

import type { TreasuryAccount } from "../types/ventes";

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [achats, setAchats] = useState<Achat[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [treasuryAccountId, setTreasuryAccountId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        fournisseursData,
        achatsData,
        productsData,
        accountsData,
      ] = await Promise.all([
        getFournisseurs(),
        getAchats(),
        getProducts(),
        getTreasuryAccounts(),
      ]);

      setFournisseurs(fournisseursData);
      setAchats(achatsData);
      setProducts(productsData);
      setAccounts(accountsData);

      if (fournisseursData.length > 0) {
        setSupplierId((current) => current || fournisseursData[0].id);
      }

      if (productsData.length > 0) {
        setProductId((current) => current || productsData[0].id);
      }

      if (accountsData.length > 0) {
        setTreasuryAccountId((current) => {
          if (current) return current;

          const caisse = accountsData.find(
            (account) => account.type === "CAISSE"
          );

          return caisse?.id ?? accountsData[0].id;
        });
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur de chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uniqueFournisseurs = useMemo(() => {
    const seen = new Set<string>();

    return fournisseurs.filter((fournisseur) => {
      const key = fournisseur.name.trim().toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [fournisseurs]);

  const uniqueAccounts = useMemo(() => {
    const seen = new Set<string>();

    return accounts.filter((account) => {
      const key = account.name.trim().toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [accounts]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [products, productId]
  );

  const selectedSupplier = useMemo(
    () => fournisseurs.find((supplier) => supplier.id === supplierId),
    [fournisseurs, supplierId]
  );

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === treasuryAccountId),
    [accounts, treasuryAccountId]
  );

  const unitPrice = selectedProduct
    ? Number(selectedProduct.purchase_price ?? 0)
    : 0;

  const numericQuantity = useMemo(() => {
    const value = Number(quantity);

    if (!Number.isInteger(value) || value < 1) {
      return 0;
    }

    return value;
  }, [quantity]);

  const total = useMemo(
    () => unitPrice * numericQuantity,
    [unitPrice, numericQuantity]
  );

  const increaseQuantity = () => {
    setQuantity((current) => {
      const value = Number(current);

      if (!Number.isInteger(value) || value < 1) {
        return "1";
      }

      return String(value + 1);
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => {
      const value = Number(current);

      if (!Number.isInteger(value) || value <= 1) {
        return "1";
      }

      return String(value - 1);
    });
  };

  const handleQuantityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const number = Number(value);

    if (Number.isInteger(number) && number >= 1) {
      setQuantity(String(number));
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const finalQuantity = Number(quantity);

    if (
      !Number.isInteger(finalQuantity) ||
      finalQuantity < 1
    ) {
      setErrorMessage(
        "La quantité doit être un nombre entier supérieur ou égal à 1."
      );
      return;
    }

    if (!supplierId || !productId || !treasuryAccountId) {
      setErrorMessage(
        "Veuillez compléter tous les champs obligatoires."
      );
      return;
    }

    if (unitPrice <= 0) {
      setErrorMessage(
        "Le prix d'achat du produit est invalide."
      );
      return;
    }

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const purchase: PurchaseForm = {
        supplierId,
        productId,
        quantity: finalQuantity,
        unitPrice,
        treasuryAccountId,
      };

      const result = await createPurchase(purchase);

      setSuccessMessage(
        `${result.message} — ${result.purchase_reference} — ${Number(
          result.total
        ).toLocaleString()} USD`
      );

      setQuantity("1");

      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de créer l'achat"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-72 rounded-lg bg-slate-800" />
          <div className="h-4 w-96 rounded bg-slate-800" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-28 rounded-2xl bg-slate-900" />
            <div className="h-28 rounded-2xl bg-slate-900" />
          </div>

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
                <Truck size={17} />
                <span>Approvisionnement</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Fournisseurs & achats
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Gérez vos fournisseurs, vos approvisionnements et les
                opérations d'achat intégrées à NEXUS.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500/40 hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Actualiser
            </button>
          </div>
        </section>

        {/* ALERTES */}
        {successMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 animate-[fadeUp_0.3s_ease-out]">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 animate-[fadeUp_0.3s_ease-out]">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* KPI */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Fournisseurs actifs
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {uniqueFournisseurs.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Références fournisseurs disponibles
                </p>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400">
                <Truck size={23} />
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Achats enregistrés
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {achats.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Opérations d'approvisionnement
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
                <PackagePlus size={23} />
              </div>
            </div>
          </div>
        </section>

        {/* FLUX INTEGRE */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              Processus intégré
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Une commande, plusieurs modules synchronisés
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                label: "Fournisseur",
                icon: Truck,
              },
              {
                label: "Achat",
                icon: PackagePlus,
              },
              {
                label: "Stock",
                icon: Package,
              },
              {
                label: "Trésorerie",
                icon: Wallet,
              },
              {
                label: "Comptabilité",
                icon: CircleDollarSign,
              },
            ].map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className="flex items-center gap-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                    <Icon size={18} />
                  </div>

                  <span className="truncate text-sm font-medium text-slate-200">
                    {label}
                  </span>
                </div>

                {index < 4 && (
                  <ArrowRight
                    size={16}
                    className="hidden shrink-0 text-slate-600 lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* NOUVEL ACHAT */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20">
          <div className="border-b border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400">
                <PackagePlus size={22} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Nouvel achat
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enregistrez un approvisionnement et synchronisez
                  automatiquement les modules concernés.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
            {/* FORMULAIRE */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6 lg:p-8"
            >
              {/* FOURNISSEUR */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Fournisseur
                </label>

                <div className="relative">
                  <select
                    value={supplierId}
                    onChange={(event) =>
                      setSupplierId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm text-slate-200 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    required
                  >
                    {uniqueFournisseurs.map((fournisseur) => (
                      <option
                        key={fournisseur.id}
                        value={fournisseur.id}
                      >
                        {fournisseur.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {selectedSupplier && (
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedSupplier.email ||
                      selectedSupplier.phone ||
                      "Fournisseur sélectionné"}
                  </p>
                )}
              </div>

              {/* PRODUIT */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Produit
                </label>

                <div className="relative">
                  <select
                    value={productId}
                    onChange={(event) =>
                      setProductId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm text-slate-200 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    required
                  >
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.reference} — {product.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              {/* QUANTITE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Quantité
                </label>

                <div className="flex">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={numericQuantity <= 1}
                    className="rounded-l-xl border border-slate-700 bg-slate-800 px-5 text-lg font-bold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full border-y border-slate-700 bg-slate-950 px-3 py-3 text-center text-sm font-semibold text-white outline-none"
                  />

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="rounded-r-xl border border-slate-700 bg-slate-800 px-5 text-lg font-bold text-slate-200 transition hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* COMPTE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Compte de paiement
                </label>

                <div className="relative">
                  <select
                    value={treasuryAccountId}
                    onChange={(event) =>
                      setTreasuryAccountId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm text-slate-200 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    required
                  >
                    {uniqueAccounts.map((account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.name} — {account.type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {selectedAccount && (
                  <p className="mt-2 text-xs text-slate-500">
                    Compte sélectionné : {selectedAccount.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving || numericQuantity < 1}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <PackagePlus size={18} />
                    Enregistrer l'achat
                  </>
                )}
              </button>
            </form>

            {/* RESUME */}
            <aside className="border-t border-slate-800 bg-slate-950/60 p-6 lg:border-l lg:border-t-0 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Résumé
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Produit
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {selectedProduct?.name || "—"}
                  </p>

                  {selectedProduct && (
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedProduct.reference}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Prix unitaire
                    </span>

                    <span className="font-medium text-slate-200">
                      {unitPrice.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Quantité
                    </span>

                    <span className="font-medium text-slate-200">
                      {numericQuantity}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-xs text-blue-300">
                    Montant total
                  </p>

                  <p className="mt-1 text-3xl font-bold text-white">
                    {total.toLocaleString()}{" "}
                    <span className="text-sm font-medium text-blue-300">
                      USD
                    </span>
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {unitPrice.toLocaleString()} USD ×{" "}
                    {numericQuantity}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                      <Package size={15} />
                    </div>

                    Le stock sera augmenté
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                      <ArrowDownRight size={15} />
                    </div>

                    La trésorerie sera débitée
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                      <CircleDollarSign size={15} />
                    </div>

                    L'écriture comptable sera créée
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* FOURNISSEURS */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Liste des fournisseurs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {uniqueFournisseurs.length} fournisseur
                {uniqueFournisseurs.length > 1 ? "s" : ""} enregistré
                {uniqueFournisseurs.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400">
              Fournisseurs
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    Fournisseur
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Email
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Téléphone
                  </th>
                </tr>
              </thead>

              <tbody>
                {uniqueFournisseurs.map((fournisseur) => (
                  <tr
                    key={fournisseur.id}
                    className="border-t border-slate-800 transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                          <Truck size={17} />
                        </div>

                        <div>
                          <p className="font-medium text-slate-200">
                            {fournisseur.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Fournisseur
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {fournisseur.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {fournisseur.phone || "—"}
                    </td>
                  </tr>
                ))}

                {uniqueFournisseurs.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Aucun fournisseur enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* HISTORIQUE */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Historique des achats
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Suivi des approvisionnements enregistrés
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 size={14} />
              Intégré
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    Référence
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Fournisseur
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Statut
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Montant
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {achats.map((achat) => {
                  const fournisseur = fournisseurs.find(
                    (item) => item.id === achat.supplier_id
                  );

                  return (
                    <tr
                      key={achat.id}
                      className="border-t border-slate-800 transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-blue-400">
                          {achat.reference}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-300">
                        {fournisseur?.name ||
                          achat.supplier_id}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                          {achat.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {Number(
                          achat.total_amount
                        ).toLocaleString()}{" "}
                        USD
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {new Date(
                          achat.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}

                {achats.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Aucun achat enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}