Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

Add three new models to the Prisma schema and generate a migration:

- **BoxPurchase** — `id` (cuid), `shop`, `orderId`, `orderLineItemId`, `mysteryBoxId`, `quantity`, `status` (enum `unopened` | `opened`, default `unopened`), `createdAt`, `openedAt`. Index on `shop` + `orderId`. Links a Shopify order line item to a Box Definition.
- **BoxReveal** — `id` (cuid), `boxPurchaseId` (FK to BoxPurchase), `setId` (Int, nullable — null for Single Item Boxes, set index for Bundle Boxes), `variantId`, `itemName`, `createdAt`. One Reveal per Set for bundles, one per box for single-item.
- **BoxDesign** — `id` (cuid), `mysteryBoxId` (unique FK to MysteryBox), `animationStyle` (String, default `"default"`), `boxImageUrl` (String?), `openSoundUrl` (String?), `backgroundColor` (String?), `backgroundImageUrl` (String?).

Run `npx prisma migrate dev --name add_box_purchase_reveal_design` to generate the migration. Verify the migration file is created.

## Acceptance criteria

- [ ] `BoxPurchase` model exists in schema.prisma with all fields and correct types
- [ ] `BoxReveal` model exists with FK to BoxPurchase
- [ ] `BoxDesign` model exists with unique FK to MysteryBox
- [ ] Migration file generated under `prisma/migrations/`
- [ ] `npx prisma generate` succeeds

## Blocked by

None — can start immediately.
