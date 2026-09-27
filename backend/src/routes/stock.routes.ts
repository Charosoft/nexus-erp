import { Router } from "express";

import {
  createProductController,
  deleteProductController,
  getCategoriesController,
  getProductsController,
  getStockAlertsController,
  updateProductController,
} from "../controllers/stock.controller.js";

const router = Router();

router.get("/products", getProductsController);

router.get(
  "/categories",
  getCategoriesController
);

router.post(
  "/products",
  createProductController
);

router.put(
  "/products/:id",
  updateProductController
);

router.delete(
  "/products/:id",
  deleteProductController
);

router.get(
  "/alerts",
  getStockAlertsController
);

export default router;