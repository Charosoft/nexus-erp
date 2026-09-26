import type { Request, Response } from "express";
import {
  getProducts,
  getStockAlerts
} from "../services/stock.service.js";

export const getProductsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const products = await getProducts();

    return res.json({
      success: true,
      data: products,
      message: "Produits récupérés avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les produits",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const getStockAlertsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const alerts = await getStockAlerts();

    return res.json({
      success: true,
      data: alerts,
      message: "Alertes de stock récupérées avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les alertes",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};