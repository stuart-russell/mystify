import {
  safeParseCreateBoxPostPayload,
  TBoxType,
  TBundleBoxConfig,
  TCreateBoxPostPayload,
  TCreateBoxStatus,
  TSingleItemBoxConfig,
} from "app/lib/api/mystify/schema";
import { useState, useRef, useEffect, useMemo } from "react";
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { SelectProduct } from "app/components/selectProduct";
import { SelectBoxType } from "app/components/selectBoxType";
import { CreateBundleBox } from "app/components/createBundleBox";
import { CreateSingleItemBox } from "app/components/createSingleItemBox";
("app/lib/api/shopify/api");
import { TProduct, TVariantSelection } from "app/lib/api/shopify/schema";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useNavigate,
  useFetcher,
  useLoaderData,
} from "react-router";
import { authenticate } from "app/shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  // @ts-ignore: Ignore type error if Prisma type is not recognized
  const existingBoxes = await (db as any).mysteryBox.findMany({
    where: { shop: session.shop },
    select: { productId: true },
  });

  return { usedProductIds: existingBoxes.map((box: { productId: any; }) => box.productId) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const response = await admin.graphql(
    `#graphql
    query productInfo($id: ID!) {
      product(id: $id) {
        title
        description
        totalInventory
        variants(first: 1) {
          nodes {
            price
          }
        }
        media(first: 1) {
          nodes {
            preview {
              image {
                url
              }
            }
          }
        }
      }
    }`,
    {
      variables: {
        id: formData.get("productId")?.toString() || "",
      },
    },
  );
  const responseJson = await response.json();

  const image = responseJson.data?.product?.media.nodes[0]?.preview?.image?.url
    ? responseJson.data.product.media.nodes[0].preview.image.url
    : "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png";

  const price = responseJson.data?.product?.variants.nodes[0]?.price
    ? `${responseJson.data.product.variants.nodes[0].price}`
    : `N/A`;

  return {
    title: responseJson.data?.product?.title || "Mystery Box Product Title",
    image: image,
    price: price,
    description:
      responseJson.data?.product?.description.replace(/<[^>]*>/g, "") ||
      "This is a brief description of the product inside the mystery box. It gives an overview of what to expect.",
    inventory: responseJson.data?.product?.totalInventory || 0,
  };
};

