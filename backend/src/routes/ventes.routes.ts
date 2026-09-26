import { Router } from "express";
import {
  getClientsController,
  getInvoicesController,
  createSaleController
} from "../controllers/ventes.controller.js";

const router = Router();

router.get("/clients", getClientsController);
router.get("/invoices", getInvoicesController);
router.post("/sales", createSaleController);

export default router;