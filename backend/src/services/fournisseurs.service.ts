import { supabase } from "../config/supabase.js";

/* =========================================================
   TYPES
========================================================= */

export type Fournisseur = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateFournisseurInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type UpdateFournisseurInput =
  CreateFournisseurInput;

/* =========================================================
   FOURNISSEURS
========================================================= */

export const getSuppliers = async (): Promise<
  Fournisseur[]
> => {
  const { data, error } = await supabase
    .from("fournisseurs")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Fournisseur[];
};

/* =========================================================
   FOURNISSEUR PAR ID
========================================================= */

export const getFournisseurById = async (
  id: string
): Promise<Fournisseur> => {
  const { data, error } = await supabase
    .from("fournisseurs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Fournisseur;
};

/* =========================================================
   CRÉER FOURNISSEUR
========================================================= */

export const createFournisseur = async (
  input: CreateFournisseurInput
): Promise<Fournisseur> => {
  const name = input.name.trim();

  if (!name) {
    throw new Error(
      "Le nom du fournisseur est obligatoire."
    );
  }

  /* Vérification doublon */
  const {
    data: existing,
    error: duplicateError,
  } = await supabase
    .from("fournisseurs")
    .select("id, name")
    .ilike("name", name)
    .limit(1);

  if (duplicateError) {
    throw new Error(
      duplicateError.message
    );
  }

  if (existing && existing.length > 0) {
    throw new Error(
      `Le fournisseur "${name}" existe déjà.`
    );
  }

  const { data, error } = await supabase
    .from("fournisseurs")
    .insert({
      name,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Fournisseur;
};

/* =========================================================
   MODIFIER FOURNISSEUR
========================================================= */

export const updateFournisseur = async (
  id: string,
  input: UpdateFournisseurInput
): Promise<Fournisseur> => {
  const name = input.name.trim();

  if (!name) {
    throw new Error(
      "Le nom du fournisseur est obligatoire."
    );
  }

  /* Vérification doublon */
  const {
    data: existing,
    error: duplicateError,
  } = await supabase
    .from("fournisseurs")
    .select("id, name")
    .ilike("name", name)
    .neq("id", id)
    .limit(1);

  if (duplicateError) {
    throw new Error(
      duplicateError.message
    );
  }

  if (existing && existing.length > 0) {
    throw new Error(
      `Le fournisseur "${name}" existe déjà.`
    );
  }

  const { data, error } = await supabase
    .from("fournisseurs")
    .update({
      name,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Fournisseur;
};

/* =========================================================
   SUPPRIMER FOURNISSEUR
========================================================= */

export const deleteFournisseur = async (
  id: string
): Promise<void> => {
  const { error } = await supabase
    .from("fournisseurs")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   ACHATS
========================================================= */

export const getPurchases = async () => {
  const { data, error } = await supabase
    .from("achats")
    .select(`
      id,
      supplier_id,
      reference,
      status,
      total_amount,
      created_at,
      fournisseurs (
        id,
        name,
        email,
        phone
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/* =========================================================
   CRÉER ACHAT
========================================================= */

export const createPurchase = async (
  supplierId: string,
  productId: string,
  quantity: number,
  unitPrice: number,
  treasuryAccountId: string,
  userId?: string | null
) => {
  /*
   * Récupération du produit avant l'achat.
   * Cela permet d'enregistrer une activité lisible.
   */
  const {
    data: product,
    error: productError,
  } = await supabase
    .from("produits")
    .select("id, reference, name")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    throw new Error(
      "Produit introuvable pour cet achat."
    );
  }

  /*
   * Création de l'achat.
   * Le RPC existant reste inchangé.
   */
  const { data, error } =
    await supabase.rpc(
      "create_purchase",
      {
        p_supplier_id: supplierId,
        p_product_id: productId,
        p_quantity: quantity,
        p_unit_price: unitPrice,
        p_treasury_account_id:
          treasuryAccountId,
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  /*
   * Activité achat lisible.
   */
  try {
    await supabase.from("activites").insert({
      user_id: userId ?? null,
      action: "Achat créé",
      module: "Fournisseurs",
      description:
        `Achat enregistré : ${quantity} × ${product.name} ` +
        `(${product.reference}) pour un montant de ` +
        `${unitPrice * quantity} USD.`,
    });
  } catch (activityError) {
    console.error(
      "Erreur enregistrement activité achat :",
      activityError
    );
  }

  return data;
};