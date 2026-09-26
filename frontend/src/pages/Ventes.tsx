import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Package,
  ShoppingCart,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  createSale,
  getClients,
  getProducts,
  getTreasuryAccounts,
} from "../services/ventes.service";

import type { Client, TreasuryAccount } from "../types/ventes";
import type { Product } from "../types/dashboard";

export default function Ventes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);

  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [treasuryAccountId, setTreasuryAccountId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setErrorMessage("");

        const [clientsData, productsData, accountsData] =
          await Promise.all([
            getClients(),
            getProducts(),
            getTreasuryAccounts(),
          ]);

        setClients(clientsData);
        setProducts(productsData);
        setAccounts(accountsData);

        if (clientsData.length > 0) {
          setClientId((current) => current || clientsData[0].id);
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
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const selectedProduct = products.find(
    (product) => product.id === productId
  );

  const selectedClient = clients.find(
    (client) => client.id === clientId
  );

  const selectedAccount = accounts.find(
    (account) => account.id === treasuryAccountId
  );

  const unitPrice = selectedProduct
    ? Number(selectedProduct.unit_price ?? 0)
    : 0;

  const numericQuantity = Number(quantity);

  const total =
    unitPrice *
    (Number.isFinite(numericQuantity) && numericQuantity > 0
      ? numericQuantity
      : 0);

  const currentStock = selectedProduct?.stocks.quantity ?? 0;

  const stockInsufficient =
    Number.isInteger(numericQuantity) &&
    numericQuantity > currentStock;

  const increaseQuantity = () => {
    setQuantity((current) => {
      const value = Number(current);

      if (!Number.isFinite(value) || value < 1) {
        return "1";
      }

      return String(Math.floor(value) + 1);
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => {
      const value = Number(current);

      if (!Number.isFinite(value) || value <= 1) {
        return "1";
      }

      return String(Math.floor(value) - 1);
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

  const canSubmit = useMemo(() => {
    const finalQuantity = Number(quantity);

    return (
      !loading &&
      !!clientId &&
      !!productId &&
      !!treasuryAccountId &&
      Number.isInteger(finalQuantity) &&
      finalQuantity >= 1 &&
      unitPrice > 0 &&
      !stockInsufficient
    );
  }, [
    loading,
    clientId,
    productId,
    treasuryAccountId,
    quantity,
    unitPrice,
    stockInsufficient,
  ]);

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
      setSuccessMessage("");
      return;
    }

    if (!clientId || !productId || !treasuryAccountId) {
      setErrorMessage(
        "Veuillez compléter tous les champs obligatoires."
      );
      setSuccessMessage("");
      return;
    }

    if (unitPrice <= 0) {
      setErrorMessage("Le prix unitaire est invalide.");
      setSuccessMessage("");
      return;
    }

    if (stockInsufficient) {
      setErrorMessage(
        `Stock insuffisant : ${currentStock} unité(s) disponible(s).`
      );
      setSuccessMessage("");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const result = await createSale({
        clientId,
        productId,
        quantity: finalQuantity,
        unitPrice,
        treasuryAccountId,
      });

      setSuccessMessage(
        `${result.message} — ${result.invoice_reference} — ${Number(
          result.total
        ).toLocaleString()} USD`
      );

      setQuantity("1");

      const refreshedProducts = await getProducts();
      setProducts(refreshedProducts);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de créer la vente"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-slate-800" />
          <div className="h-4 w-72 rounded bg-slate-800" />

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="h-[560px] rounded-2xl bg-slate-900 xl:col-span-2" />
            <div className="h-[560px] rounded-2xl bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen bg-slate-950 p-5 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.7)]" />

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Module commercial
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Ventes
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Créez une vente et synchronisez automatiquement les
          opérations de NEXUS ERP.
        </p>
      </div>

      {/* Success */}
      {successMessage && (
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={21} />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-emerald-300">
              Vente enregistrée
            </p>

            <p className="mt-1 text-sm text-emerald-400/80">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <XCircle size={21} />
          </div>

          <div>
            <p className="font-semibold text-red-300">
              Opération impossible
            </p>

            <p className="mt-1 text-sm text-red-400/80">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 xl:col-span-2">
          <div className="border-b border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <ShoppingCart size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Nouvelle vente
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Facture + stock + trésorerie + comptabilité
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >
            {/* Client */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <User size={15} className="text-slate-500" />
                Client
              </label>

              <select
                value={clientId}
                onChange={(event) =>
                  setClientId(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                required
              >
                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Package size={15} className="text-slate-500" />
                Produit
              </label>

              <select
                value={productId}
                onChange={(event) =>
                  setProductId(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
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

              {selectedProduct && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Prix unitaire
                  </span>

                  <span className="font-semibold text-blue-400">
                    {unitPrice.toLocaleString()} USD
                  </span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Quantité
              </label>

              <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="w-14 border-r border-slate-700 text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  −
                </button>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full bg-transparent px-4 py-3 text-center text-sm font-semibold text-white outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="w-14 border-l border-slate-700 text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  +
                </button>
              </div>

              {selectedProduct && (
                <div
                  className={`mt-2 flex justify-between text-xs ${
                    stockInsufficient
                      ? "text-red-400"
                      : "text-slate-500"
                  }`}
                >
                  <span>Stock disponible</span>

                  <span className="font-semibold">
                    {currentStock} unité(s)
                  </span>
                </div>
              )}
            </div>

            {/* Account */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Wallet size={15} className="text-slate-500" />
                Compte de paiement
              </label>

              <select
                value={treasuryAccountId}
                onChange={(event) =>
                  setTreasuryAccountId(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                required
              >
                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name} — {account.type}
                  </option>
                ))}
              </select>

              {selectedAccount && (
                <p className="mt-2 text-xs text-slate-500">
                  Compte sélectionné :{" "}
                  <span className="text-slate-300">
                    {selectedAccount.name}
                  </span>
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Création en cours...
                </>
              ) : (
                <>
                  <ShoppingCart size={17} />
                  Créer la vente
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CircleDollarSign size={19} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Résumé
                </p>

                <h2 className="font-semibold text-white">
                  Total de la vente
                </h2>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-4xl font-bold tracking-tight text-white">
                {total.toLocaleString()}
                <span className="ml-2 text-base font-medium text-slate-500">
                  USD
                </span>
              </p>

              <div className="mt-6 space-y-3 border-t border-slate-800 pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Client
                  </span>

                  <span className="max-w-[55%] truncate font-medium text-slate-300">
                    {selectedClient?.name || "—"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Produit
                  </span>

                  <span className="max-w-[55%] truncate font-medium text-slate-300">
                    {selectedProduct?.name || "—"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Quantité
                  </span>

                  <span className="font-medium text-slate-300">
                    {quantity || "0"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Prix unitaire
                  </span>

                  <span className="font-medium text-slate-300">
                    {unitPrice.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Integration */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Intégration automatique
            </p>

            <h2 className="mt-1 font-semibold text-white">
              Une seule opération
            </h2>

            <div className="mt-6 space-y-3">
              {[
                {
                  label: "Facture de vente",
                  icon: ShoppingCart,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Sortie de stock",
                  icon: Package,
                  color: "text-amber-400",
                  bg: "bg-amber-500/10",
                },
                {
                  label: "Entrée de trésorerie",
                  icon: Wallet,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Écriture comptable",
                  icon: CircleDollarSign,
                  color: "text-violet-400",
                  bg: "bg-violet-500/10",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition hover:border-slate-700"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                    >
                      <Icon size={17} />
                    </div>

                    <span className="flex-1 text-sm text-slate-300">
                      {item.label}
                    </span>

                    {index < 3 && (
                      <ArrowRight
                        size={14}
                        className="text-slate-700"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}