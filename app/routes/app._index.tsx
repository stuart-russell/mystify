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
          <s-heading>Manage Existing Boxes</s-heading>
        </s-box>
        <s-box>
          <s-link href="/app/createBox">
            <s-button>Create New Box</s-button>
          </s-link>
          <s-app-window
            id="create-box-window"
            src="/app/createBox"
          ></s-app-window>
        </s-box>
      </s-stack>
      <ExistingBoxTable tableData={tableData} />
    </s-page>
  );
}
