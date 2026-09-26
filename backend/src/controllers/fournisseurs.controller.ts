import type { Request, Response } from "express";

import {
  getSuppliers,
  getPurchases,
  createPurchase,
} from "../services/fournisseurs.service.js";

export const getSuppliersController = async (
  _req: Request,
  res: Response
) => {
  try {
    const suppliers = await getSuppliers();

    return res.json({
      success: true,
      data: suppliers,
      message: "Fournisseurs récupérés avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les fournisseurs",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};

export const getPurchasesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const purchases = await getPurchases();

    return res.json({
      success: true,
      data: purchases,
      message: "Achats récupérés avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les achats",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};
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
      !quantity ||
      unitPrice === undefined ||
      !treasuryAccountId
    ) {
      return res.status(400).json({
        success: false,
        message: "Données d'achat incomplètes",
      });
    }

    const purchase = await createPurchase(
      supplierId,
      productId,
      Number(quantity),
      Number(unitPrice),
      treasuryAccountId
    );

    return res.status(201).json(purchase);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de créer l'achat",
      error:
        error instanceof Error
          ? error.message
          : "Erreur inconnue",
    });
  }
};