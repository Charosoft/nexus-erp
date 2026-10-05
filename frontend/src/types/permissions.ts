export const MODULES = [
  {
    key: "dashboard",
    label: "Dashboard",
  },
  {
    key: "clients",
    label: "Clients",
  },
  {
    key: "stock",
    label: "Stock & Inventaire",
  },
  {
    key: "ventes",
    label: "Ventes",
  },
  {
    key: "fournisseurs",
    label: "Fournisseurs & Achats",
  },
  {
    key: "comptabilite",
    label: "Comptabilité",
  },
  {
    key: "tresorerie",
    label: "Trésorerie",
  },
] as const;

export type ModuleKey =
  (typeof MODULES)[number]["key"];

export type UserPermissions = {
  user_id: string;
  modules: ModuleKey[];
};