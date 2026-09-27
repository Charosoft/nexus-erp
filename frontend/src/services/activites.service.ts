import { api } from "./api";

export type Activite = {
  id: string;
  user_id: string | null;
  user_name?: string | null;
  action: string;
  module: string;
  description: string | null;
  created_at: string;
};

type ActivitesResponse = {
  success: boolean;
  data: Activite[];
  message?: string;
};

/* =========================================================
   ACTIVITÉS DE L'UTILISATEUR CONNECTÉ
========================================================= */

export async function getActivites(): Promise<
  Activite[]
> {
  const response =
    await api.get<ActivitesResponse>(
      "/activites"
    );

  return response.data;
}

/* =========================================================
   ACTIVITÉS ADMIN
========================================================= */

export async function getAllActivitesAdmin(): Promise<
  Activite[]
> {
  const response =
    await api.get<ActivitesResponse>(
      "/admin/activites"
    );

  return response.data;
}