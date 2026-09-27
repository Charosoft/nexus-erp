import type { Request, Response } from "express";

import {
  createFournisseur,
  createPurchase,
  deleteFournisseur,
  getFournisseurById,
  getPurchases,
  getSuppliers,
  updateFournisseur,
} from "../services/fournisseurs.service.js";

import { supabase } from "../config/supabase.js";

import { getAuthenticatedUserId } from "../utils/auth.js";

/* =========================================================
   ACTIVITÉS
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
        module: "Fournisseurs",
        description,
      });

    if (error) {
      console.error(
        "Erreur enregistrement activité fournisseur :",
        error
      );
    }
  } catch (error) {
    console.error(
      "Erreur activité fournisseur :",
      error
    );
  }
}

/* =========================================================
   FOURNISSEURS
========================================================= */

export const getFournisseursController = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getSuppliers();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Erreur récupération fournisseurs :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de récupérer les fournisseurs.",
    });
  }
};

/* =========================================================
   FOURNISSEUR PAR ID
========================================================= */

export const getFournisseurController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Identifiant fournisseur invalide.",
      });
    }

    const data =
      await getFournisseurById(id);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Fournisseur introuvable.",
    });
  }
};

/* =========================================================
   CRÉER FOURNISSEUR
========================================================= */

export const createFournisseurController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        await getAuthenticatedUserId(req);

      const data =
        await createFournisseur(req.body);

      await enregistrerActivite(
        userId,
        "Fournisseur créé",
        `Nouveau fournisseur créé : ${data.name}.`
      );

      return res.status(201).json({
        success: true,
        data,
        message:
          "Fournisseur créé avec succès.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Impossible de créer le fournisseur.",
      });
    }
  };

/* =========================================================
   MODIFIER FOURNISSEUR
========================================================= */

export const updateFournisseurController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Identifiant fournisseur invalide.",
        });
      }

      const userId =
        await getAuthenticatedUserId(req);

      const ancienFournisseur =
        await getFournisseurById(id);

      const data =
        await updateFournisseur(
          id,
          req.body
        );

      await enregistrerActivite(
        userId,
        "Fournisseur modifié",
        `Fournisseur modifié : ${ancienFournisseur.name} → ${data.name}.`
      );

      return res.json({
        success: true,
        data,
        message:
          "Fournisseur modifié avec succès.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Impossible de modifier le fournisseur.",
      });
    }
  };

/* =========================================================
   SUPPRIMER FOURNISSEUR
========================================================= */

export const deleteFournisseurController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Identifiant fournisseur invalide.",
        });
      }

      const userId =
        await getAuthenticatedUserId(req);

      const fournisseur =
        await getFournisseurById(id);

      await deleteFournisseur(id);

      await enregistrerActivite(
        userId,
        "Fournisseur supprimé",
        `Fournisseur supprimé : ${fournisseur.name}.`
      );

      return res.json({
        success: true,
        message:
          "Fournisseur supprimé avec succès.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer le fournisseur.",
      });
    }
  };

/* =========================================================
   ACHATS
   Partie existante conservée.
========================================================= */

export const getPurchasesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getPurchases();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de récupérer les achats.",
    });
  }
};

/* =========================================================
   CRÉER ACHAT
========================================================= */

export const createPurchaseController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      supplierId,
      productId,
      quantity,
      unitPrice,
      treasuryAccountId,
    } = req.body;

    if (
      !supplierId ||
      !productId ||
      !treasuryAccountId ||
      !quantity ||
      !unitPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Les informations de l'achat sont incomplètes.",
      });
    }

    const userId =
      await getAuthenticatedUserId(req);

    const data = await createPurchase(
      supplierId,
      productId,
      Number(quantity),
      Number(unitPrice),
      treasuryAccountId,
      userId
    );

    return res.status(201).json({
      success: true,
      data,
      message:
        "Achat créé avec succès.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de créer l'achat.",
    });
  }
};