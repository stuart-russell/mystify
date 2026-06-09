# Post-purchase reveal with managed inventory

The random Item selection (Reveal) happens after payment, during the unboxing experience, not before. This preserves the "mystery" — the customer doesn't know what they got until they unbox. We rejected pre-purchase randomization because it eliminates the surprise. We chose to auto-decrement the revealed Item's inventory via the Shopify Admin API at reveal time rather than tracking inventory separately, because it keeps Shopify as the single source of truth.
