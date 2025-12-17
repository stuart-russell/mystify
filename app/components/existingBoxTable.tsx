import { TBoxTable } from "app/lib/api/mystify/schema";

export function ExistingBoxTable({ tableData }: { tableData: TBoxTable[] }) {
  return (
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
              <s-badge tone={row.status === "active" ? "success" : "critical"}>
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
  );
}
