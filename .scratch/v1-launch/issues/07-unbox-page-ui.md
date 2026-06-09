Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

The full customer-facing unboxing page — the animated Reveal experience with multi-unbox controls.

**Page behavior:**

1. On load: read `boxPurchaseId` from query params, fetch the BoxPurchase + existing Reveals (if already opened) from the Unboxing Orchestrator API
2. If already opened: display the existing Reveal(s) with the same animation (no re-randomize button)
3. If unopened: show the closed box state with available controls

**Multi-unbox controls (for unopened boxes):**
- **"Open One"** — reveals one Set/item at a time. Calls the Orchestrator for each click (or calls once and caches the results, revealing them incrementally in the UI).
- **"Reveal All"** — opens all Sets/boxes at once. Calls the Orchestrator once, shows all results simultaneously.
- **"Auto-play"** — opens Sets/boxes sequentially with a brief delay (e.g., 1.5s between each), no clicks needed.

**Animation:**
- Start with a CSS-based animation using preset styles (at minimum one style: a box that shakes/flips/opens to reveal the Item image + name)
- Read the BoxDesign settings (animation style, box image, sound, background) from the BoxDesign model via the MysteryBox association
- Play the open sound (if configured) on reveal
- Apply background color/image from design settings
- The selected Item's Color (from the Box Definition) should appear as an accent during the reveal

**Revisit behavior:** If the customer navigates to the page for an already-opened BoxPurchase, show the existing Reveals with a "previously opened" indicator. No re-randomization.

## Acceptance criteria

- [ ] Page loads BoxPurchase and displays existing Reveals if already opened
- [ ] "Open One" reveals items incrementally
- [ ] "Reveal All" opens everything at once
- [ ] "Auto-play" reveals sequentially with delay
- [ ] At least one CSS animation style (box shake/flip/open)
- [ ] BoxDesign settings applied: animation style, box image, sound, background
- [ ] Item Color used as accent during reveal
- [ ] Revisit shows existing Reveals, no re-randomization
- [ ] Works on mobile viewport sizes

## Blocked by

- `05-unboxing-orchestrator` (needs API endpoint to call)
- `06-app-proxy-scaffold` (needs route to render in)
- `08-box-design-service` (needs design data)
