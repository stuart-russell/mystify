import {
  safeParseCreateBoxPostPayload,
  TBoxType,
  TBundleBoxConfig,
  TCreateBoxPostPayload,
  TCreateBoxStatus,
  TSingleItemBoxConfig,
} from "app/lib/api/mystify/schema";
import { TProduct } from "app/lib/api/shopify/schema";
import { CreateBundleBox } from "app/components/createBundleBox";
import { CreateSingleItemBox } from "app/components/createSingleItemBox";
import { ProductCard } from "app/components/productDisplayCard";
import { authenticate } from "app/shopify.server";
import { Prisma } from "@prisma/client";
import { ColorPicker } from "antd";
import { boxDesign } from "../lib/engine/box-design";
import db from "../db.server";
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "react-router";

const FALLBACK_IMAGE_URL =
  "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png";

const parseJsonField = (value: string | null): unknown => {
  if (!value || value.length === 0) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toEditableBoxStatus = (value: string): TCreateBoxStatus => {
  if (value === "active") return "active";
  if (value === "inactive") return "inactive";
  return "draft";
};

type TVariantDetails = {
  itemName: string;
  image: string;
  inventory: number;
};

type TGraphqlAdmin = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ json: () => Promise<unknown> }>;
};

const formatVariantItemName = (productTitle: string, variantTitle: string) => {
  if (variantTitle === "Default Title") return productTitle;
  return `${productTitle} - ${variantTitle}`;
};

