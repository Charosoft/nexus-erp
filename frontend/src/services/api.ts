const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status}`);
    }

    return response.json();
  },

  async post<T>(
    endpoint: string,
    body: unknown
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

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
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
    });

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