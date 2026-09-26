import { api } from "./api";

import type {
  Client,
  SaleForm,
  SaleResponse,
  TreasuryAccount,
} from "../types/ventes";

import type { Product } from "../types/dashboard";

const uniqueByName = <T extends { name: string }>(
  items: T[]
): T[] => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.name.trim().toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const getClients = async (): Promise<Client[]> => {
  const response = await api.get<{ data: Client[] }>(
    "/ventes/clients"
  );

  return uniqueByName(response.data);
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<{ data: Product[] }>(
    "/stock/products"
  );

  return response.data;
};

export const getTreasuryAccounts = async (): Promise<
  TreasuryAccount[]
> => {
  const response = await api.get<{ data: TreasuryAccount[] }>(
    "/tresorerie/accounts"
  );

  return uniqueByName(response.data);
};

export const createSale = async (
  sale: SaleForm
): Promise<SaleResponse> => {
  try {
    const data = await api.post<SaleResponse>(
      "/ventes/sales",
      sale
    );

    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Impossible de créer la vente"
    );
  }
};