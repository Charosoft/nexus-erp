import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
  X,
  RefreshCw,
  Boxes,
  Calculator,
  Truck,
  ShoppingCart,
  Wallet,
  UserRound,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  getAllActivitesAdmin,
  type Activite,
} from "../services/activites.service";

type Membre = {
  id: string;
  nom_complet: string;
  module: string;
  role: string | null;
  description: string | null;
};

const modules = [
  "Stock & Inventaire",
  "Comptabilité",
  "Fournisseurs",
  "Ventes",
  "Trésorerie",
];

const moduleIcons: Record<
  string,
  typeof Boxes
> = {
  "Stock & Inventaire": Boxes,
  Comptabilité: Calculator,
  Fournisseurs: Truck,
  Ventes: ShoppingCart,
  Trésorerie: Wallet,
};

export default function AdminEquipe() {
  const navigate = useNavigate();

  const [membres, setMembres] = useState<Membre[]>([]);
  const [activites, setActivites] = useState<Activite[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingActivites, setLoadingActivites] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [module, setModule] = useState(modules[0]);
  const [role, setRole] = useState("Développeur");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setNom("");
    setModule(modules[0]);
    setRole("Développeur");
    setDescription("");
  };

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from("equipe_membres")
      .select("*")
      .order("module", { ascending: true })
      .order("nom_complet", { ascending: true });

    if (!error && data) {
      setMembres(data);
    }
  };

  const loadActivites = async () => {
    try {
      setLoadingActivites(true);

      const data = await getAllActivitesAdmin();

      setActivites(data);
    } catch (error) {
      console.error(
        "Erreur chargement activités admin :",
        error
      );
    } finally {
      setLoadingActivites(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: admin } = await supabase
        .from("equipe_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      await Promise.all([
        loadMembers(),
        loadActivites(),
      ]);

      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      loadMembers(),
      loadActivites(),
    ]);

    setRefreshing(false);
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!nom.trim()) {
      alert("Le nom du membre est obligatoire.");
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("equipe_membres")
        .update({
          nom_complet: nom.trim(),
          module,
          role: role.trim() || null,
          description: description.trim() || null,
        })
        .eq("id", editingId);

      if (error) {
        alert(`Erreur : ${error.message}`);
      } else {
        resetForm();
        await loadMembers();
      }
    } else {
      const { error } = await supabase
        .from("equipe_membres")
        .insert({
          nom_complet: nom.trim(),
          module,
          role: role.trim() || null,
          description: description.trim() || null,
        });

      if (error) {
        alert(`Erreur : ${error.message}`);
      } else {
        resetForm();
        await loadMembers();
      }
    }

    setSaving(false);
  };

  const handleEdit = (membre: Membre) => {
    setEditingId(membre.id);
    setNom(membre.nom_complet);
    setModule(membre.module);
    setRole(membre.role || "");
    setDescription(membre.description || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce membre ?"
    );

    if (!confirmation) return;

    const { error } = await supabase
      .from("equipe_membres")
      .delete()
      .eq("id", id);

    if (error) {
      alert(`Erreur : ${error.message}`);
      return;
    }

    await loadMembers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-10 w-72 rounded-xl bg-slate-800" />

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-2xl bg-slate-900" />
            <div className="h-28 rounded-2xl bg-slate-900" />
            <div className="h-28 rounded-2xl bg-slate-900" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <div className="h-96 rounded-2xl bg-slate-900" />
            <div className="h-96 rounded-2xl bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl shadow-black/20">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <Shield
              size={28}
              className="text-red-400"
            />
          </div>

          <p className="text-sm font-medium text-red-400">
            Administration
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Accès refusé
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Vous n'avez pas les droits administrateur
            nécessaires pour accéder à cette section.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-7 w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => navigate("/")}
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
            >
              <ArrowLeft size={17} />
              Retour à l'accueil
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Users size={24} />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-blue-400">
                    Administration
                  </p>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Admin
                  </span>
                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  Gestion de l'équipe
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
              Gérez les membres responsables des différents
              modules du projet NEXUS ERP.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
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
              onClick={() =>
                navigate("/admin/utilisateurs")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/20"
            >
              <Shield size={17} />
              Utilisateurs & administrateurs
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
                  Membres de l'équipe
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {membres.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <Boxes size={20} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Modules couverts
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {
                    new Set(
                      membres.map(
                        (membre) => membre.module
                      )
                    ).size
                  }
                  <span className="ml-1 text-sm font-medium text-slate-500">
                    / {modules.length}
                  </span>
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
                  Statut système
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-400">
                  Administration active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/10"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Équipe
                </p>

                <h2 className="mt-1 text-lg font-bold text-white">
                  {editingId
                    ? "Modifier un membre"
                    : "Ajouter un membre"}
                </h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={19} />
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Nom complet
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    value={nom}
                    onChange={(e) =>
                      setNom(e.target.value)
                    }
                    placeholder="Ex. Jean Kabila"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Module
                </label>

                <select
                  value={module}
                  onChange={(e) =>
                    setModule(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                >
                  {modules.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Rôle
                </label>

                <input
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  placeholder="Développeur"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={4}
                  placeholder="Responsabilités du membre..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId ? (
                  <Save size={18} />
                ) : (
                  <Plus size={18} />
                )}

                {saving
                  ? "Enregistrement..."
                  : editingId
                    ? "Enregistrer les modifications"
                    : "Ajouter le membre"}
              </button>
            </div>
          </form>

          {/* MEMBERS */}
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-2 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-white">
                  Membres de l'équipe
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Répartition des responsabilités par module
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400">
                {membres.length} membre
                {membres.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="p-5">
              {membres.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 py-14 text-center">
                  <Users
                    size={32}
                    className="mx-auto mb-3 text-slate-700"
                  />

                  <p className="text-sm font-medium text-slate-400">
                    Aucun membre enregistré
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Ajoutez le premier membre de l'équipe.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {membres.map((membre) => {
                    const ModuleIcon =
                      moduleIcons[membre.module] ||
                      Users;

                    return (
                      <div
                        key={membre.id}
                        className="card-hover group rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10 text-blue-400">
                              <ModuleIcon size={20} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-white">
                                  {membre.nom_complet}
                                </h3>

                                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                                  {membre.module}
                                </span>
                              </div>

                              <p className="mt-1 text-sm font-medium text-slate-400">
                                {membre.role ||
                                  "Aucun rôle"}
                              </p>

                              {membre.description && (
                                <p className="mt-2 max-w-xl text-sm leading-5 text-slate-600">
                                  {membre.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() =>
                                handleEdit(membre)
                              }
                              className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                            >
                              <Edit size={15} />
                              Modifier
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  membre.id
                                )
                              }
                              className="flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                            >
                              <Trash2 size={15} />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ACTIVITÉS UTILISATEURS */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Surveillance
              </p>

              <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-white">
                <Activity size={19} />
                Activités des utilisateurs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Historique global des opérations effectuées
                dans NEXUS.
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400">
              {activites.length} activité
              {activites.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="p-5">
            {loadingActivites ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Chargement des activités...
              </div>
            ) : activites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 py-12 text-center">
                <Activity
                  size={30}
                  className="mx-auto mb-3 text-slate-700"
                />

                <p className="text-sm font-medium text-slate-400">
                  Aucune activité enregistrée
                </p>
              </div>
            ) : (
              <div className="max-h-[520px] divide-y divide-slate-800 overflow-y-auto">
                {activites.map((activite) => (
                  <div
                    key={activite.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <Activity size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">
                            {activite.action}
                          </p>

                          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                            {activite.module}
                          </span>
                        </div>

                        {activite.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {activite.description}
                          </p>
                        )}

                        <p className="mt-2 break-all text-xs text-slate-600">
                          Utilisateur :{" "}
                          {activite.user_id ||
                            "Système"}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-xs text-slate-600">
                      {new Intl.DateTimeFormat(
                        "fr-FR",
                        {
                          dateStyle: "short",
                          timeStyle: "short",
                        }
                      ).format(
                        new Date(
                          activite.created_at
                        )
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* MODULES */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Architecture
            </p>

            <h2 className="mt-1 text-lg font-bold text-white">
              Modules NEXUS
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {modules.map((item) => {
              const Icon =
                moduleIcons[item] || Boxes;

              const count = membres.filter(
                (membre) => membre.module === item
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

                    <span className="text-xs font-semibold text-slate-600">
                      {count}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-300">
                    {item}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {count === 0
                      ? "Aucun membre"
                      : `${count} responsable${
                          count > 1 ? "s" : ""
                        }`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between border-t border-slate-900 pt-5 text-xs text-slate-600">
          <span>NEXUS ERP · Administration</span>
          <span>
            Accès réservé aux administrateurs
          </span>
        </div>
      </div>
    </div>
  );
}