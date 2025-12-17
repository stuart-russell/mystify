/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type ProductInfoQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type ProductInfoQuery = { product?: AdminTypes.Maybe<(
    Pick<AdminTypes.Product, 'title' | 'description'>
    & { media: { nodes: Array<{ preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }> } }
  )> };

interface GeneratedQueryTypes {
  "#graphql\n    query productInfo($id: ID!) {\n      product(id: $id) {\n        title\n        description\n        media(first: 1) {\n          nodes {\n            preview {\n              image {\n                url\n              }\n            }\n          }\n        }\n      }\n    }": {return: ProductInfoQuery, variables: ProductInfoQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
