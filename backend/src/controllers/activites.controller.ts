import type { Request, Response } from "express";
import {
  createActivite,
  getActivites,
} from "../services/activites.service.js";

export async function listActivites(
  _req: Request,
  res: Response
) {
  try {
    const activites = await getActivites();

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
      message: "Impossible de récupérer les activités.",
    });
  }
}

export async function addActivite(
  req: Request,
  res: Response
) {
  try {
    const {
      user_id,
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
      user_id,
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