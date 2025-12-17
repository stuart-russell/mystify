import { Dispatch, SetStateAction } from "react";
import { TProduct } from "./schema";
// import { ActionFunctionArgs } from "react-router";
// import { authenticate } from "app/shopify.server";

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

export async function getCreatedProductData(productId: String, apiKey: string) {
  const gql = GraphQLClient;
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
  setSelectedProduct: Dispatch<SetStateAction<TProduct>>,
) {
  const products = await window.shopify.resourcePicker({
    type: "product",
    action: "select",
  });

  if (products) {
    const { images, title, descriptionHtml } = products[0];
    const image = images[0]
      ? images[0].originalSrc
      : "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png";
    setSelectedProduct({ image, title, description: descriptionHtml });
  }
}

// export const fetchProductDetailsAction = async (
//   { request }: ActionFunctionArgs,
//   productId: string,
// ) => {
//   const { admin } = await authenticate.admin(request);
//   const response = await admin.graphql(
//     `#graphql
//     query productInfo($id: ID!) {
//       product(id: $id) {
//         title
//         description
//         media(first: 1) {
//           nodes {
//             preview {
//               image {
//                 url
//               }
//             }
//           }
//         }
//       }
//     }`,
//     {
//       variables: {
//         id: productId,
//       },
//     },
//   );
//   const responseJson = await response.json();

//   return {
//     title: responseJson.data?.product?.title || "Mystery Box Product Title",
//     image:
//       responseJson.data?.product?.media.nodes[0].preview?.image?.url ||
//       "https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png.png",
//     description:
//       responseJson.data?.product?.description ||
//       "This is a brief description of the product inside the mystery box. It gives an overview of what to expect.",
//   };
// };
