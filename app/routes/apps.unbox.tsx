import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const boxPurchaseId = url.searchParams.get("boxPurchaseId");

  return { boxPurchaseId };
};

export default function UnboxPage() {
  const { boxPurchaseId } = useLoaderData<typeof loader>();

  if (!boxPurchaseId) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Mystify</h1>
        <p>No mystery box specified. Please use the link from your order confirmation.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Mystify</h1>
      <p>Unbox your mystery box!</p>
      <p>Box Purchase: {boxPurchaseId}</p>
    </div>
  );
}
