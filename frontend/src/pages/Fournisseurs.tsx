import { useEffect, useState } from "react";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Truck,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  getFournisseurs,
  createPurchase,
} from "../services/fournisseurs.service";

import type {
  Fournisseur,
  PurchaseForm,
} from "../types/fournisseurs";

import type { Product } from "../types/dashboard";

import {
  getProducts,
  getTreasuryAccounts,
} from "../services/ventes.service";

import type { TreasuryAccount } from "../types/ventes";

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>(
    []
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [treasuryAccountId, setTreasuryAccountId] =
    useState("");

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
        productsData,
        accountsData,
      ] = await Promise.all([
        getFournisseurs(),
        getProducts(),
        getTreasuryAccounts(),
      ]);

      setFournisseurs(fournisseursData);
      setProducts(productsData);
      setAccounts(accountsData);

      if (
        fournisseursData.length > 0 &&
        !supplierId
      ) {
        setSupplierId(fournisseursData[0].id);
      }

      if (
        productsData.length > 0 &&
        !productId
      ) {
        setProductId(productsData[0].id);
      }

      const caisse = accountsData.find(
        (account) => account.type === "CAISSE"
      );

      if (
        caisse &&
        !treasuryAccountId
      ) {
        setTreasuryAccountId(caisse.id);
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

  const selectedProduct = products.find(
    (product) => product.id === productId
  );

  const selectedSupplier = fournisseurs.find(
    (fournisseur) =>
      fournisseur.id === supplierId
  );

  const selectedAccount = accounts.find(
    (account) =>
      account.id === treasuryAccountId
  );

  const unitPrice = selectedProduct
    ? Number(
        selectedProduct.purchase_price ?? 0
      )
    : 0;

  const total = unitPrice * quantity;

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !supplierId ||
      !productId ||
      !treasuryAccountId
    ) {
      setErrorMessage(
        "Veuillez compléter tous les champs."
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
        quantity,
        unitPrice,
        treasuryAccountId,
      };

      const result =
        await createPurchase(purchase);

      setSuccessMessage(
        `${result.message} — ${result.purchase_reference} — ${result.total} USD`
      );

      setQuantity(1);

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="text-sm text-slate-500">
            Chargement des fournisseurs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
            <Truck size={21} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Fournisseurs & achats
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Gestion des approvisionnements et intégration automatique
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-medium">
              Achat enregistré avec succès
            </p>

            <p className="mt-1 text-xs text-emerald-400/70">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <XCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-medium">
              Opération impossible
            </p>

            <p className="mt-1 text-xs text-red-400/70">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* NOUVEL ACHAT */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

        {/* FORMULAIRE */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">

          {/* FORM HEADER */}
          <div className="border-b border-white/10 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                <ShoppingCart size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Nouvel achat
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Approvisionnement + stock + trésorerie + comptabilité
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-5 sm:p-6"
          >

            {/* FOURNISSEUR */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Building2
                  size={16}
                  className="text-slate-500"
                />

                Fournisseur
              </label>

              <select
                value={supplierId}
                onChange={(event) =>
                  setSupplierId(
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-blue-500/60"
                required
              >
                {fournisseurs.length === 0 ? (
                  <option value="">
                    Aucun fournisseur disponible
                  </option>
                ) : (
                  fournisseurs.map(
                    (fournisseur) => (
                      <option
                        key={fournisseur.id}
                        value={fournisseur.id}
                        className="bg-slate-950"
                      >
                        {fournisseur.name}
                      </option>
                    )
                  )
                )}
              </select>
            </div>

            {/* PRODUIT */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Package
                  size={16}
                  className="text-slate-500"
                />

                Produit
              </label>

              <select
                value={productId}
                onChange={(event) =>
                  setProductId(
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-blue-500/60"
                required
              >
                {products.length === 0 ? (
                  <option value="">
                    Aucun produit disponible
                  </option>
                ) : (
                  products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                      className="bg-slate-950"
                    >
                      {product.reference} —{" "}
                      {product.name}
                    </option>
                  ))
                )}
              </select>

              {selectedProduct && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Prix d'achat
                  </span>

                  <span className="font-medium text-blue-400">
                    {unitPrice.toLocaleString()} USD
                  </span>
                </div>
              )}
            </div>

            {/* QUANTITE */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Package
                  size={16}
                  className="text-slate-500"
                />

                Quantité
              </label>

              <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-slate-950">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="flex w-14 items-center justify-center border-r border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <Minus size={17} />
                </button>

                <div className="flex flex-1 items-center justify-center text-sm font-medium text-white">
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="flex w-14 items-center justify-center border-l border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* COMPTE */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <WalletCards
                  size={16}
                  className="text-slate-500"
                />

                Compte de paiement
              </label>

              <select
                value={treasuryAccountId}
                onChange={(event) =>
                  setTreasuryAccountId(
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-blue-500/60"
                required
              >
                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                    className="bg-slate-950"
                  >
                    {account.name} —{" "}
                    {account.type}
                  </option>
                ))}
              </select>

              {selectedAccount && (
                <p className="mt-2 text-xs text-slate-600">
                  Solde disponible :{" "}
                  <span className="text-slate-400">
                    {Number(
                      selectedAccount.balance
                    ).toLocaleString()}{" "}
                    {selectedAccount.currency}
                  </span>
                </p>
              )}
            </div>

            {/* BOUTON */}
            <button
              type="submit"
              disabled={
                saving ||
                !supplierId ||
                !productId ||
                !treasuryAccountId
              }
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Enregistrement...
                </>
              ) : (
                <>
                  <ShoppingCart size={17} />

                  Enregistrer l'achat

                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESUME */}
        <div className="space-y-5">

          {/* TOTAL */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CircleDollarSign size={20} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Résumé
                </p>

                <p className="mt-1 text-sm font-medium text-slate-400">
                  Total de l'achat
                </p>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-4xl font-bold tracking-tight text-white">
                {total.toLocaleString()}
              </span>

              <span className="ml-2 text-sm text-slate-500">
                USD
              </span>
            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-600">
                  Fournisseur
                </span>

                <span className="text-right font-medium text-slate-300">
                  {selectedSupplier?.name ||
                    "—"}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-600">
                  Produit
                </span>

                <span className="max-w-[180px] text-right font-medium text-slate-300">
                  {selectedProduct?.name ||
                    "—"}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-600">
                  Quantité
                </span>

                <span className="font-medium text-slate-300">
                  {quantity}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-600">
                  Prix unitaire
                </span>

                <span className="font-medium text-slate-300">
                  {unitPrice.toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>

          {/* INTEGRATION */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">

            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                Intégration automatique
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                Une seule opération
              </p>
            </div>

            <div className="space-y-2">

              {/* STOCK */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Package size={17} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-300">
                    Entrée de stock
                  </p>

                  <p className="text-[10px] text-slate-600">
                    Quantité automatiquement ajoutée
                  </p>
                </div>

                <ArrowRight
                  size={15}
                  className="text-slate-700"
                />
              </div>

              {/* TRESORERIE */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <WalletCards size={17} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-300">
                    Sortie de trésorerie
                  </p>

                  <p className="text-[10px] text-slate-600">
                    Montant débité automatiquement
                  </p>
                </div>

                <ArrowRight
                  size={15}
                  className="text-slate-700"
                />
              </div>

              {/* COMPTABILITE */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <FileText size={17} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-300">
                    Écriture comptable
                  </p>

                  <p className="text-[10px] text-slate-600">
                    Écriture générée automatiquement
                  </p>
                </div>

                <ArrowRight
                  size={15}
                  className="text-slate-700"
                />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FOURNISSEURS */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-semibold text-white">
              Fournisseurs
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              {fournisseurs.length} fournisseur
              {fournisseurs.length > 1
                ? "s"
                : ""}
            </p>
          </div>

          <Truck
            size={19}
            className="text-slate-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-600">
                <th className="px-6 py-4 font-medium">
                  Fournisseur
                </th>

                <th className="px-6 py-4 font-medium">
                  Email
                </th>

                <th className="px-6 py-4 font-medium">
                  Téléphone
                </th>

                <th className="px-6 py-4 font-medium">
                  Adresse
                </th>
              </tr>
            </thead>

            <tbody>
              {fournisseurs.map(
                (fournisseur) => (
                  <tr
                    key={fournisseur.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          <Building2 size={16} />
                        </div>

                        <span className="font-medium text-slate-300">
                          {fournisseur.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {fournisseur.email ||
                        "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {fournisseur.phone ||
                        "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {fournisseur.address ||
                        "—"}
                    </td>
                  </tr>
                )
              )}

              {fournisseurs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-slate-600"
                  >
                    Aucun fournisseur enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}