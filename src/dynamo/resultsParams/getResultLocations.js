export const getResultLocationsParams = (nextToken, sportId) => {
    return {
      TableName: 'FinishedEvent',
      ProjectionExpression: 'fixture_id, fixture_status, livescore, league, league_id, #locations, participant_one_full, participant_two_full, sport, sport_id, start_date, location_id, sport_event_status',
      FilterExpression: 'fixture_status = :s AND sport_id= :sportId',
      ExclusiveStartKey: nextToken,
      ExpressionAttributeValues: {
        ':s': 3,
        ':sportId': sportId
      },
      ExpressionAttributeNames: {
        '#locations': 'location',
      }
    };
  };
  export const getResultLocationsParamsMobile = (nextToken, sportId, segmentNo, totalSegments) => {
    return {
      TableName: 'FinishedEvent',
      ProjectionExpression: 'fixture_id, fixture_status, livescore, league, league_id, #locations, participant_one_full, participant_two_full, sport, sport_id, start_date, location_id, sport_event_status',
      FilterExpression: 'fixture_status = :s AND sport_id= :sportId',
      ExclusiveStartKey: nextToken,
      ExpressionAttributeValues: {
        ':s': 3,
        ':sportId': sportId
      },
      ExpressionAttributeNames: {
        '#locations': 'location',
      },
      Segment: segmentNo,
      TotalSegments: totalSegments,
    };
  };
