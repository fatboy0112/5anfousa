export const getAllSportsEventsCount = (sportIds, dateRange, nextToken) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, sport_id',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s, :s1, :s2) AND sport_id IN ('+Object.keys(sportIds)+') AND start_date BETWEEN :start AND :end',
    ExclusiveStartKey: nextToken,
    ExpressionAttributeValues: {
      ':s': 1,
      ':s1': 5,
      ':s2': 9,
      ':start': dateRange[0],
      ':end': dateRange[1],
      ':hasMarket': true,
      ...sportIds,
    },
  };
};