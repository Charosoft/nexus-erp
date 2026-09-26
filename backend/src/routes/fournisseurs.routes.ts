import { Router } from "express";

import {
  getSuppliersController,
  getPurchasesController,
  createPurchaseController,
} from "../controllers/fournisseurs.controller.js";

const router = Router();

router.get("/", getSuppliersController);
router.get("/achats", getPurchasesController);
router.post("/purchases", createPurchaseController);

export default router;