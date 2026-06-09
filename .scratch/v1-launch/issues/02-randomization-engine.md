Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

A pure-function Randomization Engine that selects Items from a Box Definition's pool based on weighted Chances. No I/O, no database access — fully testable.

**Interface (conceptual):**

Given a Box Definition's Item pool (array of `{ variantId, itemName, chance }`), optional constraints (`preventDuplicates: boolean`), and an optional list of already-revealed variantIds (for duplicate filtering), return one or more Reveal results.

For Single Item Boxes: select one Item from the pool.
For Bundle Boxes: select one Item per Set independently.

The selection uses weighted random sampling: each Item's probability equals its Chance / 100. Validate that total Chance equals 100 for each pool/Set.

When `preventDuplicates` is true (Bundle Boxes only), filter out variantIds already selected in prior Sets within the same Box Purchase before randomizing the next Set.

**Tests:** Verify statistical distribution over many trials (e.g. 10,000 runs for a 60/40 split should be within ±5% tolerance), duplicate prevention correctly excludes already-selected Items, validation rejects pools not summing to 100, edge cases (single-item pool always selects that item, zero items throws).

## Acceptance criteria

- [ ] Pure function with no side effects (no DB, no API calls, no randomness seeding from external state)
- [ ] Weighted selection produces correct distribution within statistical tolerance
- [ ] Duplicate prevention excludes already-revealed variantIds for subsequent Sets
- [ ] Validates total Chance equals 100 per pool, throws/rejects otherwise
- [ ] Single-item pool always selects that item
- [ ] Tests pass with ≥90% coverage of the module

## Blocked by

None — can start immediately.
