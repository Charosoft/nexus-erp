import { api } from "./api";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateClientInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type UpdateClientInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

type ClientsResponse = {
  success: boolean;
  data: Client[];
  message?: string;
};

type ClientResponse = {
  success: boolean;
  data: Client;
  message?: string;
};

type DeleteClientResponse = {
  success: boolean;
  message?: string;
};

export async function getClients(): Promise<Client[]> {
  const response =
    await api.get<ClientsResponse>("/clients");

  return response.data;
}

export async function getClient(
  id: string
): Promise<Client> {
  const response =
    await api.get<ClientResponse>(
      `/clients/${id}`
    );

  return response.data;
}

export async function createClient(
  input: CreateClientInput
): Promise<Client> {
  const response =
    await api.post<ClientResponse>(
      "/clients",
      input
    );

  return response.data;
}

export async function updateClient(
  id: string,
  input: UpdateClientInput
): Promise<Client> {
  const response =
    await api.put<ClientResponse>(
      `/clients/${id}`,
      input
    );

  return response.data;
}

export async function deleteClient(
  id: string
): Promise<void> {
  await api.delete<DeleteClientResponse>(
    `/clients/${id}`
  );
}