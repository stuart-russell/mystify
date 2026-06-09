# Storefront via Theme App Extension + App Proxy

The customer-facing mystery box experience uses Shopify Theme App Extension blocks (for product discovery and post-purchase calls-to-action) combined with an app-hosted unbox page served through Shopify App Proxy (for the React-based unboxing animation). We rejected a headless Hydrogen storefront because it is incompatible with the merchant's existing theme and adds hosting complexity; we rejected pure theme-block-only unboxing because Liquid/vanilla JS limits animation quality.
