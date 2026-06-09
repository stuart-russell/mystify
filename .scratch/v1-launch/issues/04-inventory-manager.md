Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

A module wrapping the Shopify Admin GraphQL API for inventory operations. Used by the Unboxing Orchestrator (to decrement revealed Items) and Smart Stock Management (to check stock levels).

**Operations:**

- `checkStock(admin, variantIds: string[])` → `Map<variantId, inventoryQuantity>` — queries inventory for a set of variant IDs via the Admin GraphQL API.
- `decrementInventory(admin, variantId: string, amount: number)` → updates the variant's inventory quantity by decrementing the specified amount via the `inventoryAdjustQuantities` mutation (or equivalent Admin API call).
- `disableBoxProduct(admin, productId: string)` — sets the Box Definition's Box Status to `inactive` in the database (does not modify the Shopify product — the storefront reads availability from the app's Box Status).

**Design:** The module receives the `admin` client (from `authenticate.admin`) as a parameter so it doesn't couple to any specific request context. This keeps it testable — tests can mock the admin client's `graphql` method.

**Tests:** Mock the admin GraphQL client. Verify checkStock returns correct quantities, decrementInventory sends the correct mutation with correct parameters, disableBoxProduct updates the DB record.

## Acceptance criteria

- [ ] `checkStock` queries and returns inventory quantities for given variant IDs
- [ ] `decrementInventory` sends correct inventory adjustment mutation
- [ ] `disableBoxProduct` updates MysteryBox.boxStatus to "inactive" for given productId
- [ ] Module receives `admin` client as parameter (no hard coupling to request context)
- [ ] Tests pass with mocked admin GraphQL client

## Blocked by

None — can start immediately.
