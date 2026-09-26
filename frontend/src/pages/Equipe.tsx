import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Users, Package, ShoppingCart, Truck, Wallet, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type TeamMember = {
  id: string;
  nom_complet: string;
  module: string;
  role: string | null;
  description: string | null;
};

const moduleIcons: Record<string, React.ElementType> = {
  "Stock & Inventaire": Package,
  Ventes: ShoppingCart,
  Fournisseurs: Truck,
  Trésorerie: Wallet,
  Comptabilité: Calculator,
};

export default function Equipe() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    const { data } = await supabase
      .from("equipe_membres")
      .select("id, nom_complet, module, role, description")
      .order("module")
      .order("nom_complet");

    setMembers(data ?? []);
    setLoading(false);
  }

  const grouped = useMemo(() => {
    return members.reduce<Record<string, TeamMember[]>>((acc, member) => {
      if (!acc[member.module]) {
        acc[member.module] = [];
      }

      acc[member.module].push(member);
      return acc;
    }, {});
  }, [members]);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-10"
        >
          <ArrowLeft size={18} />
          Retour à l'accueil
        </Link>

        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Users size={28} />
          </div>

          <p className="text-sm font-semibold tracking-widest text-blue-400 mb-3">
            ÉQUIPE NEXUS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mb-5">
            Les équipes derrière NEXUS
          </h1>

          <p className="text-slate-400 text-lg leading-8">
            Découvrez les équipes responsables des différents domaines
            fonctionnels de la plateforme NEXUS.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">
            Chargement de l'équipe...
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            Aucun membre n'est actuellement enregistré.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(grouped).map(([module, moduleMembers]) => {
              const Icon = moduleIcons[module] ?? Users;

              return (
                <div
                  key={module}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:border-white/20 transition"
                >
                  <div className="flex items-center gap-4 mb-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Icon size={23} />
                    </div>

                    <div>
                      <h2 className="font-bold text-lg">{module}</h2>
                      <p className="text-sm text-slate-500">
                        {moduleMembers.length} membre
                        {moduleMembers.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {moduleMembers.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <p className="font-semibold text-white">
                          {member.nom_complet}
                        </p>

                        {member.role && (
                          <p className="text-sm text-blue-400 mt-1">
                            {member.role}
                          </p>
                        )}

                        {member.description && (
                          <p className="text-sm text-slate-500 mt-2">
                            {member.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}