import { supabase } from "../config/supabase.js";

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

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Client[];
}

export async function getClientById(
  id: string
): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Client;
}

export async function createClient(
  input: CreateClientInput
): Promise<Client> {
  const name = input.name.trim();

  if (!name) {
    throw new Error(
      "Le nom du client est obligatoire."
    );
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Client;
}

export async function updateClient(
  id: string,
  input: UpdateClientInput
): Promise<Client> {
  const name = input.name.trim();

  if (!name) {
    throw new Error(
      "Le nom du client est obligatoire."
    );
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      name,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Client;
}

export async function deleteClient(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}