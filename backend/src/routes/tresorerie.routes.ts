import { Router } from "express";
import {
  getTreasuryAccountsController,
  getTreasuryMovementsController
} from "../controllers/tresorerie.controller.js";

const router = Router();

router.get("/accounts", getTreasuryAccountsController);
router.get("/movements", getTreasuryMovementsController);

export default router;