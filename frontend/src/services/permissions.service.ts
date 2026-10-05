import { supabase } from "../lib/supabase";
import type { ModuleKey } from "../types/permissions";

type ProfilModuleRow = {
  module: string;
};

const validModules: ModuleKey[] = [
  "dashboard",
  "clients",
  "stock",
  "ventes",
  "fournisseurs",
  "comptabilite",
  "tresorerie",
];

export async function getMyModules(): Promise<ModuleKey[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      userError.message
    );
  }

  if (!user) {
    return [];
  }

  const { data, error } =
    await supabase
      .from("profil_modules")
      .select("module")
      .eq("user_id", user.id);

  if (error) {
    throw new Error(
      error.message
    );
  }

  return (data ?? [])
    .map(
      (item: ProfilModuleRow) =>
        item.module as ModuleKey
    )
    .filter((module) =>
      validModules.includes(module)
    );
}

export async function hasModuleAccess(
  module: ModuleKey
): Promise<boolean> {
  const modules =
    await getMyModules();

  return modules.includes(module);
}