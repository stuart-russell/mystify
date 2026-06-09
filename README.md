# Mystify — Mystery Box Creator

A Shopify app that lets merchants create mystery box products, sell them through their storefront, and let customers unbox their purchases to reveal randomly-selected items with a fun animated experience.

## Concepts

| Term | Definition |
|---|---|
| **Mystery Box** | A Shopify product configured with rules for randomly selecting which Items a customer receives |
| **Single Item Box** | One randomly-selected Item from a weighted pool |
| **Bundle Box** | Multiple Sets, each independently selecting one Item |
| **Set** | A sub-pool within a Bundle Box with its own Items and Chances |
| **Item** | A specific product variant available inside a box pool, with a Chance and Color |
| **Chance** | A percentage weight (0–100) determining selection probability. Must sum to 100 per pool/Set |
| **Color** | A hex label assigned to Items; same-Chance Items share the same Color for visual grouping |
| **Box Definition** | The admin-configured rules: product, item pool, chances, status |
| **Box Status** | `draft` (hidden), `active` (purchasable), `inactive` (disabled) |
| **Box Purchase** | Records a customer's purchase of a Mystery Box, linked to an order line item |
| **Reveal** | The result of opening a Box Purchase: the specific Item(s) selected |
| **Unboxing** | The customer-facing animated reveal experience |
| **Smart Stock Management** | Auto-disables a box when any Item goes out of stock |
| **Prevent Duplicate Bundle Selections** | Ensures no Item appears in more than one Set per order |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHOPIFY ADMIN                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Box List │  │  Create  │  │   Edit   │  │   Analytics    │  │
│  │  (CRUD)  │  │   Box    │  │   Box    │  │  Dashboard     │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                      │                                           │
│            ┌─────────┴─────────┐                                 │
│            │   Box Definition   │───────────────────────────────┐│
│            │  (MysteryBox DB)   │                               ││
│            └───────────────────┘                               ││
└────────────────────────────────────────────────────────────────┘│
                                                                   │
┌──────────────────────────────────────────────────────────────────┐│
│                       SHOPIFY STOREFRONT                         ││
│                                                                  ││
│  ┌──────────────────┐     ┌──────────────────┐                  ││
│  │  Product Page    │     │  Thank-You Page  │                  ││
│  │  (odds display)  │     │  (unbox CTA)     │                  ││
│  └──────────────────┘     └────────┬─────────┘                  ││
│                                    │ POST order data             ││
│                                    ▼                             ││
│                          ┌──────────────────┐                   ││
│                          │  Register Order  │                   ││
│                          │  (App API)       │                   ││
│                          └────────┬─────────┘                   ││
│                                   │ creates                      ││
│                                   ▼                              ││
│                          ┌──────────────────┐                   ││
│                          │  BoxPurchase DB  │◄──────────────────┘│
│                          └────────┬─────────┘                    │
│                                   │                              │
│  ┌──────────────────┐            │                               │
│  │   Unbox Page     │◄───────────┘                               │
│  │  (App Proxy)     │                                            │
│  │  ┌────────────┐  │                                            │
│  │  │ Animation   │  │                                            │
│  │  │ Multi-unbox │  │                                            │
│  │  │ BoxDesign   │  │                                            │
│  │  └────────────┘  │                                            │
│  └────────┬─────────┘                                            │
│           │ POST /api/unbox                                      │
│           ▼                                                      │
│  ┌────────────────────────────────────────────┐                 │
│  │         Unboxing Orchestrator               │                 │
│  │  Randomization → Reveal → Inventory Decrement│                 │
│  └────────────────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

## End-to-end flow

```
MERCHANT                              CUSTOMER
────────                              ────────
1. Creates Box Definition
   └─ Selects product, type,
      Items, Chances, Colors
   └─ Configures Design
      (animation style, images)
   └─ Sets status to "active"
                                      2. Browses storefront
                                      3. Sees mystery box product
                                         page with odds display

                                      4. Adds to cart → checks out

                                      5. Lands on thank-you page
                                         "You have N boxes to open!"

                                      6. Clicks "Open" → Unbox Page
                                         ┌─────────────────────┐
                                         │   ??  →  shake      │
                                         │   ??  →  flip       │
                                         │  Item! →  reveal    │
                                         └─────────────────────┘

                                      Item selected by weighted
                                      chance, inventory decremented,
                                      Reveal recorded.

7. Views Analytics dashboard
   └─ Boxes sold, revenue,
      reveal distribution, CSV export
```

## Project structure

