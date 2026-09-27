import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

async function getHeaders(
  includeJson = false
): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (session?.access_token) {
    headers.Authorization =
      `Bearer ${session.access_token}`;
  }

  return headers;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        headers: await getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur API : ${response.status}`
      );
    }

    return response.json();
  },

  async post<T>(
    endpoint: string,
    body: unknown
  ): Promise<T> {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: "POST",
        headers: await getHeaders(true),
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

  async put<T>(
    endpoint: string,
    body: unknown
  ): Promise<T> {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: "PUT",
        headers: await getHeaders(true),
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

  async delete<T>(
    endpoint: string
  ): Promise<T> {
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