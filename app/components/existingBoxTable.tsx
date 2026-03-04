import { TBoxTable } from "app/lib/api/mystify/schema";
import { useFetcher, useLocation } from "react-router";

export function ExistingBoxTable({ tableData }: { tableData: TBoxTable[] }) {
  const fetcher = useFetcher();
  const location = useLocation();
  const deleteAction = location.search
    ? `${location.pathname}${location.search}&index`
    : `${location.pathname}?index`;

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
          <s-table-row key={row.id || idx}>
            <s-table-cell>
              <img
                src={row.imageUrl}
                alt={row.boxName}
                width={32}
                height={32}
                style={{
                  borderRadius: "6px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </s-table-cell>
            <s-table-cell>{row.boxName}</s-table-cell>
            <s-table-cell>
              {row.type === "bundle" ? "Bundle" : "Single Item"}
            </s-table-cell>
            <s-table-cell>
              <s-badge tone={row.status === "active" ? "success" : "critical"}>
                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
              </s-badge>
            </s-table-cell>
            <s-table-cell>{row.amount}</s-table-cell>
            <s-table-cell>
              <s-stack gap="small-500" direction="inline">
                <s-button
                  variant="tertiary"
                  icon="edit"
                  accessibilityLabel="edit"
                  href={`/app/boxes/${row.id}/edit`}
                />
                <fetcher.Form
                  method="post"
                  action={deleteAction}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `Delete "${row.boxName}"? This action cannot be undone.`,
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="boxId" value={row.id} />
                  <s-button
                    type="submit"
                    variant="tertiary"
                    icon="delete"
                    accessibilityLabel="delete"
                  />
                </fetcher.Form>
              </s-stack>
            </s-table-cell>
          </s-table-row>
        ))}
      </s-table-body>
    </s-table>
  );
}
