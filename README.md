# Glamour Inventory

A makeup stock management system built as a final year project. It lets you track inventory, manage suppliers and categories, get low-stock email alerts, and ask an AI assistant questions about your stock — all from one place.

## What it does

- **Dashboard** — quick overview of stock levels, total value, and items running low
- **Inventory** — add, edit, delete products; sortable columns; CSV export
- **Categories & Suppliers** — manage them separately, linked to inventory items
- **Low stock alerts** — sends an email automatically when quantity drops below the threshold
- **AI Chat** — ask questions like "what's running low?" or "what's my total inventory value?" and get answers pulled from live data
- **User management** — admin-only; supports admin and moderator roles

## Running it locally

You'll need Node.js and MongoDB installed. MongoDB should be running on port 27017.

```bash
# install frontend deps
npm install

# install backend deps
cd server
npm install
cd ..

# start MongoDB (separate terminal)
mongod

# start the backend (separate terminal)
cd server
npm run dev

# start the frontend (separate terminal)
npm run dev
```

Frontend: `http://localhost:8080`  
Backend API: `http://localhost:5000`


## Stack

- React 18 + TypeScript + Vite (frontend)
- Express + Node.js + MongoDB/Mongoose (backend)
- Nodemailer for email alerts
- Gemini API for AI chat (falls back to rule-based smart mode if unavailable)

## Folder layout

```
sparkle-shelf-smart/
├── src/          # frontend (React)
├── server/       # backend (Express)
└── docs/         # setup guides and notes
```
