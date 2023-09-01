import { lSportsConfig } from "../config";

// TODO: fetch all the current live matches from Dynamo in a single query.


// Also fetch all the Markets as well initially after that we will make a connection for those fetched Matches for Markets and other data.
export const getLivePartialDEvents = (nextToken) => {
    return {
      TableName: 'LivePartialDevent',
      ProjectionExpression: 'fixture_id, fixture_status, league, #locations, participant_one_full, participant_two_full, sport, sport_id, start_date',
      FilterExpression: 'fixture_status = :s ',
      ExclusiveStartKey: nextToken,
      ExpressionAttributeValues: {
        ':s': 2,
        // ':sport_id': sportId,
      },
      ExpressionAttributeNames: {
        '#locations': 'location',
      }
    };
  };


export const getLiveDEventMarkets = (fixture_id) => {
    return {
      TableName: 'LiveDeventMarkets',
      ProjectionExpression: 'fixture_id, fixture_status, livescore, imp_market',
      KeyConditionExpression: 'fixture_id = :fixtureId',
      ExpressionAttributeValues: {
        ':fixtureId': fixture_id,
      },
    };
  };

  export const getAllLiveFixtureMarkets = (nextToken) => {
    // console.log(fixture_id);
    return {
      TableName: 'LiveMarkets',
      ProjectionExpression: 'fixture_id, fixture_status, market, livescore, match_id, market_status',
      ExclusiveStartKey: nextToken,
    };
  };

  export const getAllLiveMatches = (nextToken) => {
    return {
      TableName: 'LiveMatches',
      ProjectionExpression: 'fixture_id, fixture_status, sport_id',
      ExclusiveStartKey: nextToken
    }
  }

  export const getSingleMarketOfEvent = (fixtureMarketId) => {
    return {
      TableName: 'LiveMarkets',
      ProjectionExpression: 'fixture_id, fixture_status, outcomes, sport_event_status, match_id, market_status',
      KeyConditionExpression: 'fixture_id = :fixtureId',
      ExpressionAttributeValues: {
        ':fixtureId': fixtureMarketId,
      },
    };
  };

  export const getSingleMarketOfPreEvent = (fixtureMarketId) => {
    return {
      TableName: 'DeventMarkets',
      ProjectionExpression: 'fixture_id, fixture_status, outcomes, sport_event_status, match_id, market_status',
      KeyConditionExpression: 'fixture_id = :fixtureId',
      ExpressionAttributeValues: {
        ':fixtureId': fixtureMarketId,
      },
    };
  };

  export const getSingleLivePartialEvent = (fixture_id) => {
    return {
      TableName: 'PartialDevent',
      ProjectionExpression: 'fixture_id, fixture_status, league, #locations, participant_one_full, participant_two_full, sport, sport_id, start_date, league_id, location_id',
      KeyConditionExpression: 'fixture_id = :fixtureId',
      ExpressionAttributeValues: {
        ':fixtureId': fixture_id,
      },
      ExpressionAttributeNames: {
        '#locations': 'location',
      }
    };
  };

  export const getSingleLiveMarkets = (fixture_id) => {
    return {
      TableName: 'LiveDeventMarkets',
      ProjectionExpression: 'fixture_id, imp_market, fixture_status, outcomes, livescore',
      KeyConditionExpression: 'fixture_id = :fixtureId',
      ExpressionAttributeValues: {
        ':fixtureId': fixture_id,
      },
    };
  };

  export const getLiveMatchMarkets = (fixture_id) => {
    return {
      TableName: 'LiveMarkets',
      IndexName: 'match_id_index',
      ProjectionExpression: 'fixture_id, fixture_status, outcomes, sport_event_status, match_id, market_status',
      KeyConditionExpression: 'match_id = :fixtureId',
      ExpressionAttributeValues: {
        ':fixtureId': `${fixture_id}`,
      },
    };
  };

  export const getLiveMatchIds = () => {
    return {
      TableName: 'LiveMatches',
      ProjectionExpression: 'fixture_id, fixture_status',
      FilterExpression: 'fixture_status = :s',
      ExpressionAttributeValues: {
        ':s': lSportsConfig.statuses.inplay,
      },
    };
  };

export const getLiveCount = (fixtureIds,nextToken) => {
  let queryParams = { RequestItems: {} };
  queryParams.RequestItems['LiveMarkets'] = {
    Keys: [...Object.values(fixtureIds)],
    ProjectionExpression: 'fixture_id, match_id, market_status',
  };
  return queryParams;
};

export const updatedgetLiveMatchMarkets = (fixtureIds) => {
  let queryParams = { RequestItems: {} };
  queryParams.RequestItems['LiveMarkets'] = {
      Keys: [...Object.values(fixtureIds)],
      ProjectionExpression: 'fixture_id, fixture_status, outcomes, sport_event_status,market_status,match_id',
  };
  return queryParams;
};

export const getLiveScore = (fixtureIds) => {
  let queryParams = { RequestItems: {} };
  queryParams.RequestItems['LiveMarkets'] = {
      Keys: [...Object.values(fixtureIds)],
      ProjectionExpression: 'fixture_id, fixture_status, sport_event_status,match_id',
  };
  return queryParams;
};
