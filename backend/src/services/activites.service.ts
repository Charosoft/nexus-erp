import { supabase } from "../config/supabase.js";

/* =========================================================
   TYPES
========================================================= */

export type Activite = {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  description: string | null;
  created_at: string;
};

export type CreateActiviteInput = {
  user_id?: string | null;
  action: string;
  module: string;
  description?: string | null;
};

/* =========================================================
   CRÉER UNE ACTIVITÉ
========================================================= */

export async function createActivite(
  input: CreateActiviteInput
): Promise<Activite> {
  const { data, error } = await supabase
    .from("activites")
    .insert({
      user_id: input.user_id ?? null,
      action: input.action,
      module: input.module,
      description:
        input.description ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Activite;
}

/* =========================================================
   RÉCUPÉRER LES ACTIVITÉS
========================================================= */

export async function getActivites(
  userId?: string
): Promise<Activite[]> {
  let query = supabase
    .from("activites")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(200);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } =
    await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Activite[];
}