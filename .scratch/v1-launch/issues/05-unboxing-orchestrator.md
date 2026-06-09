Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

The orchestrator that ties together the reveal flow end-to-end. Called when a customer opens a Box Purchase from the Unbox Page.

**Flow:**

1. Load the BoxPurchase by ID (validate it exists, belongs to the shop, and status is `unopened`)
2. Load the associated MysteryBox (Box Definition) and parse its itemConfig/bundleConfig
3. If Bundle Box with Prevent Duplicate Bundle Selections enabled, collect already-revealed variantIds from this BoxPurchase's existing Reveals (none on first call)
4. Call the Randomization Engine: pass the parsed config, duplicate prevention flag, and already-revealed variantIds
5. For each selected Item, call the Inventory Manager to decrement the variant's inventory
6. Persist BoxReveal records (one per selected Item)
7. Update BoxPurchase status to `opened`, set `openedAt`
8. Return the Reveal results

**Idempotency:** If the BoxPurchase status is already `opened`, return the existing Reveals without re-randomizing, re-decrementing, or creating new records.

**API endpoint:** Expose as a React Router action or API route (e.g., `POST /api/unbox` with `{ boxPurchaseId }` in the body). Authenticate via `authenticate.public.appProxy` (since the unbox page is an App Proxy route).

**Tests:** Test the full flow with mocked Randomization Engine, Inventory Manager, and DB. Test idempotency (second call returns same result). Test duplicate prevention across Sets. Test error handling (BoxPurchase not found, already opened, inventory decrement failure).

## Acceptance criteria

- [ ] Loads BoxPurchase and associated MysteryBox, validates status is `unopened`
- [ ] Calls Randomization Engine with correct config and constraints
- [ ] Calls Inventory Manager to decrement each revealed Item's variant
- [ ] Persists BoxReveal records and updates BoxPurchase to `opened`
- [ ] Idempotent: second call returns existing Reveal without side effects
- [ ] API endpoint accepts `boxPurchaseId`, returns reveal results
- [ ] Tests pass for happy path, idempotency, and error cases

## Blocked by

- `01-prisma-migration`
- `02-randomization-engine`
- `03-order-processor`
- `04-inventory-manager`
