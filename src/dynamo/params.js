import { addDays } from "date-fns";

export const paramsLastMinute = (nextToken) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, participant_one_full, participant_two_full, sport, sport_id, start_date',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status = :s ',
    ExclusiveStartKey: nextToken,
    ExpressionAttributeValues: {
      ':s': 9,
      ':hasMarket': true,
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    }
  };
};

export const paramsMarketData = (match_id) => {
  return {
    TableName: 'DeventMarkets',
    ProjectionExpression: 'fixture_id, market_status, match_id, outcomes',
    FilterExpression: 'match_id = :matchId',
    ExpressionAttributeValues: {
      ':matchId': match_id,
    },
  };
};

export const paramsMarketDataIndex = (fixture_id) => {
  return {
    TableName: 'DeventMarkets',
    IndexName: 'match_id_index',
    ProjectionExpression: 'fixture_id, fixture_status, market_status, match_id, outcomes, sport_event_status',
    KeyConditionExpression: 'match_id = :fixtureId',
    ExpressionAttributeValues: {
      ':fixtureId': `${fixture_id}`,
    },
  };
};

export const paramsSingleLiveMarket = (mkt_id) => {
  return {
    TableName: 'LiveMarkets',
    ProjectionExpression: 'fixture_id, fixture_status, market, livescore',
    KeyConditionExpression: 'fixture_id = :fixtureId',
    ExpressionAttributeValues: {
      ':fixtureId': mkt_id,
    },
  };
};

export const liveParamsMarketData = (fixture_id) => {
  return {
    TableName: 'LiveMarkets',
    ProjectionExpression: 'fixture_id, fixture_status, market, livescore, market_status',
    FilterExpression: 'match_id = :fixtureId',
    ExpressionAttributeValues: {
      ':fixtureId': fixture_id,
    },
  };
};

export const paramsHomeLeaguesEvents = (leagueId, nextToken) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, participant_one_full, participant_two_full, league_id, location_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status = :s AND league_id = :league_id ',
    ExclusiveStartKey: nextToken,
    ExpressionAttributeValues: {
      ':s': 0,
      ':league_id': leagueId,
      ':hasMarket': true,
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    }
  };
};

export const paramsHomeLeaguesEventsDesktop = (leagueId, segmentNo, totalSegments) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, participant_one_full, participant_two_full, league_id, location_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status = :s AND league_id = :league_id ',
    ExpressionAttributeValues: {
      ':s': 0,
      ':league_id': leagueId,
      ':hasMarket': true,
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    },
    Segment: segmentNo,
    TotalSegments: totalSegments,
  };
};

export const paramsHomeLeaguesEventsMobile = (leagueId, segmentNo, totalSegments) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, participant_one_full, participant_two_full, league_id, location_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status = :s AND league_id = :league_id ',
    ExpressionAttributeValues: {
      ':s': 0,
      ':league_id': leagueId,
      ':hasMarket': true,
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    },
    Segment: segmentNo,
    TotalSegments: totalSegments,
  };
};


export const paramsPrematchLocations = (sportId, nextToken) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, league_id, location_id, participant_one_full, participant_two_full',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:fixtureOne) AND sport_id = :sportId',
    ExclusiveStartKey: nextToken,
    ExpressionAttributeValues: {
      ':fixtureOne': 0,
      ':hasMarket': true,
      ':sportId': sportId
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    }
  };
};

export const paramsPrematchLocationsMobile = (sportId, segmentNo, totalSegments) => {
  let dateRange = [new Date().toISOString(), new Date(addDays(new Date(), 20)).toISOString()];
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, league_id, location_id, participant_one_full, participant_two_full',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:fixtureOne) AND sport_id = :sportId AND start_date BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':fixtureOne': 0,
      ':hasMarket': true,
      ':start': dateRange[0],
      ':end': dateRange[1],
      ':sportId': sportId
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    },
    Segment: segmentNo,
    TotalSegments: totalSegments,
  };
};


export const paramsPrematchCount = (nextToken) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, sport_id, start_date',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status = :s',
    ExclusiveStartKey: nextToken,
    ExpressionAttributeValues: {
      ':s': 0,
      ':hasMarket': true,
    },
  };
};

export const paramsSinglePrematchDEvent = (fixtureId) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, market, livescore, is_markent_present, league, #locations, start_date, sport_id, participant_one_full, participant_two_full, league_id, location_id',
    KeyConditionExpression: 'fixture_id = :fixtureId',
    ExpressionAttributeValues: {
      ':fixtureId': fixtureId,
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    }
  };
}

export const paramsPrematchCountMobile = (segmentNo, totalSegments) => {
  let dateRange = [new Date().toISOString(), new Date(addDays(new Date(), 20)).toISOString()];
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, sport_id, start_date',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s) AND start_date BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':s': 0,
      ':hasMarket': true,
      ':start': dateRange[0],
      ':end': dateRange[1],
    },
    Segment: segmentNo,
    TotalSegments: totalSegments,
  };
}
export const JackpotData = (user_id) => {
    return {
        TableName: 'JackpotData',
        ProjectionExpression: 'jackpot_amount, username ,Jackpot_time',
        KeyConditionExpression: 'project_id = :project_id ',
        ExpressionAttributeValues: {
          ':project_id': process.env.REACT_APP_UNIQUE_ID,
         },
    };
}