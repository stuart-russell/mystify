Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

Two Shopify Theme App Extension blocks that integrate the mystery box experience into the merchant's storefront.

**Scaffolding:** Run `shopify app generate extension` to create a Theme App Extension. This produces the `extensions/<name>/` directory with `blocks/`, `snippets/`, `assets/`, and `shopify.extension.toml`.

**Block 1 — Product page block:**
- Target: `products.product` (renders on the mystery box product page)
- Displays the mystery box description, Item pool odds visualization (group Items by Color — same Chance = same accent color), and a total number of possible Items
- Uses Shopify's Liquid template language + vanilla JS where needed
- Reads box configuration via the MysteryBox metafield or an app API call (store the box configuration as a metafield on the product for direct Liquid access, OR call an app endpoint to fetch the box config)
- Recommendation: use product metafields (`namespace: "mystify"`, `key: "box_config"`) so the theme block can render without API latency. Populate the metafield when the box is created or updated.

**Block 2 — Thank-you page block:**
- Target: `checkout.thank_you` (renders on the order status / thank-you page)
- Calls an app API endpoint with the order ID to check for unopened BoxPurchases
- If unopened boxes exist: displays "You have N mystery box(es) to open!" with a button linking to `/apps/mystify/unbox?boxPurchaseId=<id>`
- If multiple unopened boxes: list each with its own "Open" button
- If all boxes opened: shows nothing (or a "View your reveals" link)
- API endpoint for this check: a lightweight GET endpoint returning `{ unopened: [{ boxPurchaseId, boxName }] }`

**Metafield population:** When a MysteryBox is created or updated with status `active`, populate the `mystify.box_config` metafield on the Shopify product with the relevant info (box type, Item count, etc.) so the product page block can read it directly.

## Acceptance criteria

- [ ] Theme App Extension scaffolded via `shopify app generate extension`
- [ ] Product page block renders mystery box info on the product page
- [ ] Thank-you page block detects unopened boxes and links to unbox page
- [ ] API endpoint exists for thank-you block to query unopened BoxPurchases by order ID
- [ ] `mystify.box_config` metafield populated on product when box is created/updated
- [ ] Blocks render correctly with no console errors

## Blocked by

- `01-prisma-migration` (needs BoxPurchase to query unopened)
