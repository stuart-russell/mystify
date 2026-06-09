import type { PrismaClient } from "@prisma/client";

type DashboardMetrics = {
  totalBoxesSold: number;
  totalRevenue: number;
  openRate: number;
};

export async function getDashboardMetrics(
  prisma: PrismaClient,
  shop: string,
): Promise<DashboardMetrics> {
  const purchases = await prisma.boxPurchase.findMany({
    where: { shop },
  });

  const totalBoxesSold = purchases.length;
  const totalRevenue = purchases.reduce(
    (sum, p) => sum + parseFloat(p.price ?? "0"),
    0,
  );

  const openedCount = purchases.filter((p) => p.status === "opened").length;
  const openRate = totalBoxesSold > 0 ? (openedCount / totalBoxesSold) * 100 : 0;

  return {
    totalBoxesSold,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    openRate: Math.round(openRate * 100) / 100,
  };
}

type RevealDistributionItem = {
  variantId: string;
  itemName: string;
  count: number;
  percentage: number;
};

export async function getRevealDistribution(
  prisma: PrismaClient,
  shop: string,
): Promise<RevealDistributionItem[]> {
  const reveals = await prisma.boxReveal.findMany({
    where: { boxPurchase: { shop } },
  });

  const total = reveals.length;
  if (total === 0) return [];

  const counts = new Map<string, { variantId: string; itemName: string; count: number }>();
  for (const reveal of reveals) {
    const existing = counts.get(reveal.variantId);
    if (existing) {
      existing.count++;
    } else {
      counts.set(reveal.variantId, {
        variantId: reveal.variantId,
        itemName: reveal.itemName,
        count: 1,
      });
    }
  }

  return [...counts.values()].map((entry) => ({
    ...entry,
    percentage: Math.round((entry.count / total) * 100),
  }));
}
