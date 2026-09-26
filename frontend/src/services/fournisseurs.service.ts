import { api } from "./api";

import type {
  Fournisseur,
  Achat,
  PurchaseForm,
  PurchaseResponse,
} from "../types/fournisseurs";

export const getFournisseurs = async (): Promise<Fournisseur[]> => {
  const response = await api.get<{ data: Fournisseur[] }>(
    "/fournisseurs"
  );

  return response.data;
};

export const getAchats = async (): Promise<Achat[]> => {
  const response = await api.get<{ data: Achat[] }>(
    "/fournisseurs/achats"
  );

  return response.data;
};

export const createPurchase = async (
  purchase: PurchaseForm
): Promise<PurchaseResponse> => {
  try {
    const data = await api.post<PurchaseResponse>(
      "/fournisseurs/purchases",
      purchase
    );

    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Impossible de créer l'achat"
    );
  }
};