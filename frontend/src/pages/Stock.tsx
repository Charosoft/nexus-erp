import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { api } from "../services/api";

type Category = {
  id: string;
  name: string;
  description: string | null;
};

type Product = {
  id: string;
  reference: string;
  name: string;
  description: string | null;
  unit_price: number;
  purchase_price: number;
  alert_threshold: number;
  is_active: boolean;
  category_id: string | null;
  categories_produits?: {
    id: string;
    name: string;
  } | null;
  stocks: {
    quantity: number;
    updated_at: string | null;
  };
};

type ProductForm = {
  reference: string;
  name: string;
  description: string;
  categoryId: string;
  unitPrice: string;
  purchasePrice: string;
  alertThreshold: string;
  initialQuantity: string;
};

const emptyForm: ProductForm = {
  reference: "",
  name: "",
  description: "",
  categoryId: "",
  unitPrice: "",
  purchasePrice: "",
  alertThreshold: "0",
  initialQuantity: "0",
};

/* =========================================================
   GÉNÉRATION DE RÉFÉRENCE
========================================================= */

const productPrefixes: Record<string, string> = {
  ordinateur: "ORD",
  laptop: "ORD",
  pc: "ORD",
  routeur: "RTR",
  switch: "SWT",
  commutateur: "SWT",
  clavier: "KBD",
  souris: "SOU",
  imprimante: "IMP",
  téléphone: "TEL",
  telephone: "TEL",
  smartphone: "TEL",
  tablette: "TAB",
  écran: "ECR",
  ecran: "ECR",
  serveur: "SRV",
  disque: "DSK",
  ssd: "SSD",
  hdd: "HDD",
  onduleur: "OND",
  caméra: "CAM",
  camera: "CAM",
  câble: "CBL",
  cable: "CBL",
  casque: "CAS",
  projecteur: "PRO",
  modem: "MDM",
  accessoire: "ACC",
};

const ignoredWords = new Set([
  "portable",
  "professionnel",
  "professionnelle",
  "usb",
  "wifi",
  "wi-fi",
  "sans",
  "fil",
  "24",
  "ports",
  "port",
  "de",
  "des",
  "du",
  "la",
  "le",
  "les",
  "avec",
  "pour",
  "type",
  "pro",
]);

const knownBrands: Record<string, string> = {
  dell: "DELL",
  hp: "HP",
  lenovo: "LEN",
  asus: "ASU",
  acer: "ACE",
  apple: "APP",
  macbook: "MAC",
  samsung: "SAM",
  xiaomi: "XIA",
  huawei: "HUA",
  cisco: "CIS",
  mikrotik: "MIK",
  tplink: "TP",
  dlink: "DLI",
  logitech: "LOG",
  epson: "EPS",
  canon: "CAN",
  brother: "BRO",
  kingston: "KIN",
  sandisk: "SAN",
  toshiba: "TOS",
  sony: "SON",
  philips: "PHI",
  zte: "ZTE",
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanCode(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "")
    .toUpperCase();
}

function getProductPrefix(name: string) {
  const words = normalizeText(name)
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "PRD";
  }

  const firstWord = words[0];

  if (productPrefixes[firstWord]) {
    return productPrefixes[firstWord];
  }

  if (firstWord.length >= 3) {
    return cleanCode(firstWord).slice(0, 3);
  }

  return "PRD";
}

function getBrandCode(name: string) {
  const words = normalizeText(name)
    .split(/\s+/)
    .filter(Boolean);

  for (const word of words) {
    if (knownBrands[word]) {
      return knownBrands[word];
    }
  }

  const usefulWord = words.find(
    (word) =>
      !ignoredWords.has(word) &&
      !productPrefixes[word] &&
      word.length >= 3
  );

  if (!usefulWord) {
    return "GEN";
  }

  return cleanCode(usefulWord).slice(0, 3);
}

function getNextReference(
  name: string,
  products: Product[]
) {
  const prefix = getProductPrefix(name);
  const brand = getBrandCode(name);

  const base = `${prefix}-${brand}`;

  const existingNumbers = products
    .map((product) => product.reference)
    .filter((reference) =>
      reference.startsWith(`${base}-`)
    )
    .map((reference) => {
      const match = reference.match(
        new RegExp(`^${base}-(\\d+)$`)
      );

      return match
        ? Number(match[1])
        : 0;
    })
    .filter((number) => Number.isFinite(number));

  const nextNumber =
    existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : 1;

  return `${base}-${String(nextNumber).padStart(
    3,
    "0"
  )}`;
}

