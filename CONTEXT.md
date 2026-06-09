# Mystify — Mystery Box Creator

A Shopify app that lets merchants create mystery box products, sell them through their storefront, and let customers unbox their purchases to reveal randomly-selected items.

## Language

### Core concepts

**Mystery Box (Box)**:
A Shopify product configured with rules for randomly selecting which items a customer receives. Managed by the merchant in the admin.
_Avoid_: Blind box, loot box, gashapon (these are valid marketing terms but not canonical in code).

**Box Definition**:
The admin-configured rules stored for a Mystery Box: which Shopify product wraps the box, the item pool with chances, and status.
_Avoid_: Box config, box settings.

**Single Item Box**:
A Mystery Box type where the customer receives exactly one randomly-selected item from a weighted pool.
_Avoid_: Solo box, single box.

**Bundle Box**:
A Mystery Box type containing multiple Sets. Each Set independently selects one random item. The customer receives one item per Set.
_Avoid_: Multi box, combo box.

**Set**:
A sub-pool within a Bundle Box. Each Set has its own items and chances summing to 100%. One item is selected per Set.
_Avoid_: Group, tier, slot.

**Item**:
A specific product variant available inside a Mystery Box pool or Set, with an assigned Chance and Color.
_Avoid_: Product, variant (used for raw Shopify product/variant entities).

**Chance**:
A percentage weight (0-100) assigned to each Item, determining its selection probability. All Items in a pool or Set must sum to exactly 100%.
_Avoid_: Odds, weight, probability.

**Color**:
A hex color label assigned to Items. Items with the same Chance value must share the same Color — used as a visual grouping cue in the admin and unboxing UI.
_Avoid_: Tag, label, category.

**Box Status**:
The lifecycle state of a Box Definition:
- **draft** — not visible to customers, configurable but not purchasable.
- **active** — visible and purchasable on the storefront.
- **inactive** — hidden from customers, typically set automatically or by merchant.
_Avoid_: Published, live, disabled, paused.

### Purchase & reveal

**Box Purchase**:
An instance of a customer purchasing a Mystery Box. Links one Order Line Item to a Box Definition. Tracks whether the box has been opened.
_Avoid_: Box order, box sale.

**Reveal**:
The result of opening a Box Purchase: the specific Item(s) selected by the randomization algorithm. One Reveal per Set (for bundles) or one per box (for single item).
_Avoid_: Unbox result, pull, draw.

**Unboxing**:
The customer-facing experience of opening their purchased Mystery Box and seeing the Reveal animation. Takes place on the app-hosted unbox page.
_Avoid_: Opening, revealing (noun form conflicts with Reveal).

**Opened Box / Unopened Box**:
A Box Purchase that has (or hasn't) been revealed. Used to track which boxes a customer still needs to open.
_Avoid_: Claimed/unclaimed, used/unused.

### Advanced features

**Smart Stock Management**:
When enabled on a Box Definition, the app monitors inventory of the box's Items and automatically sets the Box Status to `inactive` when any Item goes out of stock. This prevents selling boxes that can't be fulfilled.
_Avoid_: Auto-disable, stock guard.

**Prevent Duplicate Bundle Selections**:
When enabled on a Bundle Box, ensures a customer never receives the same Item in more than one Set within the same order.
_Avoid_: Unique guarantee, no-dup rule.

**Multi-unbox**:
A customer-facing option on the unbox page: open all Sets/boxes at once (versus one-at-a-time). Controlled by the customer at unbox time, not by admin config.
_Avoid_: Batch open, bulk reveal.

**Auto-unbox**:
A customer-facing option on the unbox page: Sets/boxes open automatically in sequence with a delay. Controlled by the customer at unbox time.
_Avoid_: Auto-play, sequential reveal.

## Relationships

- A **Box Definition** is either a **Single Item Box** or a **Bundle Box**.
- A **Single Item Box** contains one pool of **Items**, each with a **Chance** and **Color**.
- A **Bundle Box** contains one or more **Sets**. Each **Set** contains a pool of **Items**, each with a **Chance** and **Color**.
- A **Box Purchase** links one Shopify **Order Line Item** to one **Box Definition**.
- A **Box Purchase** produces one **Reveal** for a Single Item Box, or one **Reveal** per **Set** for a Bundle Box.
- Inventory is decremented on the revealed **Item**'s Shopify variant at the time of **Reveal**.

## Example dialogue

> **Dev:** "When a customer buys 3 Single Item Boxes in one order, do we create one Box Purchase or three?"
> **Domain expert:** "Three Box Purchases — one per line item quantity. Each one gets its own Reveal."
>
> **Dev:** "And if a Bundle Box has Smart Stock Management enabled, what exactly triggers the inactive status?"
> **Domain expert:** "Any Item in any Set going to zero inventory. The whole Box Definition goes inactive, not just the affected Set."
>
> **Dev:** "Can a Box Purchase be revealed more than once — like if the customer revisits the unbox page?"
> **Domain expert:** "No. A Reveal is immutable once created. Revisiting shows the same Reveal without re-randomizing."

## Flagged ambiguities

- "Product" was used to mean both a Shopify Product (the mystery box wrapper) and an Item (a variant inside the box). **Resolved:** **Item** is the canonical term for a variant inside a box pool.
- "Opening" was used ambiguously as both the verb form of Unboxing and as a noun. **Resolved:** **Unboxing** is the experience; **Reveal** is the result.
