import { supabase } from "../config/supabase.js";

export const getProducts = async () => {
  const { data, error } = await supabase
    .from("produits")
    .select(`
      id,
      reference,
      name,
      description,
      unit_price,
      purchase_price,
      alert_threshold,
      is_active,
      categories_produits (
        id,
        name
      ),
      stocks (
        quantity,
        updated_at
      )
    `)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getStockAlerts = async () => {
  const products = await getProducts();

  return products.filter((product) => {
    const stock = Array.isArray(product.stocks)
      ? product.stocks[0]
      : product.stocks;

    return stock && stock.quantity <= product.alert_threshold;
  });
};