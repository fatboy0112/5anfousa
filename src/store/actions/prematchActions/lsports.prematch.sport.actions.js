import { toastr } from 'react-redux-toastr';
import * as Actions from '../actionTypes';
import Util from '../../../helper/Util';
import forEach from 'lodash.foreach';
import jwtService from '../../../services/jwtService';
import { dynamoClient } from '../../../App';
import { paramsPrematchCount } from '../../../dynamo/params';
import { differenceInDays } from 'date-fns';

// Get sports list
let countObj = {};

export const getPrematchSports = (clear, nextToken) => {
    return (dispatch, getState) => {
        if(clear){
            countObj = {};
        }
        dynamoClient.scan(paramsPrematchCount(nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                forEach(data.Items, (event) => {
                    if(!countObj[event.sport_id]) {
                        countObj[event.sport_id] = 0;
                    }
                    if(differenceInDays(Util.getFormattedDate(event.start_date),new Date())>= 0) {
                        countObj[event.sport_id]++;
                    }
                }); 
                if(data.LastEvaluatedKey) {
                    dispatch(getPrematchSports(false, data.LastEvaluatedKey));
                } else {
                    dispatch({ type: Actions.SET_PREMATCH_SPORTS_COUNT_OBJECT, sportsCountObj: countObj });
                }
            }
        });
    };
};

// Set sports list
export const setPrematchSports = (sports) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_SPORTS, sports });
    };
};

// Select active sport
export const selectPreSport = (sportId) => {
    return (dispatch, getState) => {
        let locationObj = getState().prematch.locationObj;
        let locationArray = [];
        let dateFilter = getState().prematch.dateFilter;
       // dispatch(getPrematchSports());
        dispatch({ type: Actions.ON_SPORT_SELECTED, sportId });
        
        // if(!isEmpty(locationObj)) {
        //     forEach(Object.keys(locationObj[sportId]), (location) => {
        //         if(location !== 'count')
        //         locationArray.push({location_id: location, name: locationObj[sportId][location].name, fixtures_count: locationObj[sportId][location].count});
        //     });
        //     locationArray = sortedLocations(locationArray);
        //     dispatch(setPrematchLocations(locationArray));
        //     dispatch(setDateFilter(dateFilter));
        //     }
        // dispatch(getPrematchLocations());
    };
};


export const getPrematchSportsMobile = (clear, i) => {
    return (dispatch, getState) => {
        if(clear){
            countObj = {};
        }
        dispatch(getSportsCount(1));
    };
};

const getSportsCount = (sportId) => {
    return (dispatch, getState) => {
        countObj = {};
        jwtService
            .getPrematches(sportId)
            .then((data) => {
                let { sport_count: sportCountMeta } = data;
                countObj = JSON.parse(sportCountMeta);
                dispatch({ type: Actions.SET_PREMATCH_SPORTS_COUNT_OBJECT, sportsCountObj: countObj });                    
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};
