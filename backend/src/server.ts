import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Route de test
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "NEXUS ERP API opérationnelle",
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`NEXUS ERP API démarrée sur http://localhost:${PORT}`);
});