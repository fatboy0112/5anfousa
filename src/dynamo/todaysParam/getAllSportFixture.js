export const getAllSportsEventsCount = (sportIds, dateRange, nextToken) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, sport_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s) AND sport_id IN ('+Object.keys(sportIds)+') AND start_date BETWEEN :start AND :end',
    ExclusiveStartKey: nextToken,
    ExpressionAttributeValues: {
      ':s': 0,
      ':start': dateRange[0],
      ':end': dateRange[1],
      ':hasMarket': true,
      ...sportIds,
    },
  };
};

export const getAllSportsEventsCountDesktop = (sportIds, dateRange, segmentNo, totalSegments) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, sport_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s) AND sport_id IN ('+Object.keys(sportIds)+') AND start_date BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':s': 0,
      ':start': dateRange[0],
      ':end': dateRange[1],
      ':hasMarket': true,
      ...sportIds,
    },
    Segment: segmentNo,
    TotalSegments: totalSegments,
  };
};

export const getAllSportsEventsCountMobile = (sportIds, dateRange, segmentNo, totalSegments) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, sport_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s) AND sport_id IN ('+Object.keys(sportIds)+') AND start_date BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':s': 0,
      ':start': dateRange[0],
      ':end': dateRange[1],
      ':hasMarket': true,
      ...sportIds,
    },
    Segment: segmentNo,
    TotalSegments: totalSegments,
  };
};