/* =========================================================
   PAGE STOCK
========================================================= */

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(
    emptyForm
  );

  const [referenceGenerated, setReferenceGenerated] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        productsResponse,
        categoriesResponse,
      ] = await Promise.all([
        api.get<{ data: Product[] }>(
          "/stock/products"
        ),
        api.get<{ data: Category[] }>(
          "/stock/categories"
        ),
      ]);

      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error("Erreur stock :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de charger le stock."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =======================================================
     KPI
  ======================================================= */

  const alerts = products.filter(
    (product) =>
      product.stocks.quantity <=
      product.alert_threshold
  );

  const totalQuantity = products.reduce(
    (total, product) =>
      total + product.stocks.quantity,
    0
  );

  const availableProducts = products.filter(
    (product) =>
      product.stocks.quantity >
      product.alert_threshold
  ).length;

  /* =======================================================
     RECHERCHE
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const reference =
        product.reference.toLowerCase();

      const name =
        product.name.toLowerCase();

      const category =
        product.categories_produits?.name?.toLowerCase() ??
        "";

      return (
        reference.includes(query) ||
        name.includes(query) ||
        category.includes(query)
      );
    });
  }, [products, search]);

  /* =======================================================
     MODAL CRÉATION
  ======================================================= */

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setReferenceGenerated(false);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  /* =======================================================
     MODAL MODIFICATION
  ======================================================= */

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setForm({
      reference: product.reference,
      name: product.name,
      description: product.description ?? "",
      categoryId: product.category_id ?? "",
      unitPrice: String(product.unit_price),
      purchasePrice: String(product.purchase_price),
      alertThreshold: String(
        product.alert_threshold
      ),
      initialQuantity: String(
        product.stocks.quantity
      ),
    });

    setReferenceGenerated(false);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setReferenceGenerated(false);
    setError("");
  };

  /* =======================================================
     FORMULAIRE
  ======================================================= */

  const updateForm = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleNameChange = (
    value: string
  ) => {
    setForm((current) => {
      let nextReference = current.reference;

      if (
        !editingProduct &&
        (
          referenceGenerated ||
          !current.reference
        ) &&
        value.trim()
      ) {
        nextReference = getNextReference(
          value,
          products
        );
      }

      return {
        ...current,
        name: value,
        reference: nextReference,
      };
    });

    if (!editingProduct && value.trim()) {
      setReferenceGenerated(true);
    }
  };

  const handleReferenceChange = (
    value: string
  ) => {
    setReferenceGenerated(false);

    updateForm("reference", value.toUpperCase());
  };

  const regenerateReference = () => {
    if (!form.name.trim()) {
      return;
    }

    const reference = getNextReference(
      form.name,
      products
    );

    setForm((current) => ({
      ...current,
      reference,
    }));

    setReferenceGenerated(true);
  };

  /* =======================================================
     ENREGISTREMENT
  ======================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const reference =
        form.reference.trim().toUpperCase();

      const name = form.name.trim();

      if (!reference || !name) {
        throw new Error(
          "La référence et le nom du produit sont obligatoires."
        );
      }

      const unitPrice = Number(
        form.unitPrice
      );

      const purchasePrice = Number(
        form.purchasePrice
      );

      const alertThreshold = Number(
        form.alertThreshold
      );

      if (
        !Number.isFinite(unitPrice) ||
        !Number.isFinite(purchasePrice) ||
        !Number.isFinite(alertThreshold)
      ) {
        throw new Error(
          "Les valeurs numériques sont invalides."
        );
      }

      if (
        unitPrice < 0 ||
        purchasePrice < 0 ||
        alertThreshold < 0
      ) {
        throw new Error(
          "Les valeurs numériques ne peuvent pas être négatives."
        );
      }

      if (editingProduct) {
        await api.put(
          `/stock/products/${editingProduct.id}`,
          {
            reference,
            name,
            description:
              form.description.trim() || null,
            categoryId:
              form.categoryId || null,
            unitPrice,
            purchasePrice,
            alertThreshold,
          }
        );

        setSuccess(
          "Produit modifié avec succès."
        );
      } else {
        const initialQuantity = Number(
          form.initialQuantity
        );

        if (
          !Number.isFinite(initialQuantity) ||
          initialQuantity < 0
        ) {
          throw new Error(
            "La quantité initiale est invalide."
          );
        }

        await api.post("/stock/products", {
          reference,
          name,
          description:
            form.description.trim() || null,
          categoryId:
            form.categoryId || null,
          unitPrice,
          purchasePrice,
          alertThreshold,
          initialQuantity,
        });

        setSuccess(
          "Produit créé avec succès."
        );
      }

      await loadData();

      setTimeout(() => {
        setModalOpen(false);
        setEditingProduct(null);
        setForm(emptyForm);
        setReferenceGenerated(false);
        setSuccess("");
      }, 500);
    } catch (error) {
      console.error(
        "Erreur enregistrement produit :",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer le produit."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DÉSACTIVATION
  ======================================================= */

  const handleDelete = async (
    product: Product
  ) => {
    const confirmed = window.confirm(
      `Voulez-vous désactiver le produit "${product.name}" ?\n\nIl ne sera plus affiché dans le stock actif.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/stock/products/${product.id}`
      );

      setSuccess(
        "Produit désactivé avec succès."
      );

      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      console.error(
        "Erreur désactivation produit :",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de désactiver le produit."
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="page-transition min-h-screen bg-slate-950 p-5 md:p-8">
      {/* HEADER */}
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
            Gérez vos produits, vos quantités et
            vos seuils d'alerte.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-500/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Actualiser
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <Plus size={18} />

            Nouveau produit
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>{success}</span>
        </div>
      )}

      {/* KPI */}
      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Références actives
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {products.length}
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <Package size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Quantité totale
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {totalQuantity}
              </p>
            </div>

            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
              <Boxes size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Stock disponible
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {availableProducts}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <CheckCircle2 size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* ALERTES */}
      {alerts.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
              <AlertTriangle size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Alertes de stock
              </h2>

              <p className="text-xs text-slate-500">
                {alerts.length} produit
                {alerts.length > 1 ? "s" : ""} sous
                le seuil défini.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {alerts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-amber-500/10 bg-slate-950/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {product.reference}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-amber-400">
                      {product.stocks.quantity}
                    </p>

                    <p className="text-[11px] text-slate-600">
                      seuil {product.alert_threshold}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUITS */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Produits
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredProducts.length} résultat
            {filteredProducts.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher un produit..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Produit
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Catégorie
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prix achat
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prix vente
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stock
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  État
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <RefreshCw
                      size={20}
                      className="mx-auto mb-3 animate-spin text-blue-400"
                    />

                    <p className="text-sm text-slate-500">
                      Chargement du stock...
                    </p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <Package
                      size={28}
                      className="mx-auto mb-3 text-slate-700"
                    />

                    <p className="text-sm font-medium text-slate-400">
                      Aucun produit trouvé
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Modifiez votre recherche ou
                      ajoutez un produit.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const quantity =
                    product.stocks.quantity;

                  const isAlert =
                    quantity <=
                    product.alert_threshold;

                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {product.reference}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-400">
                          {product.categories_produits
                            ?.name ?? "Sans catégorie"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-300">
                          {Number(
                            product.purchase_price
                          ).toFixed(2)}{" "}
                          USD
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-white">
                          {Number(
                            product.unit_price
                          ).toFixed(2)}{" "}
                          USD
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <span
                            className={
                              isAlert
                                ? "font-semibold text-amber-400"
                                : "font-semibold text-emerald-400"
                            }
                          >
                            {quantity}
                          </span>

                          <span className="ml-2 text-xs text-slate-600">
                            / seuil{" "}
                            {product.alert_threshold}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isAlert ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                            <AlertTriangle size={13} />
                            Alerte
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                            <CheckCircle2 size={13} />
                            Disponible
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditModal(product)
                            }
                            title="Modifier"
                            className="rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(product)
                            }
                            title="Désactiver"
                            className="rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/50">
            {/* HEADER MODAL */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingProduct
                    ? "Modifier le produit"
                    : "Nouveau produit"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingProduct
                    ? "Mettez à jour les informations du produit."
                    : "Ajoutez une nouvelle référence au stock."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] overflow-y-auto p-6"
            >
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{success}</span>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {/* RÉFÉRENCE */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Référence *
                    </label>

                    {!editingProduct &&
                      form.name.trim() && (
                        <button
                          type="button"
                          onClick={regenerateReference}
                          className="text-[11px] font-medium text-blue-400 transition hover:text-blue-300"
                        >
                          Générer
                        </button>
                      )}
                  </div>

                  <input
                    value={form.reference}
                    onChange={(event) =>
                      handleReferenceChange(
                        event.target.value
                      )
                    }
                    placeholder="Ex. ORD-DELL-001"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                  />

                  {!editingProduct && (
                    <p className="mt-2 text-[11px] text-slate-600">
                      {referenceGenerated
                        ? "Référence générée automatiquement — vous pouvez la modifier."
                        : "La référence sera proposée automatiquement à partir du nom."}
                    </p>
                  )}
                </div>

                {/* NOM */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Nom du produit *
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                    placeholder="Ex. Ordinateur portable Dell"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>

                {/* CATÉGORIE */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Catégorie
                  </label>

                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      updateForm(
                        "categoryId",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50"
                  >
                    <option value="">
                      Sans catégorie
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRIX ACHAT */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Prix d'achat *
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.purchasePrice}
                      onChange={(event) =>
                        updateForm(
                          "purchasePrice",
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pr-14 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600">
                      USD
                    </span>
                  </div>
                </div>

                {/* PRIX VENTE */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Prix de vente *
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.unitPrice}
                      onChange={(event) =>
                        updateForm(
                          "unitPrice",
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pr-14 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600">
                      USD
                    </span>
                  </div>
                </div>

                {/* SEUIL */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Seuil d'alerte *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.alertThreshold}
                    onChange={(event) =>
                      updateForm(
                        "alertThreshold",
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50"
                  />
                </div>

                {/* QUANTITÉ */}
                {!editingProduct && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Quantité initiale *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.initialQuantity}
                      onChange={(event) =>
                        updateForm(
                          "initialQuantity",
                          event.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50"
                    />
                  </div>
                )}

                {/* DESCRIPTION */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="Description facultative du produit..."
                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving
                    ? "Enregistrement..."
                    : editingProduct
                    ? "Enregistrer"
                    : "Créer le produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}