import { api } from "./api";

import type {
  Fournisseur,
  Achat,
  PurchaseForm,
  PurchaseResponse,
} from "../types/fournisseurs";

/* =========================================================
   TYPES CRUD FOURNISSEURS
========================================================= */

export type CreateFournisseurInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type UpdateFournisseurInput =
  CreateFournisseurInput;

type FournisseurResponse = {
  success: boolean;
  data: Fournisseur;
  message?: string;
};

/* =========================================================
   FOURNISSEURS
========================================================= */

export const getFournisseurs = async (): Promise<
  Fournisseur[]
> => {
  const response =
    await api.get<{ data: Fournisseur[] }>(
      "/fournisseurs"
    );

  return response.data;
};

export const getFournisseur = async (
  id: string
): Promise<Fournisseur> => {
  const response =
    await api.get<FournisseurResponse>(
      `/fournisseurs/${id}`
    );

  return response.data;
};

export const createFournisseur = async (
  input: CreateFournisseurInput
): Promise<Fournisseur> => {
  const response =
    await api.post<FournisseurResponse>(
      "/fournisseurs",
      input
    );

  return response.data;
};

export const updateFournisseur = async (
  id: string,
  input: UpdateFournisseurInput
): Promise<Fournisseur> => {
  const response =
    await api.put<FournisseurResponse>(
      `/fournisseurs/${id}`,
      input
    );

  return response.data;
};

export const deleteFournisseur = async (
  id: string
): Promise<void> => {
  await api.delete(`/fournisseurs/${id}`);
};

/* =========================================================
   ACHATS — EXISTANT
   Ne pas supprimer cette partie.
========================================================= */

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
    const data =
      await api.post<PurchaseResponse>(
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