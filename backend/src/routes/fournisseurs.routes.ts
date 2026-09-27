import { Router } from "express";

import {
  getFournisseursController,
  getFournisseurController,
  createFournisseurController,
  updateFournisseurController,
  deleteFournisseurController,
  getPurchasesController,
  createPurchaseController,
} from "../controllers/fournisseurs.controller.js";

const router = Router();

/* =========================================================
   FOURNISSEURS
========================================================= */

// Liste des fournisseurs
router.get(
  "/",
  getFournisseursController
);

// Créer un fournisseur
router.post(
  "/",
  createFournisseurController
);

/* =========================================================
   ACHATS
========================================================= */

router.get(
  "/achats",
  getPurchasesController
);

router.post(
  "/purchases",
  createPurchaseController
);

/* =========================================================
   FOURNISSEUR PAR ID
========================================================= */

router.get(
  "/:id",
  getFournisseurController
);

router.put(
  "/:id",
  updateFournisseurController
);

router.delete(
  "/:id",
  deleteFournisseurController
);

export default router;