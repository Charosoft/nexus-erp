import type { Request, Response } from "express";

import {
  createProduct,
  deactivateProduct,
  getCategories,
  getProducts,
  getStockAlerts,
  updateProduct,
} from "../services/stock.service.js";

export async function getProductsController(
  _req: Request,
  res: Response
) {
  try {
    const products = await getProducts();

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Erreur récupération produits :", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de récupérer les produits.",
    });
  }
}

export async function getCategoriesController(
  _req: Request,
  res: Response
) {
  try {
    const categories = await getCategories();

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Erreur récupération catégories :", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de récupérer les catégories.",
    });
  }
}

export async function createProductController(
  req: Request,
  res: Response
) {
  try {
    const {
      reference,
      name,
      description,
      categoryId,
      unitPrice,
      purchasePrice,
      alertThreshold,
      initialQuantity,
    } = req.body;

    if (
      !reference ||
      !name ||
      unitPrice === undefined ||
      purchasePrice === undefined ||
      alertThreshold === undefined ||
      initialQuantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs obligatoires du produit sont requis.",
      });
    }

    const product = await createProduct({
      reference: String(reference).trim(),
      name: String(name).trim(),
      description:
        description !== undefined
          ? String(description)
          : null,
      categoryId: categoryId
        ? String(categoryId)
        : null,
      unitPrice: Number(unitPrice),
      purchasePrice: Number(purchasePrice),
      alertThreshold: Number(alertThreshold),
      initialQuantity: Number(initialQuantity),
    });

    return res.status(201).json({
      success: true,
      data: product,
      message: "Produit créé avec succès.",
    });
  } catch (error) {
    console.error("Erreur création produit :", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de créer le produit.",
    });
  }
}

export async function updateProductController(
  req: Request,
  res: Response
) {
  try {
    const idParam = req.params.id;

    if (Array.isArray(idParam) || !idParam) {
      return res.status(400).json({
        success: false,
        message: "Identifiant produit invalide.",
      });
    }

    const {
      reference,
      name,
      description,
      categoryId,
      unitPrice,
      purchasePrice,
      alertThreshold,
    } = req.body;

    if (
      !reference ||
      !name ||
      unitPrice === undefined ||
      purchasePrice === undefined ||
      alertThreshold === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs obligatoires du produit sont requis.",
      });
    }

    const product = await updateProduct(idParam, {
      reference: String(reference).trim(),
      name: String(name).trim(),
      description:
        description !== undefined
          ? String(description)
          : null,
      categoryId: categoryId
        ? String(categoryId)
        : null,
      unitPrice: Number(unitPrice),
      purchasePrice: Number(purchasePrice),
      alertThreshold: Number(alertThreshold),
    });

    return res.json({
      success: true,
      data: product,
      message: "Produit modifié avec succès.",
    });
  } catch (error) {
    console.error("Erreur modification produit :", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de modifier le produit.",
    });
  }
}

export async function deleteProductController(
  req: Request,
  res: Response
) {
  try {
    const idParam = req.params.id;

    if (Array.isArray(idParam) || !idParam) {
      return res.status(400).json({
        success: false,
        message: "Identifiant produit invalide.",
      });
    }

    await deactivateProduct(idParam);

    return res.json({
      success: true,
      message: "Produit désactivé avec succès.",
    });
  } catch (error) {
    console.error("Erreur désactivation produit :", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de désactiver le produit.",
    });
  }
}

export async function getStockAlertsController(
  _req: Request,
  res: Response
) {
  try {
    const alerts = await getStockAlerts();

    return res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Erreur récupération alertes stock :", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de récupérer les alertes.",
    });
  }
}