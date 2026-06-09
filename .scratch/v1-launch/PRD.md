# Mystify V1 Launch

Status: ready-for-agent

## Problem Statement

Shopify merchants want to gamify shopping by selling mystery boxes — products where the customer doesn't know exactly which item they'll receive until after purchase. They need to boost sales during seasonal events, clear overstock, and create a unique brand experience. Currently, no Shopify-native solution lets merchants configure mystery boxes, sell them through their storefront, provide an animated unboxing experience, manage the inventory implications, or track results. Merchants are forced to cobble together workarounds or skip the mechanic entirely.

## Solution

Mystify provides an end-to-end mystery box platform as a Shopify App. Merchants create Box Definitions in the admin — choosing between Single Item Boxes (one random item) or Bundle Boxes (multiple sets, one item per set) — and assign weighted Chances to each Item. The app publishes the box product to the storefront via Theme App Extensions. Customers discover and purchase mystery boxes through the merchant's existing storefront, complete checkout normally, then unbox their purchases on an app-hosted animated Reveal page after payment. The app automatically manages inventory (decrementing revealed Items, disabling boxes when stock runs out) and provides an analytics dashboard so merchants can track performance.

## User Stories

### Merchant — Box Creation & Management

1. As a merchant, I want to create a Single Item Box by selecting a Shopify product as the wrapper and adding Items (variants) with weighted Chances, so that I can define what customers might receive.
2. As a merchant, I want to create a Bundle Box with multiple Sets, each containing Items with their own Chances, so that I can sell a single box that gives customers multiple surprise items.
3. As a merchant, I want to see the total Chance sum for each pool and be warned if it doesn't equal 100%, so that I don't publish misconfigured boxes.
4. As a merchant, I want Items with the same Chance to automatically share the same Color, so that the odds visualization is consistent in the admin and storefront.
5. As a merchant, I want to save a Box Definition as a draft, so that I can work on it without making it available to customers.
6. As a merchant, I want to set a Box Definition to active, so that customers can discover and purchase it on the storefront.
7. As a merchant, I want to set a Box Definition to inactive, so that I can temporarily pause sales without deleting the definition.
8. As a merchant, I want to edit an existing Box Definition's Items, Chances, Colors, and advanced settings, so that I can adjust based on performance or inventory changes.
9. As a merchant, I want to delete a Box Definition I no longer need, so that my box list stays clean.
10. As a merchant, I want to see all my Box Definitions in a table with status, type, and inventory, so that I can manage them at a glance.
11. As a merchant, I want to be prevented from using the same Shopify product for multiple Box Definitions, so that each box has a unique storefront listing.

### Merchant — Smart Stock Management

12. As a merchant, I want to enable Smart Stock Management on a Box Definition, so that the box is automatically set to inactive when any of its Items goes out of stock.
13. As a merchant, I want Smart Stock Management to prevent customers from purchasing boxes whose Items can't be fulfilled, so that I avoid disappointing customers with unfulfillable reveals.

### Merchant — Bundle Box Advanced Settings

14. As a merchant, I want to enable Prevent Duplicate Bundle Selections on a Bundle Box, so that a customer never receives the same Item in multiple Sets within one order.

### Merchant — Box Design Personalization

15. As a merchant, I want to choose from preset animation styles for the unboxing page, so that the reveal experience matches my brand.
16. As a merchant, I want to upload a custom box image for the pre-unbox state, so that the closed box looks like my brand's packaging.
17. As a merchant, I want to upload a custom sound effect that plays when the box opens, so that the reveal is multisensory and on-brand.
18. As a merchant, I want to set a custom background color or image for the unboxing page, so that it feels like a cohesive brand experience.

### Customer — Storefront Discovery

19. As a customer, I want to see a mystery box product listing page with a description of the concept and visible odds, so that I understand what I might get before purchasing.
20. As a customer, I want the mystery box to appear as a normal Shopify product in the storefront (collections, search, cart), so that the purchase experience is familiar.
21. As a customer, I want to add a mystery box to my cart and check out through the standard Shopify checkout, so that I can pay using the merchant's usual payment methods.

### Customer — Unboxing Experience

22. As a customer, I want to see a prompt to unbox my mystery box on the order thank-you page, so that I can experience the reveal immediately after purchase.
23. As a customer, I want to be taken to a dedicated unboxing page with a visually engaging animation, so that the reveal feels exciting and shareable.
24. As a customer, I want the unboxing animation to reveal which Item(s) I received, so that the surprise is preserved up to the moment of opening.
25. As a customer, I want to revisit my previously revealed boxes later, so that I can see what I got again without re-randomizing.
26. As a customer with a Bundle Box, I want to open Sets one at a time, so that the suspense builds with each reveal.
27. As a customer with a Bundle Box, I want a "Reveal All" option to open every Set at once, so that I can see everything quickly if I prefer.
28. As a customer with a Bundle Box, I want an "Auto-play" option to open Sets sequentially with a brief delay, so that I can enjoy a hands-free reveal sequence.
29. As a customer who bought multiple Single Item Boxes in one order, I want to batch-open them with the same multi-unbox options, so that I can control the pace of my reveals.

