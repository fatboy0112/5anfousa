export const getResultsCountParams = (nextToken) => {
    return {
      TableName: 'FinishedEvent',
      ProjectionExpression: 'fixture_id, sport_id',
      FilterExpression: 'fixture_status = :s',
      ExclusiveStartKey: nextToken,
      ExpressionAttributeValues: {
        ':s': 3,
      }
    };
  };
  export const getResultsCountParamsMobile = (nextToken, segmentNo, totalSegments) => {
    return {
      TableName: 'FinishedEvent',
      ProjectionExpression: 'fixture_id, sport_id',
      FilterExpression: 'fixture_status = :s',
      ExclusiveStartKey: nextToken,
      ExpressionAttributeValues: {
        ':s': 3,
      },
      Segment: segmentNo,
      TotalSegments: totalSegments,
    };
  };
