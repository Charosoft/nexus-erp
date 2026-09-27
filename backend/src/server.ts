import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { supabase } from "./config/supabase.js";

import stockRoutes from "./routes/stock.routes.js";
import ventesRoutes from "./routes/ventes.routes.js";
import tresorerieRoutes from "./routes/tresorerie.routes.js";
import comptabiliteRoutes from "./routes/comptabilite.routes.js";
import fournisseursRoutes from "./routes/fournisseurs.routes.js";
import activitesRoutes from "./routes/activites.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import clientsRoutes from "./routes/clients.routes.js";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

/* Middlewares */

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/stock", stockRoutes);
app.use("/api/ventes", ventesRoutes);
app.use("/api/tresorerie", tresorerieRoutes);
app.use("/api/comptabilite", comptabiliteRoutes);
app.use("/api/fournisseurs", fournisseursRoutes);
app.use("/api/activites", activitesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientsRoutes);

/* Route de test API */

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "NEXUS ERP API opérationnelle",
    timestamp: new Date().toISOString(),
  });
});

/* Route de test Supabase */

app.get("/api/health/supabase", async (_req, res) => {
  try {
    const { error } = await supabase
      .from("roles")
      .select("id")
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Connexion Supabase échouée",
        error: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Connexion Supabase opérationnelle",
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion à Supabase",
    });
  }
});

/* Démarrage du serveur */

app.listen(PORT, () => {
  console.log(
    `NEXUS ERP API démarrée sur le port ${PORT}`
  );
});