### Customer — Fairness & Guarantees

30. As a customer who purchases a Bundle Box with duplicate prevention enabled, I want to be guaranteed that I won't receive the same Item in multiple Sets, so that I feel the box is fair value.

### Merchant — Analytics

31. As a merchant, I want to see total boxes sold and total revenue over a configurable date range, so that I understand the financial performance of my mystery boxes.
32. As a merchant, I want to see a breakdown of which Items are being revealed and how often (reveal distribution), so that I can adjust Chances or inventory allocation.
33. As a merchant, I want to see the open rate (what percentage of purchased boxes have been opened), so that I know whether customers are engaging with the unboxing experience.
34. As a merchant, I want to filter analytics by individual Box Definition, so that I can compare performance across different campaigns.
35. As a merchant, I want to export analytics data as CSV, so that I can do my own analysis in spreadsheet tools.

### System — Inventory Integrity

36. As a system, I want to decrement the revealed Item's Shopify inventory at the moment of Reveal, so that Shopify remains the single source of truth for stock levels.
37. As a system, I want to automatically detect when a box's Items go out of stock and disable the Box Definition, so that Smart Stock Management works without merchant intervention.

## Implementation Decisions

### Architecture

- **Storefront via Theme App Extension + App Proxy** (ADR-0001). Product discovery and post-purchase CTAs use Shopify Theme App Extension blocks. The unboxing animation lives on an app-hosted React page served through Shopify App Proxy. Headless Hydrogen storefront was rejected due to hosting complexity and theme incompatibility.
- **Post-purchase Reveal with managed inventory** (ADR-0002). Random Item selection happens after payment during the unboxing experience, preserving the mystery. Inventory is decremented via the Shopify Admin API at reveal time, keeping Shopify as the single source of truth.
- **Local markdown issue tracker.** Issues and PRDs live under `.scratch/<feature-slug>/`.

### Modules

**Randomization Engine** — Deep module. Pure function that takes a Box Definition (Item pool with Chances), optional constraints (Prevent Duplicate Bundle Selections), and any previous Reveals (to filter duplicates), and returns one or more Reveals. Handles weighted random selection and duplicate prevention. No I/O, fully testable in isolation.

**Inventory Manager** — Deep module. Wraps Shopify Admin GraphQL API for inventory operations. Provides: stock level checks across Item variants, single-variant inventory decrement on Reveal, and Box Definition status updates (set to inactive) when stock reaches zero. Used by both the Reveal flow and Smart Stock Management.

**Order Processor** — Deep module. Handles the `orders/create` Shopify webhook. Parses the order payload, identifies line items that correspond to mystery box products (by cross-referencing MysteryBox records), and creates BoxPurchase records for each qualifying line item. Links the Shopify order and line item IDs to the Box Definition.

**Unboxing Orchestrator** — Deep module. Coordinates the reveal flow: loads the BoxPurchase, calls the Randomization Engine to select Items, persists Reveal records, calls the Inventory Manager to decrement stock, and returns the result for UI rendering. Enforces that a BoxPurchase can only be revealed once (idempotent — subsequent calls return the existing Reveal without re-randomizing).

**Analytics Engine** — Deep module. Queries BoxPurchase and BoxReveal records to produce dashboard metrics: total boxes sold, total revenue, reveal distribution (which Items picked most), open rate, per-Box-Definition breakdowns. Supports date range filtering and CSV export.

### Theme App Extension blocks

Two blocks:
- **Product page block** — Injected on the mystery box product template. Displays box description, Item pool odds visualization (using Colors to group equal-Chance Items), and add-to-cart integration. Renders through standard Shopify Liquid/JS.
- **Thank-you page block** — Injected on the order status / thank-you page. Scans the order for mystery box line items (via an app API call), displays "You have N mystery boxes to open!" with a button linking to the App Proxy unbox page.

### App Proxy unbox page

A React route served through Shopify App Proxy (e.g., `/apps/mystify/unbox`). Receives a Box Purchase identifier. Loads the Box Definition's design customization (animation style, box image, sound, background). Renders the unboxing animation using the selected style and merchant's assets. Provides multi-unbox controls: "Open One" (one Set at a time), "Reveal All" (all Sets/boxes at once), "Auto-play" (sequential with delay). Shows previously revealed Box Purchases on revisit.

### Box Design personalization

New Prisma model `BoxDesign` (one-to-one with MysteryBox). Fields: `animationStyle` (enum of preset styles), `boxImageUrl` (merchant-uploaded closed-box image), `openSoundUrl` (merchant-uploaded reveal sound), `backgroundColor` (hex), `backgroundImageUrl`. Admin UI provides a design tab or section on the box edit page for these settings.

