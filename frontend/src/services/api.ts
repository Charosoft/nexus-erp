import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

async function getHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    "Content-Type": "application/json",
    ...(session?.access_token
      ? {
          Authorization: `Bearer ${session.access_token}`,
        }
      : {}),
  };
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        headers: await getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Erreur API : ${response.status}`
      );
    }

    return data;
  },

  async post<T>(
    endpoint: string,
    body: unknown
  ): Promise<T> {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Erreur API : ${response.status}`
      );
    }

    return data;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: "DELETE",
        headers: await getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Erreur API : ${response.status}`
      );
    }

    return data;
  },
};