```
├── app/
│   ├── lib/engine/           # Deep modules (pure logic, tested)
│   │   ├── randomization.ts  # Weighted selection + duplicate prevention
│   │   ├── inventory.ts      # Shopify Admin API wrapper
│   │   ├── order-processor.ts# Order → BoxPurchase creation
│   │   ├── smart-stock.ts    # OOS detection + auto-disable
│   │   ├── analytics.ts      # Dashboard metrics + CSV
│   │   ├── box-design.ts     # Design CRUD
│   │   ├── unboxing-orchestrator.ts  # Reveal orchestration
│   │   └── metafield-sync.ts # Product metafield population
│   ├── routes/               # React Router routes (UI + API)
│   │   ├── app.tsx           # Admin layout + App Bridge
│   │   ├── app._index.tsx    # Box list
│   │   ├── app.createBox.tsx # Create box wizard
│   │   ├── app.boxes.$boxId.edit.tsx  # Edit box (with Design)
│   │   ├── app.analytics.tsx # Analytics dashboard
│   │   ├── apps.unbox.tsx    # Unbox page (App Proxy)
│   │   ├── api.unbox.tsx     # POST /api/unbox
│   │   ├── api.unopened-boxes.tsx  # Unopened box query + registration
│   │   └── webhooks.*.tsx    # Webhook handlers
│   ├── components/           # Admin UI components
│   ├── db.server.ts          # Prisma client singleton
│   └── shopify.server.ts     # Shopify app config
├── extensions/
│   └── mystify-theme/        # Theme App Extension
│       └── blocks/
│           ├── product-box-info.liquid   # Product page odds display
│           └── thank-you-unbox.liquid    # Post-purchase unbox CTA
├── prisma/
│   └── schema.prisma         # MysteryBox, BoxPurchase, BoxReveal, BoxDesign
├── docs/
│   ├── adr/                  # Architecture Decision Records
│   └── agents/               # Agent skill config
├── .scratch/                 # Issue tracker (local markdown)
├── CONTEXT.md                # Domain glossary
└── AGENTS.md                 # Agent skill configuration
```

## Data model

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  MysteryBox  │1─────1│  BoxDesign   │       │   Session    │
│──────────────│       │──────────────│       │──────────────│
│ id           │       │ mysteryBoxId │       │ id           │
│ shop         │       │ animStyle    │       │ shop         │
│ productId    │       │ boxImageUrl  │       │ accessToken  │
│ boxType      │       │ openSoundUrl │       │ ...          │
│ boxStatus    │       │ bgColor      │       └──────────────┘
│ itemConfig   │       │ bgImageUrl   │
│ bundleConfig │       └──────────────┘
│ ...          │
└──────┬───────┘
       │ 1
       │
       │ *
┌──────┴───────┐
│ BoxPurchase  │
│──────────────│
│ id           │
│ shop         │
│ orderId      │
│ mysteryBoxId │
│ price        │
│ status       │──── unopened → opened
│ openedAt     │
└──────┬───────┘
       │ 1
       │
       │ *
┌──────┴───────┐
│  BoxReveal   │
│──────────────│
│ id           │
│ boxPurchaseId│
│ setId        │──── null for single-item, index for bundle
│ variantId    │
│ itemName     │
└──────────────┘
```

## Getting started

### Prerequisites

- Node.js ≥20.19
- Shopify Partner account + development store
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) (`npm install -g @shopify/cli@latest`)

### Local development

```shell
npm install
npx prisma generate
npm run dev
```

This starts the app via `shopify app dev`, which creates a Cloudflare tunnel, sets up the App Proxy, and opens the app in your browser.

Press `p` to preview in your development store. After installing the app, you'll see the Mystify admin embedded in your Shopify admin.

### Running tests

```shell
npm test
```

35 tests across 8 files covering all deep modules: randomization, inventory, order processing, smart stock, analytics, box design, unboxing orchestration, and metafield sync.

### After first install

1. **Add theme blocks** — Open your theme editor, add "Mystify Box Info" to the product page template and "Mystify Unbox CTA" to the order status page.
2. **Create a box** — In the Shopify admin, navigate to Mystify → Create a New Box. Select a product, configure Items with Chances, add a design, and set the status to "active".
3. **Buy and unbox** — Purchase the box product from your storefront. You'll see the unbox CTA on the thank-you page.

## ADRs

- [ADR-0001](docs/adr/0001-theme-app-extension-storefront.md) — Storefront via Theme App Extension + App Proxy
- [ADR-0002](docs/adr/0002-post-purchase-reveal-managed-inventory.md) — Post-purchase reveal with managed inventory

## Deployment

This is a standard React Router app. Deploy to any Node.js host:

```shell
npm run build
npm start
```

For Shopify-specific deployment guides, see the [Shopify deployment docs](https://shopify.dev/docs/apps/launch/deployment). The app uses SQLite via Prisma — configure a different database provider in `prisma/schema.prisma` for production.
