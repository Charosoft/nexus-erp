import { supabase } from "../config/supabase.js";

export const getAccountingAccounts = async () => {
  const { data, error } = await supabase
    .from("comptes_comptables")
    .select("*")
    .order("code");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getAccountingEntries = async () => {
  const { data, error } = await supabase
    .from("ecritures_comptables")
    .select(`
      id,
      reference,
      date_ecriture,
      description,
      source_type,
      source_id,
      journaux (
        id,
        code,
        name,
        type
      ),
      lignes_ecriture (
        id,
        description,
        debit,
        credit,
        comptes_comptables (
          id,
          code,
          name,
          type
        )
      )
    `)
    .order("date_ecriture", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};