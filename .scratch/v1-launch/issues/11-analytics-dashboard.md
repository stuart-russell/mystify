Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

An analytics engine and admin dashboard page for merchants to track mystery box performance.

**Analytics Engine:**
A query module that aggregates data from BoxPurchase and BoxReveal. Functions:
- `getDashboardMetrics(shop, dateRange?)` → `{ totalBoxesSold, totalRevenue, openRate, avgItemsPerBox }`
- `getRevealDistribution(shop, boxId?, dateRange?)` → `[{ variantId, itemName, count, percentage }]` — which Items are revealed most
- `getPerBoxBreakdown(shop, dateRange?)` → `[{ mysteryBoxId, boxName, sold, revenue, openRate }]` — per-box performance
- `exportCSV(shop, dateRange?)` → CSV string of raw BoxPurchase + Reveal data

Revenue is calculated from the order data stored in BoxPurchase (need to add a `price` field to BoxPurchase during Order Processor creation — store the line item price from the webhook payload).

**Admin dashboard route:**
- New route: `/app/analytics` (add to admin nav in `app/routes/app.tsx`)
- Page layout:
  - Date range filter (preset: last 7 days, last 30 days, last 90 days, all time)
  - KPI cards: Total Boxes Sold, Total Revenue, Open Rate
  - Reveal Distribution chart: bar chart or pie chart showing which Items are most revealed (use a lightweight chart component — consider `recharts` or a simple CSS-based bar chart)
  - Per-Box Breakdown table: box name, sold, revenue, open rate
  - "Export CSV" button
- Fetch data from the Analytics Engine via loader function

**Revenue tracking:** Modify Order Processor (issue `03-order-processor`) or this issue to store the line item price in BoxPurchase. Add a `price` field (String) to the BoxPurchase model in the Prisma migration (issue `01-prisma-migration`).

**Tests:** Seed BoxPurchase + BoxReveal records and verify each query returns correct aggregations. Test CSV export format.

## Acceptance criteria

- [ ] Analytics Engine returns correct dashboard metrics, reveal distribution, per-box breakdown
- [ ] Admin dashboard route exists at `/app/analytics`
- [ ] Date range filter works correctly
- [ ] KPI cards show boxes sold, revenue, open rate
- [ ] Reveal distribution chart renders
- [ ] Per-box breakdown table renders
- [ ] CSV export produces valid CSV with correct data
- [ ] Admin nav includes Analytics link
- [ ] BoxPurchase.price field added to store line item price
- [ ] Tests pass for Analytics Engine queries

## Blocked by

- `01-prisma-migration` (needs BoxPurchase + BoxReveal models; needs price field on BoxPurchase)
- `03-order-processor` (needs price stored during purchase)
