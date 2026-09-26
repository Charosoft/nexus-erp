import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Mail,
  MessageCircle,
  Network,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const WHATSAPP_NUMBER = "243817803512";

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [fonction, setFonction] = useState("");
  const [message, setMessage] = useState("");

  const buildWhatsAppUrl = () => {
    const text = `
Bonjour, je souhaite demander un compte d'accès à NEXUS.

Nom complet : ${nom || "Non renseigné"}
Email : ${email || "Non renseigné"}
Téléphone : ${telephone || "Non renseigné"}
Fonction : ${fonction || "Non renseignée"}

Message :
${message || "Je souhaite obtenir un accès à la plateforme NEXUS."}
`.trim();

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      text
    )}`;
  };

  const handleSubmit = (
  event: FormEvent<HTMLFormElement>
) => {
    event.preventDefault();

    window.open(
      buildWhatsAppUrl(),
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-10 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute bottom-[-12rem] left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Retour */}
        <Link
          to="/login"
          className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour à la connexion
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Network size={27} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Accès NEXUS
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Demander un compte
            </h1>

            <p className="mt-3 leading-7 text-slate-400">
              Remplissez ce formulaire. Votre demande sera transmise
              à l'administrateur, qui pourra créer votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom */}
            <div>
              <label
                htmlFor="nom"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Nom complet *
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(event) => setNom(event.target.value)}
                  placeholder="Votre nom complet"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 pl-11 text-sm text-white caret-blue-400 outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Email / téléphone */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  E-mail *
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="votre@email.com"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 pl-11 text-sm text-white caret-blue-400 outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="telephone"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Téléphone
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="telephone"
                    type="tel"
                    value={telephone}
                    onChange={(event) =>
                      setTelephone(event.target.value)
                    }
                    placeholder="+243..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 pl-11 text-sm text-white caret-blue-400 outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Fonction */}
            <div>
              <label
                htmlFor="fonction"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Fonction
              </label>

              <div className="relative">
                <BriefcaseBusiness
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="fonction"
                  type="text"
                  value={fonction}
                  onChange={(event) =>
                    setFonction(event.target.value)
                  }
                  placeholder="Ex. Comptable, vendeur, responsable..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 pl-11 text-sm text-white caret-blue-400 outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Message
              </label>

              <textarea
                id="message"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Expliquez brièvement pourquoi vous souhaitez accéder à NEXUS..."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white caret-blue-400 outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-500"
            >
              <MessageCircle size={20} />
              Envoyer la demande sur WhatsApp
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-blue-400"
              />

              <div>
                <p className="text-sm font-semibold text-slate-300">
                  Pourquoi cette procédure ?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Les comptes NEXUS sont créés par l'administration
                  afin de contrôler les accès aux différents modules
                  de l'ERP.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
            <Network size={13} />
            NEXUS — Mini-ERP intégré
          </div>
        </div>
      </div>
    </main>
  );
}