import { Dispatch, SetStateAction } from "react";
import { TProduct } from "./schema";
import { useLoaderData } from "react-router";
import { loader } from "app/routes/app";

class GraphQLClient {
  private endpoint: string;
  private apiKey: string;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async query(query: string, variables: Record<string, any>) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.apiKey,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    return response.json();
  }
}

export async function getCreatedProductData(productId: String) {
  const gql = GraphQLClient;
  const { apiKey } = useLoaderData<typeof loader>();
  const client = new gql("/admin/api/2024-01/graphql.json", apiKey);

  const response = await client.query(
    `
      query productInfo($id: ID!) {
        product(id: $id) {
          title
          description
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
      }
    `,
    {
      id: productId,
    },
  );

  const { product } = response.data;

  return {
    title: product?.title,
    image: product?.media?.nodes[0]?.preview?.image?.url,
    description: product?.description,
  };
}

export async function selectProduct(
  setSelectedProduct: Dispatch<SetStateAction<TProduct | undefined>>,
) {
  const products = await window.shopify.resourcePicker({
    type: "product",
    action: "select",
  });

  if (products) {
    const { images, title } = products[0];
    const image = images[0].originalSrc;
    setSelectedProduct({ image, title });
  }
}
