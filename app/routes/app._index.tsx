import { useEffect, useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
// import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { API } from "app/lib/api/mysify/api";
import { TBoxTable } from "app/lib/api/mysify/schema";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const [tableData, setTableData] = useState<TBoxTable[]>([]);
  const mystifyApi = new API();

  useEffect(() => {
    mystifyApi.fetchBoxTableData().then((response) => {
      setTableData(response);
    });
  });

  return (
    <s-page heading="Mystery Box">
      <s-section padding="none">
        <s-table>
          <s-table-header-row>
            <s-table-header></s-table-header>
            <s-table-header>Box Name</s-table-header>
            <s-table-header>Type</s-table-header>
            <s-table-header>Status</s-table-header>
            <s-table-header>Inventory</s-table-header>
            <s-table-header></s-table-header>
          </s-table-header-row>
          <s-table-body>
            {tableData.map((row, idx) => (
              <s-table-row key={idx}>
                <s-table-cell></s-table-cell>
                <s-table-cell>{row.boxName}</s-table-cell>
                <s-table-cell>
                  {row.type === "bundle" ? "Bundle" : "Single Item"}
                </s-table-cell>
                <s-table-cell>
                  <s-badge
                    tone={row.status === "active" ? "success" : "critical"}
                  >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </s-badge>
                </s-table-cell>
                <s-table-cell>—</s-table-cell>
                <s-table-cell>
                  <s-stack gap="small-500" direction="inline">
                    <s-button
                      variant="secondary"
                      icon="edit"
                      accessibilityLabel="edit"
                    />
                    <s-button
                      variant="secondary"
                      icon="delete"
                      accessibilityLabel="delete"
                    />
                  </s-stack>
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
