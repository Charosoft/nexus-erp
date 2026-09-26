import { useEffect, useState } from "react";
import {
  Shield,
  ShieldOff,
  Trash2,
  UserPlus,
  Users,
  X,
  RefreshCw,
  UserRound,
  Mail,
  Phone,
  BriefcaseBusiness,
  Boxes,
  Calculator,
  Truck,
  ShoppingCart,
  Wallet,
  LockKeyhole,
  UserCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { api } from "../../services/api";

type Profil = {
  id: string;
  nom_complet: string | null;
  telephone: string | null;
  fonction: string | null;
  module: string | null;
  created_at: string;
};

type Admin = {
  user_id: string;
};

const modules = [
  "Stock & Inventaire",
  "Comptabilité",
  "Fournisseurs",
  "Ventes",
  "Trésorerie",
];

const moduleIcons: Record<string, typeof Boxes> = {
  "Stock & Inventaire": Boxes,
  Comptabilité: Calculator,
  Fournisseurs: Truck,
  Ventes: ShoppingCart,
  Trésorerie: Wallet,
};

export default function Utilisateurs() {
  const [users, setUsers] = useState<Profil[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nom_complet: "",
    email: "",
    password: "",
    telephone: "",
    fonction: "",
    module: "",
    is_admin: false,
  });

  const loadUsers = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const [{ data: profils }, { data: equipeAdmins }] =
      await Promise.all([
        supabase
          .from("profils")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("equipe_admins")
          .select("user_id"),
      ]);

    setUsers(profils || []);
    setAdmins(equipeAdmins || []);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const isAdmin = (id: string) =>
    admins.some((admin) => admin.user_id === id);

  const resetForm = () => {
    setForm({
      nom_complet: "",
      email: "",
      password: "",
      telephone: "",
      fonction: "",
      module: "",
      is_admin: false,
    });
  };

  const handleCreateUser = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.nom_complet ||
      !form.email ||
      !form.password
    ) {
      alert(
        "Nom, email et mot de passe sont obligatoires."
      );
      return;
    }

    if (form.password.length < 6) {
      alert(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    setSaving(true);

    try {
      const data = await api.post<{
        message?: string;
        error?: string;
      }>("/admin/users", form);

      alert(
        data.message ||
          "Utilisateur créé avec succès."
      );

      resetForm();
      setShowForm(false);

      await loadUsers();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePromote = async (userId: string) => {
    const { error } = await supabase.rpc(
      "ajouter_admin",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      alert(
        `Erreur promotion admin :\n${error.message}\n\nCode : ${
          error.code || "inconnu"
        }`
      );
      return;
    }

    alert("Utilisateur promu administrateur.");

    await loadUsers();
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (admins.length <= 1) {
      alert(
        "Impossible : il doit rester au moins un administrateur."
      );
      return;
    }

    if (
      !confirm(
        "Retirer les droits administrateur ?"
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.rpc(
        "retirer_admin",
        {
          p_user_id: userId,
        }
      );

      if (error) {
        throw error;
      }

      await loadUsers();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Impossible de retirer les droits."
      );
    }
  };

  const handleDelete = async (userId: string) => {
    if (isAdmin(userId)) {
      alert(
        "Retirez d'abord les droits administrateur."
      );
      return;
    }

    if (
      !confirm(
        "Supprimer définitivement cet utilisateur ?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/admin/users/${userId}`
      );

      alert("Utilisateur supprimé.");

      await loadUsers();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression."
      );
    }
  };

  const adminCount = admins.length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Users size={24} />
              </div>

              <div>
                <p className="text-sm font-medium text-blue-400">
                  Administration
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  Utilisateurs & administrateurs
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Gérez les comptes utilisateurs, les profils
              et les autorisations d'accès au système NEXUS.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => loadUsers(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
              Actualiser
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500"
            >
              <UserPlus size={18} />
              Ajouter utilisateur
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <Users size={20} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Utilisateurs
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <Shield size={20} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Administrateurs
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {adminCount}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <LockKeyhole size={20} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Contrôle d'accès
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-400">
                  Sécurisé
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        {showForm && (
          <section className="mb-8 rounded-2xl border border-blue-500/20 bg-slate-900/80 p-6 shadow-xl shadow-black/10">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Nouveau compte
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Créer un utilisateur
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Le compte sera créé directement dans Supabase Auth.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateUser}
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Nom complet *
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    placeholder="Ex. Jean Kabila"
                    value={form.nom_complet}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nom_complet: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Adresse email *
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="email"
                    placeholder="utilisateur@exemple.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Mot de passe *
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Téléphone
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    placeholder="+243..."
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        telephone: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fonction
                </label>

                <div className="relative">
                  <BriefcaseBusiness
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    placeholder="Ex. Développeur"
                    value={form.fonction}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fonction: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Module
                </label>

                <select
                  value={form.module}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      module: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="">Aucun module</option>

                  {modules.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 transition hover:border-slate-600 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.is_admin}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_admin: e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Accorder les droits administrateur
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    L'utilisateur pourra gérer les comptes et
                    l'administration NEXUS.
                  </p>
                </div>
              </label>

              <div className="flex flex-col-reverse gap-3 md:col-span-2 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserPlus size={17} />
                  {saving
                    ? "Création..."
                    : "Créer utilisateur"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* LISTE */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-2 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-white">
                Comptes utilisateurs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Gestion des accès et des responsabilités
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400">
              {users.length} compte
              {users.length > 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-slate-950"
                />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-14 text-center">
              <Users
                size={34}
                className="mx-auto mb-3 text-slate-700"
              />

              <p className="text-sm font-medium text-slate-400">
                Aucun utilisateur
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Créez le premier compte utilisateur.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-slate-800 bg-slate-950/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Utilisateur
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Fonction
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Module
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Accès
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const admin = isAdmin(user.id);

                    const ModuleIcon =
                      user.module &&
                      moduleIcons[user.module]
                        ? moduleIcons[user.module]
                        : Boxes;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-800/70 transition hover:bg-slate-800/30 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                admin
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {admin ? (
                                <Shield size={19} />
                              ) : (
                                <UserRound size={19} />
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-200">
                                {user.nom_complet ||
                                  "Sans nom"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {user.telephone ||
                                  "Téléphone non renseigné"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <BriefcaseBusiness
                              size={15}
                              className="text-slate-600"
                            />

                            {user.fonction || "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {user.module ? (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-300">
                              <ModuleIcon
                                size={14}
                                className="text-blue-400"
                              />
                              {user.module}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-600">
                              Aucun module
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {admin ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                              <Shield size={14} />
                              Administrateur
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400">
                              <UserCheck size={14} />
                              Utilisateur
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {admin ? (
                              <button
                                onClick={() =>
                                  handleRemoveAdmin(
                                    user.id
                                  )
                                }
                                className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-2.5 text-orange-400 transition hover:bg-orange-500/10"
                                title="Retirer les droits administrateur"
                              >
                                <ShieldOff size={17} />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handlePromote(
                                    user.id
                                  )
                                }
                                className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5 text-blue-400 transition hover:bg-blue-500/10"
                                title="Promouvoir administrateur"
                              >
                                <Shield size={17} />
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleDelete(user.id)
                              }
                              className="rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-red-400 transition hover:bg-red-500/10"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* MODULES */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Répartition
            </p>

            <h2 className="mt-1 text-lg font-bold text-white">
              Utilisateurs par module
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {modules.map((item) => {
              const Icon = moduleIcons[item];

              const count = users.filter(
                (user) => user.module === item
              ).length;

              return (
                <div
                  key={item}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Icon
                      size={19}
                      className="text-blue-400"
                    />

                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-400">
                      {count}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-300">
                    {item}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {count === 0
                      ? "Aucun utilisateur"
                      : `${count} utilisateur${
                          count > 1 ? "s" : ""
                        }`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-6 flex flex-col gap-2 border-t border-slate-900 pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LockKeyhole
              size={14}
              className="text-blue-400"
            />

            <span>
              Gestion sécurisée des accès NEXUS
            </span>
          </div>

          <span>
            {adminCount} administrateur
            {adminCount > 1 ? "s" : ""} · {users.length}{" "}
            utilisateur
            {users.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}