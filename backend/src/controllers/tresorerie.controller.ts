import type { Request, Response } from "express";
import {
  getTreasuryAccounts,
  getTreasuryMovements
} from "../services/tresorerie.service.js";

export const getTreasuryAccountsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const accounts = await getTreasuryAccounts();

    return res.json({
      success: true,
      data: accounts,
      message: "Comptes de trésorerie récupérés avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les comptes de trésorerie",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const getTreasuryMovementsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const movements = await getTreasuryMovements();

    return res.json({
      success: true,
      data: movements,
      message: "Mouvements de trésorerie récupérés avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les mouvements",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};