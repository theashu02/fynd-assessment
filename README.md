This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Commerce Order Console

Staff console for taking phone orders: catalogue with stock, order builder, order list with search/filter, and fulfilment (Placed -> Packed -> Shipped, cancel from Placed/Packed only).

Run with (uses `next.exe` launcher workaround):

```bash
node ./node_modules/next/dist/bin/next dev
```

## Design System (solid colors only)

No gradients, no blur/glass effects anywhere. Light values are the default; dark values follow the device `prefers-color-scheme` (plus an equivalent `.dark` override).

COLD (base / primary):

- background: #F1F5F9 (cool light gray)
- surface/card: #FFFFFF
- border: #CBD5E1
- text: #0F172A, muted text: #64748B
- primary: #1D4ED8 (blue), primary-hover: #1E40AF
- teal: #0F766E (Packed), indigo: #4338CA (Shipped)
- sidebar/header: #0F172A with white text

HOT (alerts / actions):

- accent: #F97316 (orange) highlights, low stock, key CTAs
- danger: #DC2626 (red) cancel, out of stock, errors
- warning: #F59E0B (amber)

Status colors: Placed #1D4ED8, Packed #0F766E, Shipped #4338CA, Cancelled #DC2626.

Radius: 0 (squared corners, no radius). Font: Ubuntu via `next/font`. No gradients anywhere. Tokens live in `src/app/globals.css` mapped to shadcn CSS variables (`--primary`, `--destructive`, `--accent`, `--warning`, `--status-*`, `--sidebar-*`, ...).


