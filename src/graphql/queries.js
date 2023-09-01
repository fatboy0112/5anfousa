/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDeventMarkets = /* GraphQL */ `
  query GetDeventMarkets($fixture_id: String!) {
    getDeventMarkets(fixture_id: $fixture_id) {
      fixture_id
      fixture_status
      livescore
      market
    }
  }
`;
export const listDeventMarkets = /* GraphQL */ `
  query ListDeventMarkets(
    $filter: TableDeventMarketsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDeventMarkets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        fixture_id
        fixture_status
        livescore
        market
      }
      nextToken
    }
  }
`;
