import { supabase } from "../config/supabase.js";

export const getClients = async () => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

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

  if (error) {
    throw new Error(error.message);
  }

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
  /*
   * 1. Récupération du produit
   *    avant de créer l'activité.
   */
  const { data: product, error: productError } =
    await supabase
      .from("produits")
      .select("id, reference, name")
      .eq("id", productId)
      .single();

  if (productError || !product) {
    throw new Error(
      "Produit introuvable pour cette vente."
    );
  }

  /*
   * 2. Création de la vente intégrée.
   *    On conserve exactement le RPC existant.
   */
  const { data, error } = await supabase.rpc(
    "create_sale",
    {
      p_client_id: clientId,
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
   * 3. Enregistrement de l'activité
   *    avec le nom et la référence du produit.
   */
  try {
    await supabase.from("activites").insert({
      user_id: userId ?? null,
      action: "Vente créée",
      module: "Ventes",
      description:
        `Vente enregistrée : ${quantity} × ${product.name} ` +
        `(${product.reference}) pour un montant de ` +
        `${unitPrice * quantity} USD.`,
    });
  } catch (activityError) {
    console.error(
      "Erreur enregistrement activité vente :",
      activityError
    );
  }

  return data;
};