import { Router } from "express";
import {
  createUser,
  deleteUser,
} from "../controllers/admin.controller.js";

const router = Router();

router.post("/users", createUser);
router.delete("/users/:id", deleteUser);

export default router;