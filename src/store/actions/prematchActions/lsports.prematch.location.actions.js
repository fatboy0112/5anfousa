import { toastr } from 'react-redux-toastr';
import Util from '../../../helper/Util';
import * as Actions from '../actionTypes';
import map from 'lodash.map';
import forEach from 'lodash.foreach';
import { forIn, isEmpty } from 'lodash';
import { sortedLocations } from '../../../config/sports';
import { format } from 'date-fns';
import { dynamoClient } from '../../../App';
import { paramsPrematchLocations } from '../../../dynamo/params';
import { MARKET_FOR_OUTER_SLIDER, MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../../config/markets';
import { differenceInDays } from 'date-fns/esm';
import { prematchEventBatchSize } from '../../../config';
import { getPartialEventsBatch } from '../../../dynamo/todaysParam/getTodayEventsParams';
import jwtService from '../../../services/jwtService';

let eventCount = 0;
let noOfBatches = 1;

// Get locations list
let previousSportId = null
export const getPrematchLocations = (nextToken) => {
    return (dispatch, getState) => {
        let sportId = getState().prematch.selectedSport;
        dynamoClient.scan(paramsPrematchLocations(sportId, nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if(previousSportId !== sportId) {
                    previousSportId = sportId
                    dispatch(clearPartialLocations())
                    return dispatch(getPrematchLocations())
                }
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

export const clearPartialLocations = () => {
    return (dispatch) => {
        eventCount = 0;
        dispatch({ type: Actions.SET_PREMATCH_PARTIAL_LOCATIONS, clear: true });
    };
};

const fetchMore = (token) => {
    return (dispatch) => {
        dispatch(getPrematchLocations(token));
    };
}; 

const fetchedAllData = () => {
    return (dispatch, getState) => {
        let partialLocations = getState().prematch.partialLocations;
        let lan = `name_${ getState().general.language }`;
        let locationObj = {};
        let dateFilter = getState().prematch.dateFilter;
        let newPartialLocations = partialLocations.filter(event => differenceInDays(Util.getFormattedDate(event.start_date),new Date())>= 0);
                
                let locationArray = [];
                forEach(!isEmpty(locationObj) && Object.keys(locationObj), (location) => {
                    if(location !== 'count')
                    locationArray.push({
                        location_id: location,
                        name: locationObj[location].name,
                        fixtures_count: locationObj[location].count,
                        name_en: locationObj[location].name_en,
                        name_tr: locationObj[location].name_tr,
                        name_nl: locationObj[location].name_nl,
                        name_de: locationObj[location].name_de,
                        name_ru: locationObj[location].name_ru,
                    });
                });
                dispatch({ type: Actions.SET_PREMATCH_PARTIAL_LOCATIONS, sort: true });
                locationArray = sortedLocations(locationArray);
                dispatch(setPrematchLocations(locationArray));
                dispatch(setLocationObj(locationObj));
                dispatch(setDateFilter(dateFilter));
        // dispatch({ type: Actions.SET_PREMATCH_ALL_EVENTS, allEvents: allData });        
    };
};

const setPartialLocations = (locations) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_PARTIAL_LOCATIONS, locations });        
    };
};


export const setLocationObj = (locationObj) => {
    // let sportsCountObj = {};
    // forEach(Object.keys(locationObj), (location) => {
    //     if(location !== 'count')
    //     sportsCountObj[location]= locationObj[location].count; 
    // });
    return (dispatch) => {
        // dispatch({ type: Actions.SET_PREMATCH_SPORTS_COUNT_OBJECT, sportsCountObj });
        dispatch({ type: Actions.SET_PREMATCH_LOCACTIONS_OBJECT, locationObj });
    };
};

export const setClearLocations = () => {
    return (dispatch) => {
        eventCount = 0;
        dispatch({ type: Actions.SET_PREMATCH_CLEAR_LOCATIONS });
    };
}
// Get leagues for a particular location
export const getPrematchLeagueForLocation = (locationId) => {
    return (dispatch, getState) => {
        // let language = getState().general.language;
        // let dateFilter = getState().prematch.dateFilter;
        let locationObj = getState().prematch.locationObj;
        let dateFilter = getState().prematch.dateFilter;
        // dispatch(setLoading(true));
        // awsAppsyncService.getSportsLocations.then((sports) => console.log(sports));
        const leaguesArray = [];
        if(format(new Date(), 'yyyy-MM-dd') === dateFilter) {

            forEach(Object.keys(locationObj[locationId]), (league) => {
                if(!isNaN(league)) {
                    leaguesArray.push({location_id: parseInt(league), name: locationObj[locationId][league].name || locationObj[locationId][league].name_en, fixtures_count: locationObj[locationId][league].count, start_date: locationObj[locationId][league].start_date, ...locationObj[locationId][league]})
                }
            });
        }
        else {
            forEach(Object.keys(locationObj[locationId]), (league) => {
                if(!isNaN(league) && locationObj[locationId][league].start_date[dateFilter])
                leaguesArray.push({location_id: parseInt(league), name: locationObj[locationId][league].name || locationObj[locationId][league].name_en, fixtures_count: locationObj[locationId][league].start_date[dateFilter]})
            });

        }
        dispatch(setPrematchLeaguesForLocation([{leagues: leaguesArray}]));

    };
};

// Set locations list
export const setPrematchLocations = (locations) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_LOCATIONS, locations });
    };
};