### Prisma schema changes

New models:
- `BoxPurchase` — `id`, `shop`, `orderId`, `orderLineItemId`, `mysteryBoxId`, `quantity`, `status` (enum: `unopened`, `opened`), `createdAt`, `openedAt`. Links an order line item to a Box Definition.
- `BoxReveal` — `id`, `boxPurchaseId`, `setId` (null for Single Item Boxes, set index for Bundle Boxes), `variantId`, `itemName`, `createdAt`. One per Set for bundles, one per box for single-item.
- `BoxDesign` — `id`, `mysteryBoxId` (unique, foreign key), `animationStyle`, `boxImageUrl`, `openSoundUrl`, `backgroundColor`, `backgroundImageUrl`.

Existing model modification:
- `MysteryBox` — no structural changes needed. The itemConfig and bundleConfig JSON fields already store the Item pool. Design customization goes in the separate BoxDesign model.

### Webhooks

New webhook subscription needed:
- `orders/create` — triggers Order Processor. Must be registered with appropriate access scopes (`read_orders`).

Existing webhooks (already configured):
- `app/uninstalled` — session cleanup (already implemented).
- `app/scopes_update` — already subscribed.

### Smart Stock Management implementation

When Smart Stock Management is enabled on a Box Definition, the Inventory Manager periodically (or via webhook `inventory_levels/update`) checks stock of all Item variants in the box. If any Item reaches zero inventory, the Box Definition's Box Status is set to `inactive`. The merchant can manually re-enable it after restocking.

### Shopify Admin API scopes

New scopes required beyond existing `write_products`:
- `read_orders` — to receive `orders/create` webhooks and read order line items
- `write_inventory` — to decrement Item variant inventory on Reveal
- `read_inventory` — to check stock levels for Smart Stock Management

### Analytics data flow

The Analytics Engine runs database queries against BoxPurchase and BoxReveal records. Revenue is calculated by joining BoxPurchase to the order's financial data (available from the Shopify order webhook payload at purchase time — store the line item price in BoxPurchase). The dashboard admin route calls the Analytics Engine and renders charts (using a lightweight charting component). CSV export generates a raw data file for download.

## Testing Decisions

### What makes a good test

Tests verify external behavior (input → output), not implementation details. Each test sets up an input state, calls the module's public interface, and asserts the expected output. Internal refactoring should not break tests.

### Modules to test

All five deep modules:

- **Randomization Engine** — Test weighted selection accuracy over many trials (statistical distribution matches chances within tolerance), duplicate prevention correctly filters already-revealed Items, total chance validation, edge cases (empty pool, single item, all items same chance).
- **Inventory Manager** — Test stock check returns correct levels, inventory decrement sends correct Shopify API calls, Smart Stock Management correctly detects OOS and triggers Box Status change.
- **Order Processor** — Test webhook payload parsing correctly identifies mystery box line items, creates BoxPurchase records with correct fields, handles orders with no mystery box products gracefully.
- **Unboxing Orchestrator** — Test end-to-end reveal flow: creates Reveal, decrements inventory, returns correct result. Test idempotency: calling openBox twice on the same BoxPurchase returns the same Reveal without re-decrementing.
- **Analytics Engine** — Test dashboard metrics queries return correct counts and sums, date range filtering works, per-box breakdowns are correct, CSV export produces valid output.

### Prior art

This project has no existing tests. The test pattern established here will serve as prior art for future work. Use a lightweight test runner compatible with the project's TypeScript + React Router setup (Vitest, given the Vite-based build).

## Out of Scope

- Pre-purchase randomization (item known before payment)
- Headless Hydrogen storefront
- Auto-adjusting Chances based on remaining inventory (Chances are always merchant-defined)
- Multi-language / internationalization support
- Customer accounts integration (saving unbox history to customer profiles beyond the order link)
- Email notifications for unboxing
- Social sharing of reveals
- Checkout UI extensions (customizing the checkout page itself)
- Subscription / recurring mystery boxes
- Wholesale or B2B mystery box configurations

## Further Notes

- The admin box creation UI already exists for Single Item Boxes and Bundle Boxes. This work extends the system to make the boxes functional end-to-end rather than admin-only definitions.
- The `lib/api/mystify/api.ts` mock API class should be replaced or removed once the real Order Processor and Unboxing Orchestrator are in place.
- The `lib/api/utils/box.ts` file is currently empty — it may serve as the home for the Randomization Engine or be replaced.
- The `extensions/` directory is empty and will be populated by the Theme App Extension scaffolding.
- App Proxy configuration must be added to `shopify.app.toml` to expose the unbox page route.
- Access scope changes in `shopify.app.toml` require app reinstallation by merchants.
