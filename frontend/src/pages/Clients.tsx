import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
  type Client,
  type CreateClientInput,
} from "../services/clients.service";

const emptyForm: CreateClientInput = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] =
    useState<Client | null>(null);

  const [form, setForm] =
    useState<CreateClientInput>(emptyForm);

  async function chargerClients() {
    try {
      setLoading(true);
      setError("");

      const data = await getClients();

      setClients(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les clients."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    chargerClients();
  }, []);

  const clientsFiltres = useMemo(() => {
    const terme = search.trim().toLowerCase();

    if (!terme) {
      return clients;
    }

    return clients.filter((client) =>
      [
        client.name,
        client.email,
        client.phone,
        client.address,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(terme)
        )
    );
  }, [clients, search]);

  function ouvrirAjout() {
    setEditingClient(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function ouvrirEdition(client: Client) {
    setEditingClient(client);

    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function fermerModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingClient(null);
    setForm(emptyForm);
  }

  function handleChange(
    field: keyof CreateClientInput,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Le nom du client est obligatoire."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingClient) {
        const updated = await updateClient(
          editingClient.id,
          form
        );

        setClients((current) =>
          current.map((client) =>
            client.id === updated.id
              ? updated
              : client
          )
        );

        setSuccess(
          "Client modifié avec succès."
        );
      } else {
        const created = await createClient(form);

        setClients((current) => [
          created,
          ...current,
        ]);

        setSuccess(
          "Client ajouté avec succès."
        );
      }

      setTimeout(() => {
        setShowModal(false);
        setEditingClient(null);
        setForm(emptyForm);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le client "${client.name}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteClient(client.id);

      setClients((current) =>
        current.filter(
          (item) => item.id !== client.id
        )
      );

      setSuccess(
        "Client supprimé avec succès."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le client."
      );
    }
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                Clients
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Gestion des clients de NEXUS.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={chargerClients}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
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
            type="button"
            onClick={ouvrirAjout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus size={18} />

            Nouveau client
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total clients
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {clients.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Résultats affichés
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {clientsFiltres.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Search size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher un client..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <RefreshCw
            size={24}
            className="mx-auto animate-spin text-blue-400"
          />

          <p className="mt-4 text-sm text-slate-500">
            Chargement des clients...
          </p>
        </div>
      ) : clientsFiltres.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-500">
            <UserRound size={28} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            {search
              ? "Aucun client trouvé"
              : "Aucun client"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {search
              ? "Essayez avec un autre terme de recherche."
              : "Ajoutez votre premier client pour commencer."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={ouvrirAjout}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Plus size={18} />
              Ajouter un client
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/10">
          <div className="divide-y divide-slate-800/80">
            {clientsFiltres.map((client) => (
              <div
                key={client.id}
                className="group flex flex-col gap-5 p-5 transition hover:bg-white/[0.025] md:flex-row md:items-center md:px-6"
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <UserRound size={21} />
                </div>

                {/* Informations */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-white">
                      {client.name}
                    </h3>
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-5">
                    {client.email && (
                      <span className="inline-flex items-center gap-2">
                        <Mail size={14} />
                        {client.email}
                      </span>
                    )}

                    {client.phone && (
                      <span className="inline-flex items-center gap-2">
                        <Phone size={14} />
                        {client.phone}
                      </span>
                    )}

                    {client.address && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={14} />
                        {client.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      ouvrirEdition(client)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <Edit3 size={16} />
                    <span className="hidden sm:inline">
                      Modifier
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(client)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">
                      Supprimer
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingClient
                    ? "Modifier le client"
                    : "Nouveau client"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Informations du client
                </p>
              </div>

              <button
                type="button"
                onClick={fermerModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* Formulaire */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Nom du client *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Ex. Société ABC"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                  autoFocus
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="contact@entreprise.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Téléphone
                  </label>

                  <input
                    type="tel"
                    value={form.phone ?? ""}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="+243 ..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Adresse
                </label>

                <textarea
                  value={form.address ?? ""}
                  onChange={(event) =>
                    handleChange(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Adresse du client"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>

              {/* Actions formulaire */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={fermerModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingClient
                    ? "Enregistrer"
                    : "Ajouter le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}