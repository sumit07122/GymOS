# FIXIA GymOS: Frontend Starter (v2)

Next.js 15 + Tailwind. Light, quiet SaaS interface with one pine-green accent, Bricolage Grotesque headlines and Geist UI text (both bundled locally via Fontsource).

    npm install && npm run dev     # http://localhost:3000

## Screens
`/` landing, `/login`, `/platform-admin`, `/owner/dashboard`, `/member/home`, `/g/iron-temple` (per-gym public site, accent colour comes from config).

## Photos
Drop real images into `public/photos/`: `hero.jpg` (landing), `gym-hero.jpg` (public gym site). Until then a green gradient shows. Use your own or licensed photos.

## Motion
One page-enter fade on every route, number count-ups on stats, chart draw-in, and a hero reveal on the landing page. All of it stops under `prefers-reduced-motion`.

## Connecting the backend
1. Replace `lib/preview-data.ts` imports with your existing server queries (pages are server components).
2. `app/login/page.tsx`: call your existing sign-in action in `onSubmit`.
3. `app/g/[slug]/page.tsx`: replace the `GYMS` object with your public gym config query.
4. Member QR: render your signed payload in `member/home`. Remove `PreviewBanner` per page once real.
5. Keep your middleware, role guards, manifest and service worker.

## Not included
Remaining routes (reuse `components/`), real auth, PWA files, tests. Sidebar links to unbuilt routes 404.
