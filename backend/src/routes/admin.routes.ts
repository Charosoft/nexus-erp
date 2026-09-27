import { Router } from "express";

import {
  createUser,
  deleteUser,
  listAllActivites,
} from "../controllers/admin.controller.js";

const router = Router();

router.post("/users", createUser);
router.delete("/users/:id", deleteUser);

router.get("/activites", listAllActivites);

export default router;