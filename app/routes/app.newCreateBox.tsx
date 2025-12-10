import { ExistingBoxTable } from "app/components/existingBoxTable";
import { API } from "app/lib/api/mysify/api";
import { TBoxTable } from "app/lib/api/mysify/schema";
import { useEffect, useState } from "react";

export default function Index() {
  const [tableData, setTableData] = useState<TBoxTable[]>([]);
  const mystifyApi = new API();

  useEffect(() => {
    mystifyApi.fetchBoxTableData().then((response) => {
      setTableData(response);
    });
  });
  return (
    <s-page>
      <s-box padding="base"></s-box>
      <s-stack
        direction="inline"
        paddingBlockEnd="base"
        gap="large"
        justifyContent="space-between"
      >
        <s-box>
          <s-heading>Select Box Type</s-heading>
        </s-box>
        <s-box>
          <s-button-group>
            <s-button slot="primary-action">Save</s-button>
            <s-button slot="secondary-actions">Cancel</s-button>
          </s-button-group>
        </s-box>
      </s-stack>
      <ExistingBoxTable tableData={tableData} />
    </s-page>
  );
}
