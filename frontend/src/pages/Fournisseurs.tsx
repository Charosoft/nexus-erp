import {
  Building2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  createFournisseur,
  deleteFournisseur,
  getFournisseurs,
  updateFournisseur,
  type CreateFournisseurInput,
} from "../services/fournisseurs.service";

import type { Fournisseur } from "../types/fournisseurs";

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const emptyForm: FormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] =
    useState<Fournisseur[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormData>(emptyForm);

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  async function loadFournisseurs() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getFournisseurs();

      setFournisseurs(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les fournisseurs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFournisseurs();
  }, []);

  /* =========================================================
     RECHERCHE
  ========================================================= */

  const filteredFournisseurs =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return fournisseurs;
      }

      return fournisseurs.filter(
        (fournisseur) =>
          fournisseur.name
            .toLowerCase()
            .includes(query) ||
          fournisseur.email
            ?.toLowerCase()
            .includes(query) ||
          fournisseur.phone
            ?.toLowerCase()
            .includes(query) ||
          fournisseur.address
            ?.toLowerCase()
            .includes(query)
      );
    }, [fournisseurs, search]);

  /* =========================================================
     MODAL
  ========================================================= */

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(
    fournisseur: Fournisseur
  ) {
    setEditingId(fournisseur.id);

    setForm({
      name: fournisseur.name,
      email: fournisseur.email ?? "",
      phone: fournisseur.phone ?? "",
      address: fournisseur.address ?? "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  /* =========================================================
     FORMULAIRE
  ========================================================= */

  function handleChange(
    field: keyof FormData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Le nom du fournisseur est obligatoire."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: CreateFournisseurInput = {
        name: form.name.trim(),
        email:
          form.email.trim() || null,
        phone:
          form.phone.trim() || null,
        address:
          form.address.trim() || null,
      };

      if (editingId) {
        const updated =
          await updateFournisseur(
            editingId,
            payload
          );

        setFournisseurs((current) =>
          current.map((item) =>
            item.id === editingId
              ? updated
              : item
          )
        );

        setSuccess(
          "Fournisseur modifié avec succès."
        );
      } else {
        const created =
          await createFournisseur(
            payload
          );

        setFournisseurs((current) => [
          created,
          ...current,
        ]);

        setSuccess(
          "Fournisseur créé avec succès."
        );
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  async function handleDelete(
    fournisseur: Fournisseur
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer "${fournisseur.name}" ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteFournisseur(
        fournisseur.id
      );

      setFournisseurs((current) =>
        current.filter(
          (item) =>
            item.id !== fournisseur.id
        )
      );

      setSuccess(
        "Fournisseur supprimé avec succès."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le fournisseur."
      );
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-400">
            <Truck size={18} />

            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Gestion fournisseurs
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Fournisseurs
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Gérez vos fournisseurs et leurs informations.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
        >
          <Plus size={18} />
          Nouveau fournisseur
        </button>
      </div>

      {/* ALERTES */}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Total fournisseurs
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {fournisseurs.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Building2 size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Résultats
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {filteredFournisseurs.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Truck size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* RECHERCHE */}

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher un fournisseur..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-white/10 bg-slate-950/50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fournisseur
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contact
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Adresse
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Chargement des fournisseurs...
                  </td>
                </tr>
              ) : filteredFournisseurs.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center"
                  >
                    <Truck
                      size={32}
                      className="mx-auto mb-3 text-slate-700"
                    />

                    <p className="text-sm font-medium text-slate-400">
                      Aucun fournisseur trouvé
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Ajoutez votre premier fournisseur.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFournisseurs.map(
                  (fournisseur) => (
                    <tr
                      key={fournisseur.id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                            <Building2
                              size={18}
                            />
                          </div>

                          <div>
                            <p className="font-medium text-white">
                              {fournisseur.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-600">
                              {fournisseur.id.slice(
                                0,
                                8
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          {fournisseur.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Mail
                                size={14}
                                className="text-slate-600"
                              />

                              {fournisseur.email}
                            </div>
                          )}

                          {fournisseur.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Phone
                                size={14}
                                className="text-slate-600"
                              />

                              {fournisseur.phone}
                            </div>
                          )}

                          {!fournisseur.email &&
                            !fournisseur.phone && (
                              <span className="text-xs text-slate-600">
                                Aucun contact
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {fournisseur.address ? (
                          <div className="flex items-start gap-2 text-sm text-slate-400">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0 text-slate-600"
                            />

                            <span>
                              {fournisseur.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">
                            Non renseignée
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                fournisseur
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                            title="Modifier"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                fournisseur
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingId
                    ? "Modifier le fournisseur"
                    : "Nouveau fournisseur"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Informations du fournisseur
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Nom du fournisseur
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Ex. Africell RDC"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="contact@entreprise.com"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Téléphone
                  </label>

                  <input
                    value={form.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="+243..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Adresse
                </label>

                <textarea
                  value={form.address}
                  onChange={(event) =>
                    handleChange(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Adresse du fournisseur"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Enregistrement..."
                    : editingId
                    ? "Enregistrer"
                    : "Créer le fournisseur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}