import { CreateMysteryBoxDialogue } from "app/components/createBoxDialogue";

export default function AdditionalPage() {
  return (
    <s-page heading="Create a New Mystery Box">
      <CreateMysteryBoxDialogue />
      {/*<s-box
        padding="base"
        background="subdued"
        border="base"
        borderRadius="base"
      >
        <s-box padding="none none base none">
          <s-stack>
            <s-heading>Choose your mystery box type</s-heading>
          </s-stack>
        </s-box>
        <s-grid
          gridTemplateColumns="repeat(2, 1fr)"
          gap="small"
          justifyContent="center"
        >
          <s-grid-item gridColumn="span 1" border="base" borderStyle="dashed">
            Orders
          </s-grid-item>
          <s-grid-item gridColumn="auto" border="base" borderStyle="dashed">
            Customers
          </s-grid-item>
        </s-grid>
      </s-box>*/}
    </s-page>
  );
}
