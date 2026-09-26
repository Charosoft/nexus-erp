import { supabase } from "../config/supabase.js";

export const getClients = async () => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);

  return data;
};

export const getInvoices = async () => {
  const { data, error } = await supabase
    .from("factures_vente")
    .select(`
      id,
      reference,
      status,
      total_amount,
      due_date,
      created_at,
      clients (
        id,
        name,
        email,
        phone
      ),
      factures_vente_lignes (
        id,
        product_id,
        quantity,
        unit_price,
        total,
        produits (
          id,
          reference,
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data;
};

export const createSale = async (
  clientId: string,
  productId: string,
  quantity: number,
  unitPrice: number,
  treasuryAccountId: string,
  userId?: string | null
) => {
  const { data, error } = await supabase.rpc("create_sale", {
    p_client_id: clientId,
    p_product_id: productId,
    p_quantity: quantity,
    p_unit_price: unitPrice,
    p_treasury_account_id: treasuryAccountId,
  });

  if (error) throw new Error(error.message);

  try {
    await supabase.from("activites").insert({
      user_id: userId ?? null,
      action: "Vente créée",
      module: "Ventes",
      description: `Vente enregistrée : ${quantity} unité(s) du produit ${productId} pour un montant de ${unitPrice * quantity} USD.`,
    });
  } catch (activityError) {
    console.error(
      "Erreur enregistrement activité vente :",
      activityError
    );
  }

  return data;
};