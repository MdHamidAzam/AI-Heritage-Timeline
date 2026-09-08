# Heritage AI — Machine Timeline

Run `npm install`, then `npm run dev`. This Vite prototype exposes seed JSON through `/api/monuments` and `/api/monuments/konark-sun-temple` in development.

Data is intentionally separated into `public/api/`. `scripts/validate-data.mjs` checks demo monument IDs. Add future raw source material under `data/raw/{images,documents,maps,drawings,3d,drone}` and keep it immutable; place derived material in `data/processed` or `data/annotated`.
