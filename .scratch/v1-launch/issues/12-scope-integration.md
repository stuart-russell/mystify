Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

Final integration pass: update app access scopes, verify all webhooks are registered, and perform end-to-end validation.

**Scope updates in `shopify.app.toml`:**
Add to the existing `write_products` scope:
- `read_orders` — needed for `orders/create` webhook
- `write_inventory` — needed to decrement Item inventory on Reveal
- `read_inventory` — needed for Smart Stock Management stock checks

Final scope string: `write_products,read_orders,write_inventory,read_inventory`

**Webhook registration audit:**
Verify all four webhook subscriptions are present in `shopify.app.toml`:
- `app/uninstalled` (already existed)
- `app/scopes_update` (already existed)
- `orders/create` (added in issue `03-order-processor`)
- `inventory_levels/update` (added in issue `10-smart-stock-management`)

**App Proxy audit:**
Verify the App Proxy config (from issue `06-app-proxy-scaffold`) is present in `shopify.app.toml`.

**End-to-end smoke test checklist:**
- [ ] Admin: create a Single Item Box with 2+ Items → save as active
- [ ] Admin: create a Bundle Box with 2 Sets → save as active
- [ ] Admin: edit an existing box, change Chances, verify SaveBar works
- [ ] Admin: configure box design (animation style, colors)
- [ ] Admin: verify Analytics page loads (may be empty initially)
- [ ] Storefront: verify product page block renders on the mystery box product
- [ ] Storefront: add box to cart, complete test checkout
- [ ] Post-purchase: verify thank-you page block shows unopened box prompt
- [ ] Unboxing: navigate to unbox page, verify animation plays
- [ ] Inventory: verify revealed Item's inventory decremented
- [ ] Smart Stock: verify box goes inactive when Items OOS
- [ ] Analytics: verify dashboard shows the test purchase data

## Acceptance criteria

- [ ] Access scopes updated to include `read_orders`, `write_inventory`, `read_inventory`
- [ ] All four webhook subscriptions present in shopify.app.toml
- [ ] App Proxy config present in shopify.app.toml
- [ ] Full end-to-end smoke test passes on all checklist items

## Blocked by

- `01-prisma-migration`
- `02-randomization-engine`
- `03-order-processor`
- `04-inventory-manager`
- `05-unboxing-orchestrator`
- `06-app-proxy-scaffold`
- `07-unbox-page-ui`
- `08-box-design-service`
- `09-theme-extension-blocks`
- `10-smart-stock-management`
- `11-analytics-dashboard`