export default function Index() {
  const { usedProductIds } = useLoaderData<typeof loader>();
  const defaultProduct: TProduct = {
    title: "Mystery Box Product Title",
    description:
      "This is a brief description of the product inside the mystery box. It gives an overview of what to expect.",
    price: "N/A",
    image:
      "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png",
    inventory: 0,
  };
  const [selectedType, setSelectedType] = useState<TBoxType>();
  const [boxStatus, setBoxStatus] = useState<TCreateBoxStatus>("draft");
  const [selectedProduct, setSelectedProduct] = useState<TProduct>(defaultProduct);
  const [productId, setProductId] = useState<string>("");
  const [boxConfigValid, setBoxConfigValid] = useState<boolean>(false);
  const [smartStockManagement, setSmartStockManagement] =
    useState<boolean>(false);
  const [preventDuplicateBundleSelections, setPreventDuplicateBundleSelections] =
    useState<boolean>(false);
  const [showSmartStockHint, setShowSmartStockHint] = useState<boolean>(false);
  const [showPreventDuplicateHint, setShowPreventDuplicateHint] =
    useState<boolean>(false);
  const [singleItemConfig, setSingleItemConfig] =
    useState<TSingleItemBoxConfig | null>(null);
  const [bundleConfig, setBundleConfig] = useState<TBundleBoxConfig | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const boxTypeInputRef = useRef<HTMLInputElement>(null);
  const productIdInputRef = useRef<HTMLInputElement>(null);
  const boxStatusInputRef = useRef<HTMLInputElement>(null);

  const appBridge = useAppBridge();
  const usedProductIdSet = useMemo(() => new Set(usedProductIds), [usedProductIds]);
  const isDuplicateProduct = useMemo(
    () => productId !== "" && usedProductIdSet.has(productId),
    [productId, usedProductIdSet],
  );

  // Trigger form change event when state changes
  useEffect(() => {
    if (boxTypeInputRef.current && selectedType !== undefined) {
      boxTypeInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, [selectedType]);

  useEffect(() => {
    if (productIdInputRef.current && productId) {
      productIdInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, [productId]);

  useEffect(() => {
    if (boxStatusInputRef.current) {
      boxStatusInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, [boxStatus]);

  // Check if form is valid for active status
  const canBeActive = useMemo(() => {
    const hasBoxType = selectedType !== undefined;
    const hasProduct =
      productId !== "" &&
      selectedProduct.title !== "Mystery Box Product Title";
    return hasBoxType && hasProduct && boxConfigValid && !isDuplicateProduct;
  }, [
    selectedType,
    productId,
    selectedProduct.title,
    boxConfigValid,
    isDuplicateProduct,
  ]);

  // Auto-revert to draft if form becomes invalid while active
  useEffect(() => {
    if (boxStatus === "active" && !canBeActive) {
      setBoxStatus("draft");
    }
  }, [boxStatus, canBeActive]);

  // Prevent selecting active if form is invalid
  const handleStatusChange = (value: string) => {
    if (value === "active" && !canBeActive) {
      return; // Don't allow changing to active if form is invalid
    }
    setBoxStatus(value as TCreateBoxStatus);
  };

  const handleTypeSelection = (type: TBoxType) => {
    setSelectedType(type);
  };

  const fetcher = useFetcher<typeof action>();
  const saveFetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const navigate = useNavigate();

  const routeToProductCreation = async (): Promise<string> => {
    if (!appBridge.intents.invoke) return Promise.resolve("");
    const productCreateActivity = await appBridge.intents.invoke(
      "create:shopify/Product",
    );
    const productCreateResponse = (await productCreateActivity.complete) as {
      data: { id: string };
    };
    const id = productCreateResponse.data.id;
    setProductId(id);
    return id;
  };

  useEffect(() => {
    setSingleItemConfig(null);
    setBundleConfig(null);
    setPreventDuplicateBundleSelections(false);
    setShowPreventDuplicateHint(false);
  }, [selectedType]);

  const parsedPayload = useMemo<TCreateBoxPostPayload | null>(() => {
    if (!selectedType || !productId) return null;

    let payload: TCreateBoxPostPayload | null = null;
    if (selectedType === "item" && singleItemConfig) {
      payload = {
        boxType: "item",
        productId,
        productTitle: selectedProduct.title,
        boxStatus,
        smartStockManagement,
        config: singleItemConfig,
      };
    }

    if (selectedType === "bundle" && bundleConfig) {
      payload = {
        boxType: "bundle",
        productId,
        productTitle: selectedProduct.title,
        boxStatus,
        smartStockManagement,
        preventDuplicateBundleSelections,
        config: bundleConfig,
      };
    }

    if (!payload) return null;
    const parsed = safeParseCreateBoxPostPayload(payload);
    return parsed.success ? parsed.data : null;
  }, [
    selectedType,
    productId,
    boxStatus,
    smartStockManagement,
    preventDuplicateBundleSelections,
    singleItemConfig,
    bundleConfig,
  ]);

  const itemConfigJson = useMemo(() => {
    if (!parsedPayload || parsedPayload.boxType !== "item") return "";
    return JSON.stringify(parsedPayload.config);
  }, [parsedPayload]);

  const bundleConfigJson = useMemo(() => {
    if (!parsedPayload || parsedPayload.boxType !== "bundle") return "";
    return JSON.stringify(parsedPayload.config);
  }, [parsedPayload]);
  const hasSelectedProduct =
    productId !== "" && selectedProduct.title !== "Mystery Box Product Title";

  const hasFormChanges = useMemo(() => {
    return (
      selectedType !== undefined ||
      productId !== "" ||
      boxStatus !== "draft" ||
      smartStockManagement ||
      preventDuplicateBundleSelections ||
      singleItemConfig !== null ||
      bundleConfig !== null
    );
  }, [
    selectedType,
    productId,
    boxStatus,
    smartStockManagement,
    preventDuplicateBundleSelections,
    singleItemConfig,
    bundleConfig,
  ]);

  const resetFormState = () => {
    setSelectedType(undefined);
    setBoxStatus("draft");
    setSelectedProduct(defaultProduct);
    setProductId("");
    setBoxConfigValid(false);
    setSmartStockManagement(false);
    setPreventDuplicateBundleSelections(false);
    setShowSmartStockHint(false);
    setShowPreventDuplicateHint(false);
    setSingleItemConfig(null);
    setBundleConfig(null);
  };

  useEffect(() => {
    if (saveFetcher.data?.ok) {
      void appBridge.saveBar.hide?.("create-box-save-bar");
      resetFormState();
      void navigate("/app");
    }
  }, [appBridge.saveBar, saveFetcher.data, navigate]);

  useEffect(() => {
    return () => {
      void appBridge.saveBar.hide?.("create-box-save-bar");
    };
  }, [appBridge.saveBar]);

  return (
    <s-page heading="Create a New Mystery Box">
      <SaveBar id="create-box-save-bar" open={hasFormChanges}>
        <button
          variant="primary"
          type="button"
          disabled={
            !parsedPayload || saveFetcher.state !== "idle" || isDuplicateProduct
          }
          onClick={() => {
            if (!formRef.current) return;
            saveFetcher.submit(formRef.current, {
              method: "post",
              action: "/app/createBox/save",
            });
          }}
        >
          Save
        </button>
        <button type="reset" form="create-box-form">
          Discard
        </button>
      </SaveBar>
      <form
        id="create-box-form"
        ref={formRef}
        method="post"
        action="/app/createBox/save"
        onReset={resetFormState}
      >
        {/* Hidden inputs for form data */}
        <input
          ref={boxTypeInputRef}
          type="hidden"
          name="boxType"
          value={selectedType || ""}
        />
        <input
          ref={productIdInputRef}
          type="hidden"
          name="productId"
          value={productId}
        />
        <input type="hidden" name="productTitle" value={selectedProduct.title} />
        <input
          ref={boxStatusInputRef}
          type="hidden"
          name="boxStatus"
          value={boxStatus}
        />
        <input
          type="hidden"
          name="smartStockManagement"
          value={smartStockManagement ? "true" : "false"}
        />
        <input
          type="hidden"
          name="preventDuplicateBundleSelections"
          value={preventDuplicateBundleSelections ? "true" : "false"}
        />
        <input type="hidden" name="itemConfig" value={itemConfigJson} />
        <input type="hidden" name="bundleConfig" value={bundleConfigJson} />
        <s-box padding="base"></s-box>
        <s-box padding="small-200"></s-box>
        <s-stack
          direction="inline"
          paddingBlockEnd="base"
          gap="large"
          justifyContent="space-between"
        >
          <s-box>
            <s-heading>Select Box Type</s-heading>
          </s-box>
          <s-box></s-box>
        </s-stack>
        <s-grid
          gridTemplateColumns="repeat(2, 1fr)"
          gap="small"
          justifyContent="center"
        >
          <SelectBoxType
            handleTypeSelection={handleTypeSelection}
            selectedType={selectedType}
          />
        </s-grid>
        <s-box padding="base"></s-box>

        {selectedType && (
          <>
            <SelectProduct
              selectedProduct={selectedProduct}
              routeToProductCreation={routeToProductCreation}
              setSelectedProduct={setSelectedProduct}
              productFetcher={fetcher}
              setProductId={setProductId}
            />
            {isDuplicateProduct ? (
              <s-box paddingBlockStart="small-200">
                <s-banner tone="warning">
                  This product is already used by another mystery box. Select a
                  different product.
                </s-banner>
              </s-box>
            ) : null}
            {saveFetcher.data?.error ? (
              <s-box paddingBlockStart="small-200">
                <s-banner tone="critical">{saveFetcher.data.error}</s-banner>
              </s-box>
            ) : null}
          </>
        )}
        <s-box padding="small-300"></s-box>
        {hasSelectedProduct ? (
          <>
            <s-heading>Configure Box</s-heading>
            <s-box padding="small-200"></s-box>
            <s-section>
              {selectedType == "bundle" ? (
                <CreateBundleBox
                  onValidationChange={setBoxConfigValid}
                  onConfigChange={setBundleConfig}
                />
              ) : (
                <CreateSingleItemBox
                  onValidationChange={setBoxConfigValid}
                  onConfigChange={setSingleItemConfig}
                />
              )}
            </s-section>
          </>
        ) : null}
        {hasSelectedProduct ? (
          <>
            <s-box padding="small-300"></s-box>
            <s-heading>Advanced Settings</s-heading>
            <s-box padding="small-200"></s-box>
            <s-section>
              <s-stack gap="small">
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <input
                        type="checkbox"
                        checked={smartStockManagement}
                        onChange={(e) =>
                          setSmartStockManagement(e.currentTarget.checked)
                        }
                      />
                      Smart stock management
                    </label>
                    <s-button
                      variant="tertiary"
                      onClick={() => setShowSmartStockHint((value) => !value)}
                      accessibilityLabel="Smart stock management help"
                    >
                      {showSmartStockHint ? <s-icon type="chevron-up" /> : <s-icon type="chevron-down" />}
                    </s-button>
                  </div>
                  {showSmartStockHint ? (
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "6px 10px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        background: "#f6f6f7",
                        fontSize: "12px",
                        lineHeight: "1.4",
                      }}
                    >
                      When enabled, stock handling can use smarter logic for
                      mystery-box allocation and availability.
                    </div>
                  ) : null}
                </div>
                {selectedType === "bundle" ? (
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={preventDuplicateBundleSelections}
                          onChange={(e) =>
                            setPreventDuplicateBundleSelections(
                              e.currentTarget.checked,
                            )
                          }
                        />
                        Prevent duplicate product selections across sets
                      </label>
                      <s-button
                        variant="tertiary"
                        onClick={() =>
                          setShowPreventDuplicateHint((value) => !value)
                        }
                        accessibilityLabel="Prevent duplicate selections help"
                      >
                        {showPreventDuplicateHint ? <s-icon type="chevron-up" /> : <s-icon type="chevron-down" />}
                      </s-button>
                    </div>
                    {showPreventDuplicateHint ? (
                      <div
                        style={{
                          marginTop: "6px",
                          padding: "6px 10px",
                          border: "1px solid #d9d9d9",
                          borderRadius: "6px",
                          background: "#f6f6f7",
                          fontSize: "12px",
                          lineHeight: "1.4",
                        }}
                      >
                        When enabled, the same product can only appear in one
                        bundle set, even if selected multiple times.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </s-stack>
            </s-section>
          </>
        ) : null}
        <s-box padding="small-300"></s-box>
        <s-heading>Box Status</s-heading>
        <s-box padding="small-200"></s-box>
        <s-section>
          <s-box paddingBlockEnd="base">
          <s-select
            value={boxStatus}
            onChange={(e) => handleStatusChange(e.currentTarget.value)}
            disabled={boxStatus === "active" && !canBeActive}
          >
            <s-option value="draft">Draft</s-option>
            <s-option value="active" disabled={!canBeActive}>
              Active
            </s-option>
            <s-option value="inactive">Inactive</s-option>
          </s-select>
        </s-box>
        </s-section>
      </form>
    </s-page>
  );
}
