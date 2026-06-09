Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

Smart Stock Management: automatically set a Box Definition's Box Status to `inactive` when any of its Items goes out of stock in Shopify.

**Approach:** Use periodic polling OR listen for Shopify webhooks (`inventory_levels/update`). Recommendation: add a webhook subscription for `inventory_levels/update` — when inventory changes, check if the affected variant belongs to any active MysteryBox Items, and if so, check whether all Items for that box still have stock using the Inventory Manager's `checkStock`.

**Webhook handler:**
- Receives `inventory_levels/update` webhook
- Extracts the variant ID from the payload
- Queries MysteryBox records where `boxStatus = "active"` and the variant appears in `itemConfig` or `bundleConfig` JSON
- For each matching box, calls Inventory Manager to check stock of ALL Items in that box
- If any Item has 0 inventory → set Box Status to `inactive`

**Registration:** Add webhook subscription to `shopify.app.toml`.

**Edge cases:**
- A box might have Items across many different variants — check all of them, not just the one that triggered the webhook
- If a box is already `inactive` or `draft`, skip it
- Consider a small debounce or idempotency check to avoid processing the same inventory update multiple times in rapid succession

**Tests:** Mock webhook payload. Verify box is set to inactive when any Item OOS. Verify active boxes with all Items in stock are NOT affected. Verify draft/inactive boxes are skipped.

## Acceptance criteria

- [ ] Webhook handler for `inventory_levels/update` exists
- [ ] Correctly identifies which active MysteryBoxes contain the affected variant
- [ ] Checks stock of ALL Items in affected boxes (not just the triggering variant)
- [ ] Sets Box Status to `inactive` when any Item has 0 inventory
- [ ] Skips boxes already in `draft` or `inactive` status
- [ ] Webhook subscription registered in shopify.app.toml
- [ ] Tests pass

## Blocked by

- `04-inventory-manager` (uses checkStock)
