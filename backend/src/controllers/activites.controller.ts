import type { Request, Response } from "express";

import {
  createActivite,
  getActivites,
} from "../services/activites.service.js";

import { supabase } from "../config/supabase.js";

async function getUserId(req: Request) {
  const authorization =
    req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace(
    "Bearer ",
    ""
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function listActivites(
  req: Request,
  res: Response
) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié.",
      });
    }

    const activites =
      await getActivites(userId);

    return res.json({
      success: true,
      data: activites,
    });
  } catch (error) {
    console.error(
      "Erreur récupération activités :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les activités.",
    });
  }
}

export async function addActivite(
  req: Request,
  res: Response
) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié.",
      });
    }

    const {
      action,
      module,
      description,
    } = req.body;

    if (!action || !module) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs action et module sont obligatoires.",
      });
    }

    const activite = await createActivite({
      user_id: userId,
      action,
      module,
      description,
    });

    return res.status(201).json({
      success: true,
      data: activite,
    });
  } catch (error) {
    console.error(
      "Erreur création activité :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible d'enregistrer l'activité.",
    });
  }
}