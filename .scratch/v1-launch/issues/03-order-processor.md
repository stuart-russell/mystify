Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

A webhook handler for Shopify's `orders/create` topic. When a new order is placed, the handler:

1. Receives the webhook payload (Shopify order JSON)
2. Extracts line items from the order
3. Cross-references each line item's `productId` against the `MysteryBox` table to identify which line items are mystery box products
4. For each matching line item, creates a `BoxPurchase` record: `shop` (from the webhook domain), `orderId` (Shopify order GID), `orderLineItemId` (line item GID), `mysteryBoxId` (matching Box Definition), `quantity`, `status: "unopened"`

The webhook route should follow the existing pattern in `app/routes/webhooks.*.tsx` — authenticate via `authenticate.webhook(request)`, process the payload, return an empty 200 response.

**Route path:** `/webhooks/orders/create` (or similar, following React Router flat routes convention).

**Registration:** Add the webhook subscription to `shopify.app.toml` under `[[webhooks.subscriptions]]` with `topics = ["orders/create"]`.

**Tests:** Mock a Shopify order webhook payload. Verify BoxPurchase records are created with correct fields. Verify non-mystery-box line items are ignored. Verify orders with no mystery box products produce zero BoxPurchases.

## Acceptance criteria

- [ ] Webhook route exists and authenticates via `authenticate.webhook`
- [ ] Correctly identifies mystery box line items by cross-referencing MysteryBox.productId
- [ ] Creates BoxPurchase records with correct fields for each matching line item
- [ ] Non-mystery-box line items are silently ignored
- [ ] Webhook subscription registered in shopify.app.toml
- [ ] Tests pass for happy path, no-matching-products, and mixed orders

## Blocked by

- `01-prisma-migration` (needs BoxPurchase model)
