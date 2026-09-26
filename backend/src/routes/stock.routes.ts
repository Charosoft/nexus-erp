import { Router } from "express";
import {
  getProductsController,
  getStockAlertsController
} from "../controllers/stock.controller.js";

const router = Router();

router.get("/products", getProductsController);
router.get("/alerts", getStockAlertsController);

export default router;