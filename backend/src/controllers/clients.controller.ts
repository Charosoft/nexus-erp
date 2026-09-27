import type { Request, Response } from "express";

import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  updateClient,
} from "../services/clients.service.js";

import { supabase } from "../config/supabase.js";

import { getAuthenticatedUserId } from "../utils/auth.js";

/* =========================================================
   ACTIVITÉ
========================================================= */

async function enregistrerActivite(
  userId: string | null,
  action: string,
  description: string
) {
  try {
    const { error } = await supabase
      .from("activites")
      .insert({
        user_id: userId,
        action,
        module: "Clients",
        description,
      });

    if (error) {
      console.error(
        "Erreur enregistrement activité client :",
        error
      );
    }
  } catch (error) {
    console.error(
      "Erreur activité client :",
      error
    );
  }
}

/* =========================================================
   LISTE
========================================================= */

export async function getClientsController(
  _req: Request,
  res: Response
) {
  try {
    const clients = await getClients();

    return res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error(
      "Erreur récupération clients :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les clients.",
    });
  }
}

/* =========================================================
   CLIENT PAR ID
========================================================= */

export async function getClientController(
  req: Request,
  res: Response
) {
  try {
    const idParam = req.params.id;

    if (
      Array.isArray(idParam) ||
      !idParam
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Identifiant client invalide.",
      });
    }

    const client =
      await getClientById(idParam);

    return res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error(
      "Erreur récupération client :",
      error
    );

    return res.status(404).json({
      success: false,
      message: "Client introuvable.",
    });
  }
}

/* =========================================================
   CRÉATION
========================================================= */

export async function createClientController(
  req: Request,
  res: Response
) {
  try {
    const userId =
      await getAuthenticatedUserId(req);

    const client =
      await createClient(req.body);

    await enregistrerActivite(
      userId,
      "Client créé",
      `Nouveau client créé : ${client.name}.`
    );

    return res.status(201).json({
      success: true,
      data: client,
      message:
        "Client créé avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur création client :",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de créer le client.",
    });
  }
}

/* =========================================================
   MODIFICATION
========================================================= */

export async function updateClientController(
  req: Request,
  res: Response
) {
  try {
    const idParam = req.params.id;

    if (
      Array.isArray(idParam) ||
      !idParam
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Identifiant client invalide.",
      });
    }

    const userId =
      await getAuthenticatedUserId(req);

    const ancienClient =
      await getClientById(idParam);

    const client =
      await updateClient(
        idParam,
        req.body
      );

    await enregistrerActivite(
      userId,
      "Client modifié",
      `Client modifié : ${ancienClient.name} → ${client.name}.`
    );

    return res.json({
      success: true,
      data: client,
      message:
        "Client modifié avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur modification client :",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de modifier le client.",
    });
  }
}

/* =========================================================
   SUPPRESSION
========================================================= */

export async function deleteClientController(
  req: Request,
  res: Response
) {
  try {
    const idParam = req.params.id;

    if (
      Array.isArray(idParam) ||
      !idParam
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Identifiant client invalide.",
      });
    }

    const userId =
      await getAuthenticatedUserId(req);

    const client =
      await getClientById(idParam);

    await deleteClient(idParam);

    await enregistrerActivite(
      userId,
      "Client supprimé",
      `Client supprimé : ${client.name}.`
    );

    return res.json({
      success: true,
      message:
        "Client supprimé avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur suppression client :",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de supprimer le client.",
    });
  }
}