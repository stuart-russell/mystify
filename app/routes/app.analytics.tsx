import { authenticate } from "app/shopify.server";
import { getDashboardMetrics, getRevealDistribution } from "app/lib/engine/analytics";
import db from "../db.server";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const metrics = await getDashboardMetrics(db, session.shop);
  const distribution = await getRevealDistribution(db, session.shop);
  return { metrics, distribution };
};

export default function AnalyticsPage() {
  const { metrics, distribution } = useLoaderData<typeof loader>();

  return (
    <s-page>
      <s-box padding="base">
        <s-heading>Analytics</s-heading>
      </s-box>
      <s-box padding="base">
        <s-stack gap="base">
          <s-grid gridTemplateColumns="repeat(3, 1fr)" gap="base">
            <s-box border="base" borderRadius="base" padding="base">
              <s-text type="subdued">Boxes Sold</s-text>
              <s-heading>{metrics.totalBoxesSold}</s-heading>
            </s-box>
            <s-box border="base" borderRadius="base" padding="base">
              <s-text type="subdued">Revenue</s-text>
              <s-heading>${metrics.totalRevenue.toFixed(2)}</s-heading>
            </s-box>
            <s-box border="base" borderRadius="base" padding="base">
              <s-text type="subdued">Open Rate</s-text>
              <s-heading>{metrics.openRate}%</s-heading>
            </s-box>
          </s-grid>

          {distribution.length > 0 ? (
            <s-section heading="Reveal Distribution">
              <s-stack gap="small">
                {distribution.map((item) => (
                  <s-box key={item.variantId}>
                    <s-stack direction="inline" gap="small" alignItems="center" justifyContent="space-between">
                      <s-text>{item.itemName}</s-text>
                      <s-text type="subdued">{item.count} ({item.percentage}%)</s-text>
                    </s-stack>
                    <s-box
                      borderRadius="base"
                      style={{
                        height: "8px",
                        width: `${item.percentage}%`,
                        backgroundColor: "#4f46e5",
                        marginTop: "4px",
                      }}
                    />
                  </s-box>
                ))}
              </s-stack>
            </s-section>
          ) : (
            <s-box padding="base">
              <s-text type="subdued">No reveal data yet. Boxes will appear here once customers open them.</s-text>
            </s-box>
          )}

          {metrics.totalBoxesSold > 0 ? (
            <s-box paddingBlockStart="base">
              <s-button
                variant="secondary"
                onClick={() => {
                  const csv = [
                    "variantId,itemName,count,percentage",
                    ...distribution.map(
                      (d) => `${d.variantId},"${d.itemName}",${d.count},${d.percentage}%`,
                    ),
                  ].join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "mystify-analytics.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export CSV
              </s-button>
            </s-box>
          ) : null}
        </s-stack>
      </s-box>
    </s-page>
  );
}
