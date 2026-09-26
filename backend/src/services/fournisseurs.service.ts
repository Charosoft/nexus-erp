import { supabase } from "../config/supabase.js";

export const getSuppliers = async () => {
  const { data, error } = await supabase
    .from("fournisseurs")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

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
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createPurchase = async (
  supplierId: string,
  productId: string,
  quantity: number,
  unitPrice: number,
  treasuryAccountId: string
) => {
  const { data, error } = await supabase.rpc("create_purchase", {
    p_supplier_id: supplierId,
    p_product_id: productId,
    p_quantity: quantity,
    p_unit_price: unitPrice,
    p_treasury_account_id: treasuryAccountId,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Enregistrement de l'activité après un achat réussi.
  try {
    await supabase.from("activites").insert({
      user_id: null,
      action: "Achat créé",
      module: "Fournisseurs",
      description: `Achat enregistré : ${quantity} unité(s) du produit ${productId} pour un montant de ${unitPrice * quantity} USD.`,
    });
  } catch (activityError) {
    console.error(
      "Erreur enregistrement activité achat :",
      activityError
    );
  }

  return data;
};