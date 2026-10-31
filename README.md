# SuryaJaga

Purwarupa sistem peringatan dini berbasis AI agar PLTS desa tidak mangkrak (Seno Hackathon ITS 2026). Dokumentasi lengkap di `docs/`; mulai dari `docs/00-BRIEF.md` dan `docs/01-PRD.md`.

## Menjalankan

```bash
# Web (http://localhost:3000)
cd web && npm install && npm run dev

# API (http://localhost:8000/health)
cd api && python -m venv .venv && .venv/Scripts/pip install -r requirements-dev.txt
.venv/Scripts/uvicorn app.main:app --reload

# Analisis
cd analisis && python -m venv .venv && .venv/Scripts/pip install -r requirements-dev.txt
```

Perintah verifikasi lengkap ada di `docs/07-RULES.md`.
