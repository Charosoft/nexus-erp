import { Router } from "express";

import {
  createClientController,
  deleteClientController,
  getClientController,
  getClientsController,
  updateClientController,
} from "../controllers/clients.controller.js";

const router = Router();

router.get("/", getClientsController);
router.get("/:id", getClientController);
router.post("/", createClientController);
router.put("/:id", updateClientController);
router.delete("/:id", deleteClientController);

export default router;