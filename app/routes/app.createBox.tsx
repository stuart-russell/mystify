import { CreateBoxCarousel } from "app/components/createBoxCarousel";
import { CreateBoxPrompt } from "app/components/createBoxPrompt";

export default function AdditionalPage() {
  return (
    <s-page heading="Create a New Mystery Box">
      <CreateBoxCarousel />
      {/*<CreateBoxPrompt />*/}
    </s-page>
  );
}
