import { Router } from "express";
import {
  addActivite,
  listActivites,
} from "../controllers/activites.controller.js";

const router = Router();

router.get("/", listActivites);

router.post("/", addActivite);

export default router;