import { useEffect, useState } from "react";
import { Save, UserCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

type ProfileData = {
  id: string;
  nom_complet: string;
  telephone: string;
  fonction: string;
  module: string;
};

export default function Profil() {
  const [profile, setProfile] = useState<ProfileData>({
    id: "",
    nom_complet: "",
    telephone: "",
    fonction: "",
    module: "",
  });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setEmail(user.email ?? "");

    const { data } = await supabase
      .from("profils")
      .select("id, nom_complet, telephone, fonction, module")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }

    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profils")
      .upsert({
        id: user.id,
        nom_complet: profile.nom_complet,
        telephone: profile.telephone,
        fonction: profile.fonction,
        module: profile.module,
      });

    if (error) {
      setMessage("Impossible d'enregistrer les informations.");
    } else {
      setMessage("Profil mis à jour avec succès.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-400">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <UserCircle size={25} />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Mon profil</h1>
            <p className="text-slate-400">
              Gérez vos informations personnelles.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Nom complet
            </label>

            <input
              value={profile.nom_complet}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  nom_complet: e.target.value,
                })
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Email
            </label>

            <input
              value={email}
              disabled
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Téléphone
            </label>

            <input
              value={profile.telephone}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  telephone: e.target.value,
                })
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="+243..."
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Fonction
            </label>

            <input
              value={profile.fonction}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  fonction: e.target.value,
                })
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Ex. Comptable"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Module
            </label>

            <input
              value={profile.module}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  module: e.target.value,
                })
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Ex. Comptabilité"
            />
          </div>
        </div>

        {message && (
          <p className="mt-5 text-sm text-blue-400">
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}