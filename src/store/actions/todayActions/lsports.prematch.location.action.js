import Util from '../../../helper/Util';
import * as Actions from '../actionTypes';
import map from 'lodash.map';
import forEach from 'lodash.foreach';
import { forIn, isEmpty } from 'lodash';
import { sortedLocations } from '../../../config/sports';
import { format, differenceInMinutes } from 'date-fns';
import { dynamoClient } from '../../../App';
import { paramsPrematchLocations } from '../../../dynamo/params';
import { setTodayLocations } from './lsports.today.location.actions';
import { MARKET_FOR_OUTER_SLIDER, MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../../config/markets';
import orderBy from 'lodash.orderby';
import jwtService from '../../../services/jwtService';
import { toastr } from 'react-redux-toastr';
import { getPartialEventsBatch } from '../../../dynamo/todaysParam/getTodayEventsParams';
import { prematchEventBatchSize } from '../../../config';

let count =0;
let noOfBatches = 1;

export const getPrematchLocationsDesktop = () => {
    return (dispatch, getState)=>{
        let sportId = getState().today.selectedSport;
        count=0;
        dispatch(getTodaySportEvents(sportId));
    };
};

const getTodaySportEvents = (sportId) => {
    return (dispatch, getState) => {
        jwtService
            .getPrematches(sportId)
            .then((data) => {
                if (!data || !data.sport) {
                    dispatch(fetchedAllData());
                    return;
                }
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
                        dispatch(getSportEventsDesktop_2(segmentData, sportId));
                    }
                } else {
                    dispatch(getSportEventsDesktop_2(prematchData, sportId));
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

const getSportEventsDesktop_2 = (fixtureArray, sportId = 1) => {
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
                dispatch({ type: Actions.SET_TODAY_PARTIAL_LOCATIONS, locations: Items });        
                count++;
                if(count === noOfBatches) {
                    dispatch(fetchedAllData());
                }
            }
        });
    };
};

// Get locations list
export const getPrematchLocations = (nextToken) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        let dateFilter = getState().today.dateFilter;
        let sportId = getState().today.selectedSport;
        dynamoClient.scan(paramsPrematchLocations(sportId, nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                dispatch({ type: Actions.SET_TODAY_PARTIAL_LOCATIONS, locations: data.Items });
                if(data.LastEvaluatedKey) {
                    dispatch(getPrematchLocations(data.LastEvaluatedKey));
                } else {
                    dispatch(fetchedAllData());
                }
            }
        });
    };
};

export const clearPartialLocations = () => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_PARTIAL_LOCATIONS, clear: true });
    };
};

const fetchedAllData = () => {
    return (dispatch, getState) => {
        let partialLocations = getState().today.partialLocations;
        let partialEventsArray = getState().today.partialAllEvents;
        let currentMainData = getState().today.mainEvents;
        let locationObj = {};
        let dateFilter = getState().today.dateFilter;
        let selectedLocation = getState().today.selectedLocation;
        let newPartialLocations = partialLocations.filter(event => differenceInMinutes(Util.getFormattedDate(event.start_date),new Date())> 0);
        
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
        dispatch({ type: Actions.SET_TODAY_PARTIAL_LOCATIONS, sort: true, partialLocations: newPartialLocations });
        dispatch(setLocationObj(locationObj));
        if (dateFilter === 'all' && !partialEventsArray.length) dispatch({ type: Actions.SET_TODAY_SPORT_EVENTS, events: orderBy(newPartialLocations, ['start_date'], ['asc']) });
        if (!currentMainData?.length) dispatch({ type: Actions.SET_TODAY_SPORT_EVENTS, events: [], nextToken: false });
        dispatch(setDateFilter(dateFilter));
    };
};

export const setLocationObj = (locationObj) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TODAY_LOCATIONS_OBJECT, locationObj });
    };
};

// Get leagues for a particular location
export const getPrematchLeagueForLocation = (locationId) => {
    return (dispatch, getState) => {
        let locationObj = getState().today.locationObj;
        let dateFilter = getState().today.dateFilter;
        const leaguesArray = [];
        if(format(new Date(), 'yyyy-MM-dd') === dateFilter) {

            forEach(Object.keys(locationObj[locationId]), (league) => {
                if(!isNaN(league)) {
                    leaguesArray.push({location_id: parseInt(league), name: locationObj[locationId][league].name, fixtures_count: locationObj[locationId][league].count, start_date: locationObj[locationId][league].start_date, ...locationObj[locationId][league]})
                }
            });
        }
        else {
            forEach(Object.keys(locationObj[locationId]), (league) => {
                if(!isNaN(league) && locationObj[locationId][league].start_date[dateFilter])
                leaguesArray.push({location_id: parseInt(league), name: locationObj[locationId][league].name, fixtures_count: locationObj[locationId][league].start_date[dateFilter]})
            });

        }
        dispatch(setPrematchLeaguesForLocation([{leagues: leaguesArray}]));

    };
};

// Set locations list
export const setPrematchLeaguesForLocation = (leagues) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_LEAGUE_FOR_LOCATION, leagues });
    };
};

// Set selected location
export const setDateFilter = (value) => {
    return (dispatch, getState) => {
        let locationObj = getState().today.locationObj;
        let locationArray = [];
        if(value !== 'all') {
            forIn(locationObj, (leagueObj, key) => {
            let count = 0;
            forIn(leagueObj, (leagues, key2) => {
                if(typeof leagues === 'object' && leagues.start_date[value]){
                    count = count + leagues.start_date[value];
                }
                }); 
                if( count > 0)
                    locationArray.push({Id: key, Name: locationObj[key].name, name: locationObj[key].name, fixtures_count: count});
			});
        }      
        else {
            forEach(Object.keys(locationObj), (location) => {
                if(location !== 'count')
                locationArray.push({
                    Id: location,
                    Name: locationObj[location].name,
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
        dispatch(setTodayLocations(locationArray));
        dispatch({ type: Actions.SET_TODAY_DATE_FILTER, value });
    };
};
