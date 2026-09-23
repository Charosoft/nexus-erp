cat > README.md <<'EOF'
# NEXUS ERP

## NEXUS — Mini-ERP intégré

Projet universitaire de conception d'un mini-ERP intégré.

## Architecture

- Frontend : React + Vite + TypeScript + Tailwind CSS
- Backend : Node.js + Express + TypeScript
- Base de données : Supabase / PostgreSQL
- Authentification : Supabase Auth
- Versionnement : Git + GitHub
- Déploiement frontend : Vercel
- Déploiement backend : Render

## Modules

- Stock & inventaire
- Comptabilité
- Fournisseurs & achats
- Ventes
- Trésorerie

## Architecture générale

Frontend React
→ API Node.js / Express
→ Supabase / PostgreSQL

## État du projet

- [x] Conception générale
- [x] MCD
- [x] Structure PostgreSQL
- [x] Données de démonstration
- [x] RLS initial
- [ ] Authentification
- [ ] Backend API
- [ ] Frontend
- [ ] Intégration des modules
- [ ] Tests
- [ ] Déploiement
EOF