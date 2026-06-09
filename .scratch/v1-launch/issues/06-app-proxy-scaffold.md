Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

Configure Shopify App Proxy to serve the unbox page, and create a basic React route scaffold.

**App Proxy config:** Add to `shopify.app.toml`:

```toml
[app_proxy]
url = "https://example.com/apps/mystify"
subpath = "unbox"
prefix = "apps"
```

This makes `https://<shop-domain>/apps/mystify/unbox` proxy to the app's `/apps/mystify/unbox` route.

**Route scaffold:** Create a React Router route that:
- Reads `boxPurchaseId` from query params
- Authenticates via `authenticate.public.appProxy` (this is how Shopify passes the shop identity through the proxy)
- Renders a placeholder page: "Unbox your mystery box!" with the BoxPurchase ID displayed
- Full animation UI comes in issue `07-unbox-page-ui`

**Use the existing `app/routes/` flat routes convention.** The route path should match the proxy subpath (e.g., `/apps/mystify/unbox` → create `app/routes/apps.mystify.unbox.tsx` or similar).

## Acceptance criteria

- [ ] App Proxy configured in `shopify.app.toml`
- [ ] Unbox route exists and is accessible via the proxy path
- [ ] Route authenticates with App Proxy auth
- [ ] Route reads `boxPurchaseId` from query parameters
- [ ] Placeholder page renders with the BoxPurchase ID

## Blocked by

None — can start immediately.
