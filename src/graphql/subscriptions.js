/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDeventMarkets = /* GraphQL */ `
  subscription OnCreateDeventMarkets(
    $fixture_id: String
    $fixture_status: Int
    $livescore: String
    $market: String
  ) {
    onCreateDeventMarkets(
      fixture_id: $fixture_id
      fixture_status: $fixture_status
      livescore: $livescore
      market: $market
    ) {
      fixture_id
      fixture_status
      livescore
      market
    }
  }
`;
export const onUpdateLiveDeventMarkets = /* GraphQL Live*/ `
subscription MySubscription {
  onUpdateLiveMarkets {
    fixture_id
    fixture_status
    sport_event_status
    outcomes
    market_status
    match_id
  }
}
`;

export const onUpdateMatchMarkets = (matchId) => `
subscription MySubscription {
  onUpdateLiveMarkets(match_id: "${matchId}") {
    fixture_id
    fixture_status
    outcomes
    match_id
    market_status
    sport_event_status
  }
}
`;

export const onDeleteDeventMarkets = /* GraphQL */ `
  subscription OnDeleteDeventMarkets(
    $fixture_id: String
    $fixture_status: Int
    $livescore: String
    $market: String
  ) {
    onDeleteDeventMarkets(
      fixture_id: $fixture_id
      fixture_status: $fixture_status
      livescore: $livescore
      market: $market
    ) {
      fixture_id
      fixture_status
      livescore
      market
    }
  }
`;
