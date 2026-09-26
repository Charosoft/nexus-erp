import { Router } from "express";
import {
  getAccountingAccountsController,
  getAccountingEntriesController
} from "../controllers/comptabilite.controller.js";

const router = Router();

router.get("/accounts", getAccountingAccountsController);
router.get("/entries", getAccountingEntriesController);

export default router;