// Set locations list
export const setPrematchLeaguesForLocation = (leagues) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_LEAGUE_FOR_LOCATION, leagues });
    };
};

// Clear locations list
export const clearLocations = () => {
    return (dispatch) => {
        eventCount = 0;
        dispatch({ type: Actions.CLEAR_PREMATCH_LOCATIONS });
    };
};

// Set selected location
export const selectLocation = (locationId) => {
    return (dispatch) => {
        eventCount = 0;
        dispatch({ type: Actions.ON_LOCATION_SELECTED, locationId });
    };
};

// Set selected location
export const setDateFilter = (value) => {
    return (dispatch, getState) => {
        let locationObj = getState().prematch.locationObj;
        let locationArray = [];
        //dispatch(selectLocation(null));
        if(format(new Date(), 'yyyy-MM-dd') !== value) {
            forIn(locationObj, (leagueObj, key) => {
            let count = 0;
            forIn(leagueObj, (leagues, key2) => {
                if(typeof leagues === 'object' && leagues.start_date[value]){
                    count = count + leagues.start_date[value];
                }
                }); 
                if( count > 0)
                    locationArray.push({
                        location_id: key,
                        name: locationObj[key].name,
                        fixtures_count: count,
                        name_en: locationObj[key].name_en,
                        name_tr: locationObj[key].name_tr,
                        name_nl: locationObj[key].name_nl,
                        name_de: locationObj[key].name_de,
                        name_ru: locationObj[key].name_ru,
                    });
            });
        }      
        else {
            forEach(Object.keys(locationObj), (location) => {
                if(location !== 'count')
                locationArray.push({
                    location_id: location,
                    name: locationObj[location].name,
                    fixtures_count: locationObj[location].count,
                    name_en: locationObj[location].name_en,
                    name_tr: locationObj[location].name_tr,
                    name_nl: locationObj[location].name_nl,
                    name_de: locationObj[location].name_de,
                    name_ru: locationObj[location].name_ru,

                });
            });
        }
        locationArray = sortedLocations(locationArray);
        dispatch(setPrematchLocations(locationArray));
        dispatch({ type: Actions.SET_PREMATCH_DATE_FILTER, value });
    };
};

export const getPrematchLocationsMobile = (nextToken) => {
    return (dispatch, getState) => {
        let sportId = getState().prematch.selectedSport;
        dispatch(getTodaySportEvents(sportId));
    };
};

export const setPrematchDateFilter = (value = format(new Date(), 'yyyy-MM-dd')) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_DATE_FILTER, value });
    };
};

export const resetPrematch = () => {
    return (dispatch) => {
        dispatch({type: Actions.RESET_PREMATCH });
    };
};

const getTodaySportEvents = (sportId) => {
    return (dispatch, getState) => {
        jwtService
            .getPrematches(sportId)
            .then((data) => {
                let { sport } = data;
                sport = JSON.parse(sport) || {};
                let prematchData = [];
                Object.entries(sport).forEach(([key,value]) => {
                    let { start_date } = value;
                    return prematchData.push({ fixture_id: key, start_date });
                });
                noOfBatches = 1;
                if (prematchData.length) {
                    noOfBatches = Math.ceil(prematchData.length / prematchEventBatchSize);
                    let j = 0;
                    for (let i = 1; i <=noOfBatches; i++) {
                        let segmentData = prematchData.slice(j, i*prematchEventBatchSize);
                        j = i*prematchEventBatchSize;
                        dispatch(getSportEventsMobile_2(segmentData, sportId));
                    }
                } else {
                    dispatch(getSportEventsMobile_2(prematchData, sportId));
                }
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

const getSportEventsMobile_2 = (fixtureArray, sportId = 1) => {
    return (dispatch, getState) => {
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[+sportId];
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        const eventObj = {};
        if (fixtureArray.length > 0) {
            fixtureArray.map((event,i) => eventObj[`:evt${i}`] = { fixture_id: `${event.fixture_id}` });
        }
        dynamoClient.batchGet(getPartialEventsBatch(eventObj), async (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let { PartialDevent: Items } = data.Responses;
                eventCount++;
                dispatch(setPartialLocations(Items));
                if( eventCount === noOfBatches) {
                    dispatch(fetchedAllData());
                }
            }
        });
    };
};
