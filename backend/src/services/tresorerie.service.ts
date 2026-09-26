import { supabase } from "../config/supabase.js";

export const getTreasuryAccounts = async () => {
  const { data, error } = await supabase
    .from("comptes_tresorerie")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTreasuryMovements = async () => {
  const { data, error } = await supabase
    .from("mouvements_tresorerie")
    .select(`
      id,
      type,
      amount,
      reference,
      description,
      payment_method,
      source_type,
      source_id,
      created_at,
      comptes_tresorerie (
        id,
        name,
        type,
        currency
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};