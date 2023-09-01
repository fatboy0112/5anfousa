export const getTomorrowEventsParams = (sportId, dateRange, nextToken) => {
  return {
    TableName: 'PartialDevent',
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date',
    FilterExpression: 'is_market_present = :hasMarket AND fixture_status IN (:s, :s1, :s2)  AND sport_id = :sport_id AND start_date BETWEEN :start AND :end',
    ExclusiveStartKey: nextToken,
    ExpressionAttributeValues: {
      ':s': 1,
      ':s1': 5,
      ':s2': 9,
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