import { CreateMysteryBoxBanner } from "app/components/createBoxBanner";

export default function AdditionalPage() {
  return (
    <s-page heading="Create a New Mystery Box">
      <s-section padding="none">
        <CreateMysteryBoxBanner />
      </s-section>
    </s-page>
  );
}
