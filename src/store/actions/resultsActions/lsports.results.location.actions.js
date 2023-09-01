
import { resultTotalSegments } from '../../../config';
import * as Actions from '../actionTypes';
import {map, forEach, isEmpty, filter, orderBy} from 'lodash';
import { dynamoClient } from '../../../App';
import { getResultLocationsParams ,getResultLocationsParamsMobile} from '../../../dynamo/resultsParams/getResultLocations';
import { getResultsCountParams ,getResultsCountParamsMobile} from '../../../dynamo/resultsParams/getResultsCountParam';
import { sortedLocationsResults } from '../../../config/sports';

// /Get locations list
let resultCount = 0;
let getResultLocationCount = 0;

export const getResultsLocations = (sportId, nextToken) => {
    return (dispatch, getState) => {
        dispatch(setLocationLoading(true));
        dynamoClient.scan(getResultLocationsParams(nextToken, sportId), (err, data) => {
            if (err) {
                console.error(err);
            } else {
                dispatch(setPartialLocations(data.Items));
                if(data.LastEvaluatedKey) {
                    dispatch(fetchMore(data.LastEvaluatedKey));
                } else {
                    dispatch(fetchedAllData());
                }
            }
        });
    };
};

// Set locations list
export const setResultsLocations = (locations) => {
    return (dispatch) => {
        dispatch(setLocationLoading(false));
        dispatch({ type: Actions.SET_RESULTS_LOCATIONS, locations });
    };
};

let countObj = {};
export const getResultsLocationsCount = (clearCount, nextToken) => {
    return (dispatch, getState) => {
        if(clearCount){
            countObj = {};
        }
        dynamoClient.scan(getResultsCountParams(nextToken), (err, data) => {
            if (err) {
                console.error(err);
            } else {
                forEach(data.Items, (event) => {
                    if(!countObj[event.sport_id]) {
                        countObj[event.sport_id] = 0;
                    }
                    countObj[event.sport_id]++;
                }); 
                if(data.LastEvaluatedKey) {
                    dispatch(getResultsLocationsCount(false, data.LastEvaluatedKey));
                } else {
                    dispatch({ type: Actions.SET_RESULT_SPORTS_COUNT_OBJECT, sportsCountObj: countObj });
                }
            }
        });
    };
};


const fetchMore = (token) => {
    return (dispatch, getState) => {
        let selectedSport = getState().results.selectedSport;
        dispatch(getResultsLocations(selectedSport, token));
    };
}; 

const fetchedAllData = () => {
    return (dispatch, getState) => {
        let partialLocations = getState().results.partialLocations;

        let lan = `name_${ getState().general.language }`;
        let locationObj = {};

                let locationArray = [];
                forEach(!isEmpty(locationObj) && Object.keys(locationObj), (location) => {
                    if(location !== 'count' )
                    locationArray.push({
                        location_id: location,
                        location_name: locationObj[location][lan] || locationObj[location].name_en,
                        name: locationObj[location][lan] || locationObj[location].name_en,
                        fixtures_count: locationObj[location].count,
                        name_en: locationObj[location].name_en,
                        name_tr: locationObj[location].name_tr,
                        name_nl: locationObj[location].name_nl,
                        name_de: locationObj[location].name_de,
                        name_ru: locationObj[location].name_ru,
                    });
                });
                let selectedSport = getState().results.selectedSport;
                locationArray = sortedLocationsResults(locationArray, selectedSport);
                dispatch(setResultsLocations(locationArray));       
    };
};


const setPartialLocations = (locations) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_RESULTS_PARTIAL_LOCATIONS, locations });        
    };
};

// Clear locations list
export const clearLocations = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_RESULTS_LOCATIONS });
    };
};

// Set selected location
export const selectLocation = (locationId) => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_RESULTS_LOCATION_SELECTED, locationId });
    };
};

export const setLocationLoading = (data) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_RESULTS_LOCATION_LOADING, data });
    };
}

// Get events of selected location
export const getResultsLocationEvents = (locationId) => {
    return (dispatch, getState) => {
        // let language = getState().general.language;
        // let page = getState().results.currentPage;
        // let sportId = getState().results.selectedSport;
        // lSportsService
        //     .getResultsLocationEvents(sportId, locationId, language, page + 1)
        //     .then((data) => {
        //         dispatch(setResultsLocationEvents(data.results, data.next));
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //         if (error && error.response && error.response.status && error.response.status === 401) {
        //             Util.handleRepeatedLogin(error.response);
        //         } else {
        //             toastr.error('', 'Something went wrong.');
        //         }
        //     });
    };
};

// Set events of selected location
export const setResultsLocationEvents = (locationId) => {
    return (dispatch, getState) => {
        dispatch(clearLocationEvents());
        let partialLocations = getState().results.partialLocations;
        let events = filter(partialLocations, (e) => e.location_id == locationId);
        events = orderBy(events,[ 'start_date', (e) => e.league.Name ], ['desc', 'asc'] );
        dispatch({ type: Actions.SET_RESULTS_LOCATION_EVENTS, events});
    };
};

// Clear events of location
export const clearLocationEvents = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_RESULTS_LOCATION_EVENTS });
    };
};

export const getResultsLocationsCountMobile = (clearCount, nextToken , i) => {
    return (dispatch, getState) => {
        if(clearCount){
            countObj = {};
            resultCount = 0;
        }
        dynamoClient.scan(getResultsCountParamsMobile(nextToken, i, resultTotalSegments), (err, data) => {
            if (err) {
                console.error(err);
            } else {
                resultCount++;
                forEach(data.Items, (event) => {
                    if(!countObj[event.sport_id]) {
                        countObj[event.sport_id] = 0;
                    }
                    countObj[event.sport_id]++;
                }); 
                if(resultCount === resultTotalSegments)  {
                    dispatch({ type: Actions.SET_RESULT_SPORTS_COUNT_OBJECT, sportsCountObj: countObj });
                }
            }
        });
    };
};


export const getResultsLocationsMobile = (sportId, nextToken, i, clear) => {
    return (dispatch, getState) => {
        if(clear){
            getResultLocationCount = 0;
        }
        dispatch(setLocationLoading(true));
        dynamoClient.scan(getResultLocationsParamsMobile(nextToken, sportId, i, resultTotalSegments), (err, data) => {
            if (err) {
                console.error(err);
            } else {
                getResultLocationCount++;
                dispatch(setPartialLocations(data.Items));
                if(resultTotalSegments === getResultLocationCount) {
                    dispatch(fetchedAllData());
                }
            }
        });
    };
};
