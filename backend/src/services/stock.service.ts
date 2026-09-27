import { supabase } from "../config/supabase.js";

export type CreateProductInput = {
  reference: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  unitPrice: number;
  purchasePrice: number;
  alertThreshold: number;
  initialQuantity: number;
};

export type UpdateProductInput = {
  reference: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  unitPrice: number;
  purchasePrice: number;
  alertThreshold: number;
};

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
      category_id,
      categories_produits (
        id,
        name
      ),
      stocks (
        quantity,
        updated_at
      )
    `)
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((product) => {
    const stock = Array.isArray(product.stocks)
      ? product.stocks[0]
      : product.stocks;

    return {
      ...product,
      stocks: stock ?? {
        quantity: 0,
        updated_at: null,
      },
    };
  });
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories_produits")
    .select("id, name, description")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createProduct = async (
  input: CreateProductInput
) => {
  if (input.initialQuantity < 0) {
    throw new Error(
      "La quantité initiale ne peut pas être négative."
    );
  }

  const { data: existingProduct } = await supabase
    .from("produits")
    .select("id, is_active")
    .eq("reference", input.reference)
    .maybeSingle();

  if (existingProduct) {
    throw new Error(
      "Cette référence produit existe déjà."
    );
  }

  const { data: product, error: productError } =
    await supabase
      .from("produits")
      .insert({
        category_id: input.categoryId || null,
        reference: input.reference,
        name: input.name,
        description: input.description || null,
        unit_price: input.unitPrice,
        purchase_price: input.purchasePrice,
        alert_threshold: input.alertThreshold,
        is_active: true,
      })
      .select("id")
      .single();

  if (productError) {
    throw new Error(productError.message);
  }

  const { error: stockError } = await supabase
    .from("stocks")
    .insert({
      product_id: product.id,
      quantity: input.initialQuantity,
    });

  if (stockError) {
    await supabase
      .from("produits")
      .delete()
      .eq("id", product.id);

    throw new Error(stockError.message);
  }

  return product;
};

export const updateProduct = async (
  productId: string,
  input: UpdateProductInput
) => {
  const { data: duplicate } = await supabase
    .from("produits")
    .select("id")
    .eq("reference", input.reference)
    .neq("id", productId)
    .maybeSingle();

  if (duplicate) {
    throw new Error(
      "Cette référence produit est déjà utilisée."
    );
  }

  const { data, error } = await supabase
    .from("produits")
    .update({
      category_id: input.categoryId || null,
      reference: input.reference,
      name: input.name,
      description: input.description || null,
      unit_price: input.unitPrice,
      purchase_price: input.purchasePrice,
      alert_threshold: input.alertThreshold,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deactivateProduct = async (
  productId: string
) => {
  const { data, error } = await supabase
    .from("produits")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getStockAlerts = async () => {
  const products = await getProducts();

  return products.filter((product) => {
    return (
      product.stocks &&
      product.stocks.quantity <= product.alert_threshold
    );
  });
};