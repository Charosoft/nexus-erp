import type { Request, Response } from "express";

import {
  createActivite,
  getActivites,
} from "../services/activites.service.js";

import { supabase } from "../config/supabase.js";

/* =========================================================
   AUTHENTIFICATION
========================================================= */

async function getUserId(
  req: Request
): Promise<string | null> {
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

/* =========================================================
   ENRICHIR LES ACTIVITÉS
========================================================= */

async function enrichirActivites(
  activites: Awaited<ReturnType<typeof getActivites>>
) {
  const userIds = [
    ...new Set(
      activites
        .map((activite) => activite.user_id)
        .filter(
          (userId): userId is string =>
            Boolean(userId)
        )
    ),
  ];

  if (userIds.length === 0) {
    return activites.map((activite) => ({
      ...activite,
      user_name: "Utilisateur",
    }));
  }

  const { data: profils, error } =
    await supabase
      .from("profils")
      .select("id, nom_complet")
      .in("id", userIds);

  if (error) {
    console.error(
      "Erreur récupération profils :",
      error
    );

    return activites.map((activite) => ({
      ...activite,
      user_name: "Utilisateur",
    }));
  }

  const profilsMap = new Map(
    (profils ?? []).map((profil) => [
      profil.id,
      profil.nom_complet,
    ])
  );

  return activites.map((activite) => ({
    ...activite,
    user_name:
      (activite.user_id
        ? profilsMap.get(activite.user_id)
        : null) ??
      "Utilisateur",
  }));
}

/* =========================================================
   LISTE DES ACTIVITÉS UTILISATEUR
========================================================= */

export async function listActivites(
  req: Request,
  res: Response
) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Utilisateur non authentifié.",
      });
    }

    const activites =
      await getActivites(userId);

    const activitesEnrichies =
      await enrichirActivites(activites);

    return res.json({
      success: true,
      data: activitesEnrichies,
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

/* =========================================================
   CRÉER UNE ACTIVITÉ
========================================================= */

export async function addActivite(
  req: Request,
  res: Response
) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Utilisateur non authentifié.",
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

    const activite =
      await createActivite({
        user_id: userId,
        action,
        module,
        description,
      });

    return res.status(201).json({
      success: true,
      data: {
        ...activite,
        user_name: "Utilisateur",
      },
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