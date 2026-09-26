import { api } from "./api";

export type Activite = {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  description: string | null;
  created_at: string;
};

export async function getActivites(): Promise<Activite[]> {
  return api.get<Activite[]>("/activites");
}