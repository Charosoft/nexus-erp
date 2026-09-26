import type { Request, Response } from "express";
import {
  getClients,
  getInvoices,
  createSale
} from "../services/ventes.service.js";

export const getClientsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const clients = await getClients();

    return res.json({
      success: true,
      data: clients,
      message: "Clients récupérés avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les clients",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const getInvoicesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const invoices = await getInvoices();

    return res.json({
      success: true,
      data: invoices,
      message: "Factures récupérées avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les factures",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const createSaleController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      clientId,
      productId,
      quantity,
      unitPrice,
      treasuryAccountId
    } = req.body;

    if (
      !clientId ||
      !productId ||
      !quantity ||
      unitPrice === undefined ||
      !treasuryAccountId
    ) {
      return res.status(400).json({
        success: false,
        message: "Données de vente incomplètes"
      });
    }

    const sale = await createSale(
      clientId,
      productId,
      Number(quantity),
      Number(unitPrice),
      treasuryAccountId
    );

    return res.status(201).json(sale);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Impossible de créer la vente",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};