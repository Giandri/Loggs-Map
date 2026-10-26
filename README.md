<p align="center">
  <img src="https://raw.githubusercontent.com/Giandri/Loggs-Map/main/public/images/loggs%20logo.png" width="90" alt="Loggs Maps logo">
</p>

<h1 align="center">Loggs Maps - Coffee Shop Map for Pangkalpinang</h1>

Loggs Maps is an interactive map of coffee shops in Pangkalpinang. Search for a place, check its hours and facilities, save favorites, and get driving directions. The map runs on Next.js with PostgreSQL. Shop owners manage listings from a password-protected dashboard.

<p align="center">
  <a href="https://maps.loggsvisual.com">
    <img src="https://img.shields.io/badge/Live_Demo-maps.loggsvisual.com-000000?style=flat-square&logo=vercel&logoColor=white" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma 5">
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <a href="https://github.com/Giandri/Loggs-Map">
    <img src="https://img.shields.io/github/stars/Giandri/Loggs-Map?style=social" alt="GitHub Repo stars">
  </a>
</p>

![Loggs Maps desktop map](docs/screenshots/map-desktop.jpg)

## Key Capabilities

- **Map-first discovery** - Satellite and street tiles, clustered markers, and search by shop name or address.
- **Nearby and routing** - Use the browser location, see the five closest shops, and get a driving route with distance and duration.
- **Shop profiles** - Photos, opening hours, price range, service tax, Wi-Fi speed, WFC, mushola, parking, payment methods, facilities, and social links.
- **Favorites with consent** - Favorites live in PostgreSQL per session. When cookies are rejected, they fall back to localStorage.
- **Admin dashboard** - Password login, CRUD for shops, logo and photo uploads to Vercel Blob, and a file manager.
- **Live updates** - The map polls the API every 30 seconds, so new listings appear without a reload.

For the full feature set, open the [live demo](https://maps.loggsvisual.com).

## Screenshots

<p align="center">
  <img src="docs/screenshots/detail-drawer.jpg" alt="Coffee shop details" width="85%">
</p>

<p align="center">
  <img src="docs/screenshots/map-mobile.jpg" alt="Mobile map" width="280">
</p>

## Tech Stack

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,prisma,postgres,supabase,vercel,nodejs&perline=9" alt="Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Supabase, Vercel, Node.js">
  </a>
</p>

## Quick Start

```bash
git clone https://github.com/Giandri/Loggs-Map.git
cd Loggs-Map
npm install
npm run db:push
npm run dev
```

Create a `.env` file with `DATABASE_URL`, `DIRECT_URL`, `BLOB_READ_WRITE_TOKEN`, and `ADMIN_PASSWORD` before running `db:push`. Open [http://localhost:3000](http://localhost:3000), then use the dashboard at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Resources

- [Live Demo](https://maps.loggsvisual.com)
- [GitHub Repository](https://github.com/Giandri/Loggs-Map)
- [Issue Tracker](https://github.com/Giandri/Loggs-Map/issues)



## Deployment

The live application runs at [maps.loggsvisual.com](https://maps.loggsvisual.com).

The API routes use the Node.js runtime because Prisma requires it. No Edge runtime is configured.

## Notes

- Authentication is one shared password, not a multi-user account system.
- The filter control on the map is a placeholder and currently shows a "coming soon" message.
- Data changes appear through 30-second polling, not WebSockets.
- `prisma/seed.ts` predates the current schema. Add data from the dashboard or use Prisma Studio.

## Support

Open an issue at [github.com/Giandri/Loggs-Map/issues](https://github.com/Giandri/Loggs-Map/issues).

## Contributing

Issues and pull requests are welcome. Describe the change and include screenshots for UI updates.

## Credits

Built by [Giandri](https://github.com/Giandri) for Loggs Visual.

Map tiles by Esri and OpenStreetMap. Geocoding by Nominatim. Routing by OSRM. Icons by Lucide.
