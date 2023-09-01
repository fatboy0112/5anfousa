export const getFavEvents = (eventIds, nextToken) => {
  let queryParams = {RequestItems: {}};
  queryParams.RequestItems['PartialDevent'] = {
    Keys: [...Object.values(eventIds)],
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, participant_one_full, participant_two_full, league_id, location_id',
    ExpressionAttributeNames: {
      '#locations': 'location',
    }
  };
  return queryParams;
};

export const getLiveFavEvents = (eventIds, nextToken) => {
  let queryParams = {RequestItems: {}};
  queryParams.RequestItems['PartialDevent'] = {
    Keys: [...Object.values(eventIds)],
    ProjectionExpression: 'fixture_id, fixture_status, league, #locations, sport_id, start_date, participant_one_full, participant_two_full, league_id, location_id',
    ExpressionAttributeNames: {
      '#locations': 'location',
    }
  };
  return queryParams;
};

