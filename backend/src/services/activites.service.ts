import { supabase } from "../config/supabase.js";

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

export async function createActivite(
  input: CreateActiviteInput
): Promise<Activite> {
  const { data, error } = await supabase
    .from("activites")
    .insert({
      user_id: input.user_id ?? null,
      action: input.action,
      module: input.module,
      description: input.description ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Activite;
}

export async function getActivites(): Promise<Activite[]> {
  const { data, error } = await supabase
    .from("activites")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Activite[];
}