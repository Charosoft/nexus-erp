import type { Request, Response } from "express";
import {
  getAccountingAccounts,
  getAccountingEntries
} from "../services/comptabilite.service.js";

export const getAccountingAccountsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const accounts = await getAccountingAccounts();

    return res.json({
      success: true,
      data: accounts,
      message: "Comptes comptables récupérés avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les comptes comptables",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const getAccountingEntriesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const entries = await getAccountingEntries();

    return res.json({
      success: true,
      data: entries,
      message: "Écritures comptables récupérées avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les écritures comptables",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};