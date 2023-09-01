// TODO: fetch all the settings and blocked content


// get blocked sports
export const getBlockedSports = (nextToken) => {
    return {
      TableName: 'ProjectSetting',
      ProjectionExpression: 'sports,leagues',
      KeyConditionExpression: 'project_id = :project_id ',
      ExpressionAttributeValues: {
        ':project_id': process.env.REACT_APP_UNIQUE_ID,
      },
      
    };
  };

  // get blocked sports
export const getBlockedLeauges = (nextToken) => {
  return {
    TableName: 'ProjectSetting',
    ProjectionExpression: 'leauges',
    KeyConditionExpression: 'project_id = :project_id ',
    ExpressionAttributeValues: {
      ':project_id': process.env.REACT_APP_UNIQUE_ID,
    },
    
  };
};

// get blocked sports
export const getBlockedMarkets = (nextToken) => {
  return {
    TableName: 'ProjectSetting',
    ProjectionExpression: 'markets',
    KeyConditionExpression: 'project_id = :project_id ',
    ExpressionAttributeValues: {
      ':project_id': process.env.REACT_APP_UNIQUE_ID,
    },
    
  };
};