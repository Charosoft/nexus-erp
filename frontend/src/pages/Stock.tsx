import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Package,
  RefreshCw,
  Search,
  TrendingDown,
} from "lucide-react";

import { api } from "../services/api";
import type { Product } from "../types/dashboard";

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    setLoading(true);

    try {
      const response = await api.get<{ data: Product[] }>(
        "/stock/products"
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Erreur stock :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const alerts = products.filter(
    (product) =>
      product.stocks.quantity <= product.alert_threshold
  );

  const totalQuantity = products.reduce(
    (total, product) => total + product.stocks.quantity,
    0
  );

  const availableProducts = products.filter(
    (product) =>
      product.stocks.quantity > product.alert_threshold
  ).length;

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const reference = product.reference.toLowerCase();
      const name = product.name.toLowerCase();
      const category =
        product.categories_produits?.name?.toLowerCase() ?? "";

      return (
        reference.includes(query) ||
        name.includes(query) ||
        category.includes(query)
      );
    });
  }, [products, search]);

  return (
    <div className="page-transition min-h-screen bg-slate-950 p-5 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.7)]" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Gestion opérationnelle
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Stock & inventaire
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Gérez vos produits, vos quantités et vos seuils
            d'alerte.
          </p>
        </div>

        <button
          onClick={loadProducts}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-500/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Actualiser
        </button>
      </div>

      {/* KPI */}
      <div className="grid gap-5 md:grid-cols-3">
        <div
          className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
          style={{
            animation: "fadeUp 0.4s ease-out both",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Package size={21} />
            </div>

            <span className="text-xs uppercase tracking-wider text-slate-600">
              Références
            </span>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            Produits référencés
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            {products.length}
          </p>
        </div>

        <div
          className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
          style={{
            animation: "fadeUp 0.4s ease-out 0.07s both",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Boxes size={21} />
            </div>

            <span className="text-xs uppercase tracking-wider text-slate-600">
              Quantité
            </span>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            Unités en stock
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            {totalQuantity.toLocaleString()}
          </p>
        </div>

        <div
          className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
          style={{
            animation: "fadeUp 0.4s ease-out 0.14s both",
          }}
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                alerts.length > 0
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {alerts.length > 0 ? (
                <TrendingDown size={21} />
              ) : (
                <CheckCircle2 size={21} />
              )}
            </div>

            <span className="text-xs uppercase tracking-wider text-slate-600">
              État
            </span>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            Alertes de stock
          </p>

          <p
            className={`mt-1 text-3xl font-bold ${
              alerts.length > 0
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {alerts.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {availableProducts} produit(s) disponible(s)
          </p>
        </div>
      </div>

      {/* Alert */}
      {alerts.length > 0 && (
        <div
          className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
          style={{
            animation: "fadeUp 0.45s ease-out 0.18s both",
          }}
        >
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="font-semibold text-red-300">
                Attention — stock faible
              </p>

              <p className="mt-1 text-sm text-red-400/80">
                {alerts.length} produit(s) ont atteint ou
                dépassé leur seuil minimum.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div
        className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"
        style={{
          animation: "fadeUp 0.45s ease-out 0.22s both",
        }}
      >
        <div className="flex flex-col gap-4 border-b border-slate-800 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Package size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Catalogue produits
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredProducts.length} résultat(s)
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher un produit..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-slate-800/60"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Package
              size={32}
              className="mx-auto text-slate-700"
            />

            <p className="mt-4 text-sm font-medium text-slate-400">
              Aucun produit trouvé
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Modifiez votre recherche et réessayez.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    Référence
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Produit
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Catégorie
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Prix
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Seuil
                  </th>

                  <th className="px-6 py-4 text-center font-medium">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    État
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const quantity = product.stocks.quantity;

                  const isAlert =
                    quantity <= product.alert_threshold;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-800/70 transition duration-200 hover:bg-slate-800/30 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-400">
                          {product.reference}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">
                          {product.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {product.categories_produits?.name ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {Number(
                          product.unit_price
                        ).toLocaleString()}{" "}
                        <span className="text-xs text-slate-500">
                          USD
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {product.alert_threshold}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex min-w-12 items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-bold ${
                            isAlert
                              ? "bg-red-500/10 text-red-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {quantity}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            isAlert
                              ? "bg-red-500/10 text-red-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {isAlert ? (
                            <AlertTriangle size={12} />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}

                          {isAlert
                            ? "Stock faible"
                            : "Disponible"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}