const loadVariantDetails = async (
  admin: TGraphqlAdmin,
  variantIds: string[],
): Promise<Map<string, TVariantDetails>> => {
  const uniqueVariantIds = [...new Set(variantIds)].filter(Boolean);
  const byId = new Map<string, TVariantDetails>();

  if (uniqueVariantIds.length === 0) return byId;

  const response = await admin.graphql(
    `#graphql
    query variantNodes($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on ProductVariant {
          id
          title
          inventoryQuantity
          product {
            title
            featuredImage {
              url
            }
          }
        }
      }
    }`,
    { variables: { ids: uniqueVariantIds } },
  );
  const responseJson = (await response.json()) as {
    data?: {
      nodes?: Array<{
        id?: string;
        title?: string;
        inventoryQuantity?: number;
        product?: { title?: string; featuredImage?: { url?: string } };
      } | null>;
    };
  };
  const nodes = responseJson.data?.nodes as
    | Array<{
        id?: string;
        title?: string;
        inventoryQuantity?: number;
        product?: { title?: string; featuredImage?: { url?: string } };
      } | null>
    | undefined;

  nodes?.forEach((node) => {
    if (!node?.id) return;
    byId.set(node.id, {
      itemName: formatVariantItemName(
        node.product?.title || "Unknown Product",
        node.title || "Default Title",
      ),
      image: node.product?.featuredImage?.url || FALLBACK_IMAGE_URL,
      inventory: node.inventoryQuantity || 0,
    });
  });

  return byId;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const boxId = params.boxId;

  if (!boxId) {
    throw new Response("Missing box id", { status: 400 });
  }

  const mysteryBox = await db.mysteryBox.findFirst({
    where: { id: boxId, shop: session.shop },
  });

  if (!mysteryBox) {
    throw new Response("Mystery box not found", { status: 404 });
  }

  const boxType: TBoxType = mysteryBox.boxType === "bundle" ? "bundle" : "item";
  const boxStatus = toEditableBoxStatus(mysteryBox.boxStatus);
  const parsedConfig =
    boxType === "item"
      ? safeParseCreateBoxPostPayload({
          boxType: "item",
          productId: mysteryBox.productId,
          productTitle: mysteryBox.productTitle,
          boxStatus,
          smartStockManagement: mysteryBox.smartStockManagement,
          config: parseJsonField(mysteryBox.itemConfig),
        })
      : safeParseCreateBoxPostPayload({
          boxType: "bundle",
          productId: mysteryBox.productId,
          productTitle: mysteryBox.productTitle,
          boxStatus,
          smartStockManagement: mysteryBox.smartStockManagement,
          preventDuplicateBundleSelections:
            mysteryBox.preventDuplicateBundleSelections,
          config: parseJsonField(mysteryBox.bundleConfig),
        });

  if (!parsedConfig.success) {
    throw new Response("Stored mystery box config is invalid", { status: 400 });
  }

  const initialSingleItemConfig: TSingleItemBoxConfig | null =
    parsedConfig.data.boxType === "item" ? parsedConfig.data.config : null;
  const initialBundleConfig: TBundleBoxConfig | null =
    parsedConfig.data.boxType === "bundle" ? parsedConfig.data.config : null;

  const productResponse = await admin.graphql(
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
        id: mysteryBox.productId,
      },
    },
  );
  const productResponseJson = await productResponse.json();

  const selectedProduct: TProduct = {
    title:
      productResponseJson.data?.product?.title ||
      mysteryBox.productTitle ||
      "Mystery Box Product Title",
    image:
      productResponseJson.data?.product?.media.nodes[0]?.preview?.image?.url ||
      FALLBACK_IMAGE_URL,
    price: productResponseJson.data?.product?.variants.nodes[0]?.price
      ? `${productResponseJson.data.product.variants.nodes[0].price}`
      : "N/A",
    description:
      productResponseJson.data?.product?.description?.replace(/<[^>]*>/g, "") ||
      "This is a brief description of the product inside the mystery box. It gives an overview of what to expect.",
    inventory: productResponseJson.data?.product?.totalInventory || 0,
  };

  const variantIds =
    boxType === "item"
      ? initialSingleItemConfig?.items.map((item) => item.variantId) || []
      : initialBundleConfig?.sets.flatMap((set) =>
          set.items.map((item) => item.variantId),
        ) || [];

  const variantDetails = await loadVariantDetails(admin, variantIds);

  const initialSingleItemItems =
    boxType === "item"
      ? initialSingleItemConfig?.items.map((item) => ({
          variantId: item.variantId,
          itemName: variantDetails.get(item.variantId)?.itemName || item.itemName,
          image: variantDetails.get(item.variantId)?.image || FALLBACK_IMAGE_URL,
          inventory: variantDetails.get(item.variantId)?.inventory || 0,
          chance: item.chance,
          color: item.color,
        })) || []
      : [];

  const initialBundleSets =
    boxType === "bundle"
      ? initialBundleConfig?.sets.map((set) => ({
          setId: set.setId,
          items: set.items.map((item) => ({
            variantId: item.variantId,
            itemName: variantDetails.get(item.variantId)?.itemName || item.itemName,
            image: variantDetails.get(item.variantId)?.image || FALLBACK_IMAGE_URL,
            inventory: variantDetails.get(item.variantId)?.inventory || 0,
            chance: item.chance,
            color: item.color,
          })),
        })) || []
      : [];

  const design =
    (await boxDesign.getByBoxId(db, boxId)) ??
    (await boxDesign.createDefault(db, boxId));

  return {
    boxId: mysteryBox.id,
    boxType,
    productId: mysteryBox.productId,
    productTitle: selectedProduct.title,
    boxStatus,
    smartStockManagement: mysteryBox.smartStockManagement,
    preventDuplicateBundleSelections: mysteryBox.preventDuplicateBundleSelections,
    selectedProduct,
    initialSingleItemConfig,
    initialBundleConfig,
    initialSingleItemItems,
    initialBundleSets,
    boxDesign: {
      animationStyle: design.animationStyle,
      boxImageUrl: design.boxImageUrl,
      openSoundUrl: design.openSoundUrl,
      backgroundColor: design.backgroundColor,
      backgroundImageUrl: design.backgroundImageUrl,
    },
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const boxId = params.boxId;

  if (!boxId) {
    return new Response(JSON.stringify({ error: "Missing box id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const mysteryBox = await db.mysteryBox.findFirst({
    where: { id: boxId, shop: session.shop },
  });

  if (!mysteryBox) {
    return new Response(JSON.stringify({ error: "Mystery box not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const boxType = formData.get("boxType");
  const productId = formData.get("productId");
  const productTitle = formData.get("productTitle");
  const boxStatus = formData.get("boxStatus");
  const smartStockManagement =
    formData.get("smartStockManagement")?.toString() === "true";
  const preventDuplicateBundleSelections =
    formData.get("preventDuplicateBundleSelections")?.toString() === "true";
  const itemConfig = parseJsonField(formData.get("itemConfig")?.toString() || null);
  const bundleConfig = parseJsonField(
    formData.get("bundleConfig")?.toString() || null,
  );

  const parsed = safeParseCreateBoxPostPayload({
    boxType,
    productId,
    productTitle,
    boxStatus,
    smartStockManagement,
    preventDuplicateBundleSelections,
    config: boxType === "item" ? itemConfig : bundleConfig,
  });

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid mystery box payload",
        issues: parsed.error.issues,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (parsed.data.boxType !== mysteryBox.boxType) {
    return new Response(
      JSON.stringify({ error: "Changing box type is not allowed during edit" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (parsed.data.productId !== mysteryBox.productId) {
    return new Response(
      JSON.stringify({ error: "Changing product is not allowed during edit" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const productResponse = await admin.graphql(
    `#graphql
    query getProduct($id: ID!) {
      product(id: $id) {
        id
      }
    }`,
    { variables: { id: parsed.data.productId } },
  );
  const productResponseJson = await productResponse.json();
  const productExists = Boolean(productResponseJson.data?.product?.id);

  if (!productExists) {
    return new Response(
      JSON.stringify({
        error: "Invalid productId for this shop",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const result = await db.mysteryBox.updateMany({
      where: { id: boxId, shop: session.shop },
      data: {
        productTitle: parsed.data.productTitle,
        boxStatus: parsed.data.boxStatus,
        smartStockManagement: parsed.data.smartStockManagement,
        preventDuplicateBundleSelections:
          parsed.data.boxType === "bundle"
            ? parsed.data.preventDuplicateBundleSelections
            : false,
        itemConfig:
          parsed.data.boxType === "item"
            ? JSON.stringify(parsed.data.config)
            : null,
        bundleConfig:
          parsed.data.boxType === "bundle"
            ? JSON.stringify(parsed.data.config)
            : null,
      },
    });

    if (result.count === 0) {
      return new Response(JSON.stringify({ error: "Mystery box not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await boxDesign.update(db, boxId, {
      animationStyle: formData.get("animationStyle")?.toString() || "default",
      boxImageUrl: formData.get("boxImageUrl")?.toString() || null,
      openSoundUrl: formData.get("openSoundUrl")?.toString() || null,
      backgroundColor: formData.get("backgroundColor")?.toString() || null,
      backgroundImageUrl: formData.get("backgroundImageUrl")?.toString() || null,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "This product already has a mystery box. Please select a different product.",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    throw error;
  }

  return Response.json({ ok: true });
};

export default function EditBox() {
  const loaderData = useLoaderData<typeof loader>();
  const {
    boxId,
    boxType,
    productId,
    productTitle,
    boxStatus: initialBoxStatus,
    smartStockManagement: initialSmartStockManagement,
    preventDuplicateBundleSelections: initialPreventDuplicateBundleSelections,
    selectedProduct,
    initialSingleItemConfig,
    initialBundleConfig,
    initialSingleItemItems,
    initialBundleSets,
  } = loaderData;

  const [boxStatus, setBoxStatus] = useState<TCreateBoxStatus>(initialBoxStatus);
  const [boxConfigValid, setBoxConfigValid] = useState<boolean>(
    boxType === "bundle" ? initialBundleConfig !== null : initialSingleItemConfig !== null,
  );
  const [smartStockManagement, setSmartStockManagement] = useState<boolean>(
    initialSmartStockManagement,
  );
  const [preventDuplicateBundleSelections, setPreventDuplicateBundleSelections] =
    useState<boolean>(initialPreventDuplicateBundleSelections);
  const [showSmartStockHint, setShowSmartStockHint] = useState<boolean>(false);
  const [showPreventDuplicateHint, setShowPreventDuplicateHint] =
    useState<boolean>(false);
  const [singleItemConfig, setSingleItemConfig] =
    useState<TSingleItemBoxConfig | null>(initialSingleItemConfig);
  const [bundleConfig, setBundleConfig] =
    useState<TBundleBoxConfig | null>(initialBundleConfig);
  const [configInstanceKey, setConfigInstanceKey] = useState<number>(0);
  const [animationStyle, setAnimationStyle] = useState<string>(loaderData.boxDesign.animationStyle);
  const [boxImageUrl, setBoxImageUrl] = useState<string>(loaderData.boxDesign.boxImageUrl ?? "");
  const [openSoundUrl, setOpenSoundUrl] = useState<string>(loaderData.boxDesign.openSoundUrl ?? "");
  const [backgroundColor, setBackgroundColor] = useState<string>(loaderData.boxDesign.backgroundColor ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>(loaderData.boxDesign.backgroundImageUrl ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  const saveFetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const navigate = useNavigate();
  const appBridge = useAppBridge();

  const canBeActive = useMemo(() => {
    const hasProduct = productId !== "";
    return hasProduct && boxConfigValid;
  }, [productId, boxConfigValid]);

  useEffect(() => {
    if (boxStatus === "active" && !canBeActive) {
      setBoxStatus("draft");
    }
  }, [boxStatus, canBeActive]);

  const handleStatusChange = (value: string) => {
    if (value === "active" && !canBeActive) {
      return;
    }
    setBoxStatus(value as TCreateBoxStatus);
  };

  const parsedPayload = useMemo<TCreateBoxPostPayload | null>(() => {
    let payload: TCreateBoxPostPayload | null = null;

    if (boxType === "item" && singleItemConfig) {
      payload = {
        boxType: "item",
        productId,
        productTitle,
        boxStatus,
        smartStockManagement,
        config: singleItemConfig,
      };
    }

    if (boxType === "bundle" && bundleConfig) {
      payload = {
        boxType: "bundle",
        productId,
        productTitle,
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
    boxType,
    productId,
    productTitle,
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

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        boxStatus: initialBoxStatus,
        smartStockManagement: initialSmartStockManagement,
        preventDuplicateBundleSelections:
          boxType === "bundle" ? initialPreventDuplicateBundleSelections : false,
        config:
          boxType === "bundle" ? initialBundleConfig : initialSingleItemConfig,
        design: loaderData.boxDesign,
      }),
    [
      initialBoxStatus,
      initialSmartStockManagement,
      initialPreventDuplicateBundleSelections,
      boxType,
      initialBundleConfig,
      initialSingleItemConfig,
      loaderData.boxDesign,
    ],
  );

  const hasFormChanges = useMemo(() => {
    const currentSnapshot = JSON.stringify({
      boxStatus,
      smartStockManagement,
      preventDuplicateBundleSelections:
        boxType === "bundle" ? preventDuplicateBundleSelections : false,
      config: boxType === "bundle" ? bundleConfig : singleItemConfig,
      design: { animationStyle, boxImageUrl, openSoundUrl, backgroundColor, backgroundImageUrl },
    });

    return currentSnapshot !== initialSnapshot;
  }, [
    boxStatus,
    smartStockManagement,
    preventDuplicateBundleSelections,
    boxType,
    bundleConfig,
    singleItemConfig,
    animationStyle,
    boxImageUrl,
    openSoundUrl,
    backgroundColor,
    backgroundImageUrl,
    initialSnapshot,
  ]);

  const resetFormState = () => {
    setBoxStatus(initialBoxStatus);
    setBoxConfigValid(
      boxType === "bundle"
        ? initialBundleConfig !== null
        : initialSingleItemConfig !== null,
    );
    setSmartStockManagement(initialSmartStockManagement);
    setPreventDuplicateBundleSelections(initialPreventDuplicateBundleSelections);
    setShowSmartStockHint(false);
    setShowPreventDuplicateHint(false);
    setSingleItemConfig(initialSingleItemConfig);
    setBundleConfig(initialBundleConfig);
    setAnimationStyle(loaderData.boxDesign.animationStyle);
    setBoxImageUrl(loaderData.boxDesign.boxImageUrl ?? "");
    setOpenSoundUrl(loaderData.boxDesign.openSoundUrl ?? "");
    setBackgroundColor(loaderData.boxDesign.backgroundColor ?? "");
    setBackgroundImageUrl(loaderData.boxDesign.backgroundImageUrl ?? "");
    setConfigInstanceKey((value) => value + 1);
  };

  useEffect(() => {
    if (saveFetcher.data?.ok) {
      void appBridge.saveBar.hide?.("edit-box-save-bar");
      void navigate("/app");
    }
  }, [appBridge.saveBar, saveFetcher.data, navigate]);

  useEffect(() => {
    return () => {
      void appBridge.saveBar.hide?.("edit-box-save-bar");
    };
  }, [appBridge.saveBar]);

  return (
    <s-page>
      <s-stack
        direction="inline"
        alignItems="center"
        paddingBlockEnd="small-200"
        style={{ columnGap: "4px" }}
      >
        <s-link href="/app">
          <s-button variant="tertiary" accessibilityLabel="Back to Manage Boxes">
            <s-icon type="chevron-left" />
          </s-button>
        </s-link>
        <s-heading>Edit Mystery Box</s-heading>
      </s-stack>
      <SaveBar id="edit-box-save-bar" open={hasFormChanges}>
        <button
          variant="primary"
          type="button"
          disabled={!parsedPayload || saveFetcher.state !== "idle"}
          onClick={() => {
            if (!formRef.current) return;
            saveFetcher.submit(formRef.current, {
              method: "post",
              action: `/app/boxes/${boxId}/edit`,
            });
          }}
        >
          Update
        </button>
        <button type="reset" form="edit-box-form">
          Discard
        </button>
      </SaveBar>
      <form
        id="edit-box-form"
        ref={formRef}
        method="post"
        action={`/app/boxes/${boxId}/edit`}
        onReset={resetFormState}
      >
        <input type="hidden" name="boxType" value={boxType} />
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="productTitle" value={productTitle} />
        <input type="hidden" name="boxStatus" value={boxStatus} />
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
        <input type="hidden" name="animationStyle" value={animationStyle} />
        <input type="hidden" name="boxImageUrl" value={boxImageUrl} />
        <input type="hidden" name="openSoundUrl" value={openSoundUrl} />
        <input type="hidden" name="backgroundColor" value={backgroundColor} />
        <input type="hidden" name="backgroundImageUrl" value={backgroundImageUrl} />

        <s-box padding="small-200"></s-box>
        <s-heading>Product</s-heading>
        <s-box padding="small-200"></s-box>
        <s-box maxInlineSize="380px">
          <s-section>
            <ProductCard
              title={selectedProduct.title}
              description={selectedProduct.description}
              price={selectedProduct.price}
              image={selectedProduct.image}
              inventory={selectedProduct.inventory}
            />
          </s-section>
        </s-box>

        {saveFetcher.data?.error ? (
          <s-box paddingBlockStart="small-200">
            <s-banner tone="critical">{saveFetcher.data.error}</s-banner>
          </s-box>
        ) : null}

        <s-box padding="small-300"></s-box>
        <s-heading>Configure Box</s-heading>
        <s-box padding="small-200"></s-box>
        <s-section>
          {boxType === "bundle" ? (
            <CreateBundleBox
              key={`bundle-${configInstanceKey}`}
              onValidationChange={setBoxConfigValid}
              onConfigChange={setBundleConfig}
              initialSets={initialBundleSets}
            />
          ) : (
            <CreateSingleItemBox
              key={`item-${configInstanceKey}`}
              onValidationChange={setBoxConfigValid}
              onConfigChange={setSingleItemConfig}
              initialItems={initialSingleItemItems}
            />
          )}
        </s-section>

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
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={smartStockManagement}
                    onChange={(e) => setSmartStockManagement(e.currentTarget.checked)}
                  />
                  Smart stock management
                </label>
                <s-button
                  variant="tertiary"
                  onClick={() => setShowSmartStockHint((value) => !value)}
                  accessibilityLabel="Smart stock management help"
                >
                  {showSmartStockHint ? (
                    <s-icon type="chevron-up" />
                  ) : (
                    <s-icon type="chevron-down" />
                  )}
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
                  When enabled, stock handling can use smarter logic for mystery-box
                  allocation and availability.
                </div>
              ) : null}
            </div>

            {boxType === "bundle" ? (
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
                        setPreventDuplicateBundleSelections(e.currentTarget.checked)
                      }
                    />
                    Prevent duplicate product selections across sets
                  </label>
                  <s-button
                    variant="tertiary"
                    onClick={() => setShowPreventDuplicateHint((value) => !value)}
                    accessibilityLabel="Prevent duplicate selections help"
                  >
                    {showPreventDuplicateHint ? (
                      <s-icon type="chevron-up" />
                    ) : (
                      <s-icon type="chevron-down" />
                    )}
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
                    When enabled, the same product can only appear in one bundle
                    set, even if selected multiple times.
                  </div>
                ) : null}
              </div>
            ) : null}
          </s-stack>
        </s-section>

        <s-box padding="small-300"></s-box>
        <s-heading>Design</s-heading>
        <s-box padding="small-200"></s-box>
        <s-section>
          <s-stack gap="base">
            <s-select
              label="Animation style"
              value={animationStyle}
              onChange={(e) => setAnimationStyle(e.currentTarget.value)}
            >
              <s-option value="default">Default — box shake and flip</s-option>
              <s-option value="slide">Slide — card flip reveal</s-option>
              <s-option value="fade">Fade — subtle fade transition</s-option>
            </s-select>
            <s-text-field
              label="Box image URL"
              value={boxImageUrl}
              onChange={(e) => setBoxImageUrl(e.currentTarget.value)}
              placeholder="https://example.com/box.png"
            />
            <s-text-field
              label="Open sound URL"
              value={openSoundUrl}
              onChange={(e) => setOpenSoundUrl(e.currentTarget.value)}
              placeholder="https://example.com/open.mp3"
            />
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Background color</span>
              <s-box maxInlineSize="32px">
                <ColorPicker
                  value={backgroundColor || "#ffffff"}
                  onChange={(_color, hex) => setBackgroundColor(hex)}
                  disabledAlpha
                />
              </s-box>
            </label>
            <s-text-field
              label="Background image URL"
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.currentTarget.value)}
              placeholder="https://example.com/bg.png"
            />
          </s-stack>
        </s-section>

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
