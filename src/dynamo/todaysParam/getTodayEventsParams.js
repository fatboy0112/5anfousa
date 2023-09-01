export const getTodayEventsParams = (sportId, dateRange, nextToken) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s)  AND sport_id = :sport_id AND start_date BETWEEN :start AND :end',
    ExclusiveStartKey: nextToken,
    ExpressionAttributeValues: {
      ':s': 0,
      ':start': dateRange[0],
      ':end': dateRange[1],
      ':sport_id': sportId,
      ':hasMarket': true,
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    }
  };
};
export const getTodayEventsParamsDesktop = (sportId, dateRange, nextToken, segmentNo, totalSegments) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, participant_one_full, participant_two_full, league_id, location_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s)  AND sport_id = :sport_id AND start_date BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':s': 0,
      ':start': dateRange[0],
      ':end': dateRange[1],
      ':sport_id': sportId,
      ':hasMarket': true,
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    },
    Segment: segmentNo,
    TotalSegments: totalSegments,
  };
};

export const getTodayEventsParamsMobile = (sportId, dateRange, nextToken, segmentNo, totalSegments) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, participant_one_full, participant_two_full, league_id, location_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s)  AND sport_id = :sport_id AND start_date BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':s': 0,
      ':start': dateRange[0],
      ':end': dateRange[1],
      ':sport_id': sportId,
      ':hasMarket': true,
    },
    ExpressionAttributeNames: {
      '#locations': 'location',
    },
    Segment: segmentNo,
    TotalSegments: totalSegments,
  };
};

export const getPartialEventsBatch = (eventIds, nextToken) => {
  let queryParams = {RequestItems: {}};
  queryParams.RequestItems['PartialDevent'] = {
    Keys: [...Object.values(eventIds)],
    ProjectionExpression: 'fixture_id, fixture_status, is_market_present, league, #locations, sport_id, start_date, participant_one_full, participant_one, participant_two_full, participant_two, league_id, location_id',
    ExpressionAttributeNames: {
      '#locations': 'location',
    }
  };
  return queryParams;
};
