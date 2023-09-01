import * as Actions from '../actionTypes';
import { forEach, isEmpty, filter, groupBy, orderBy } from 'lodash';
import { dynamoClient } from '../../../App';
import { paramsLastMinute, paramsMarketData } from '../../../dynamo/params';
import map from 'lodash.map';
import { MARKET_FOR_OUTER_SLIDER, MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../../config/markets';

// Get sports list
let eventCount;
let marketsArray = [];
export const getLastMinuteSports = (nextToken) => {
    return (dispatch, getState) => {
        dynamoClient.scan(paramsLastMinute(nextToken), (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    if(data.LastEvaluatedKey) {
                        dispatch(fetchMore(data.LastEvaluatedKey));
                    } else {
                        dispatch(fetchedAllData());
                    }
                    dispatch(setLastMinuteSports(data.Items, data.LastEvaluatedKey));
                }
            }); 
    };
};

export const checkLastMin = (nextToken) => {
    return (dispatch) => {
        dynamoClient.scan(paramsLastMinute(nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if(data.Items.length > 0) {
                    dispatch({ type: Actions.IS_LAST_MIN_AVAILABLE, isLastMinAvailable: true });
                }
                else if(data.LastEvaluatedKey) {
                    dispatch(checkLastMin(data.LastEvaluatedKey));
                } else {
                    dispatch({ type: Actions.IS_LAST_MIN_AVAILABLE, isLastMinAvailable: false });
                }
            }
        });
    };
};



const fetchMore = (token) => {
    return (dispatch) => {
        dispatch(getLastMinuteSports(token));
    };
}; 

const fetchedAllData = () => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_LAST_MINUTE_FETCHED_ALL });        
    };
};

const getMarketData = (fixture_id, startIndex, i, count) => {
    return (dispatch, getState) => {
    
    dynamoClient.query(paramsMarketData(fixture_id), (err, data) => {
        if (err) {
            console.log(err);
        } else {
            marketsArray[i] = { [data.Items[0]?.fixture_id] : JSON.parse(data.Items[0]?.market)};
            eventCount++;
        }
        if(eventCount === count) {
            let allData  = getState().lastMinute.allData;
            let selectedSport  = getState().lastMinute.selectedSport;
            // If fixtures id's are same club the data
            marketsArray = map(marketsArray, (market , i) =>{
                if(market && !isEmpty(allData) && allData[selectedSport] && Object.keys(market)[0] == allData[selectedSport][startIndex + i].fixture_id) {
                    return { ...allData[selectedSport][startIndex + i], market: {...allData[selectedSport][startIndex + i].market, ...Object.values(market)[0]}};
                }
            });
            marketsArray = filter(marketsArray, (event) => event );
    
            if(marketsArray.length > 0) {
                dispatch(setSportEvents(marketsArray, startIndex + count));
            }
        };
    }); 
};
};
export const setLastMinCount = (sportsCount) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_LAST_MINUTE_COUNT, sportsCount });        
    }
}

// Set sports list
export const setLastMinuteSports = (sports, hasNext) => {
    return (dispatch, getState) => {
        let events = getState().lastMinute.sports;
        let allData;
        let sportsObj = {};
        if(!hasNext && events) {
            events = events.concat(sports);
            allData = filter(events, (event) => {
                return event && event.sport_id && event.location && event.participant_one_full && event.participant_two_full && event.league
            });
            allData = map(allData, (match) => {
                match.league = match?.league && JSON.parse(match?.league);
                match.location = match?.location && JSON.parse(match?.location);
                match.participant_one_full = match?.participant_one_full && JSON.parse(match?.participant_one_full);
                match.participant_two_full = match?.participant_two_full && JSON.parse(match?.participant_two_full);
                match.sport = match?.sport && JSON.parse(match?.sport);
                const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[match.sport_id];
                const defaultMktObj = {};
                defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
                match.market = defaultMktObj;
                if(match?.sport_id && !sportsObj[match?.sport_id]){
                    sportsObj[match?.sport_id] = 0;
                }
                if (match?.sport_id)
                sportsObj[match?.sport_id] = sportsObj[match?.sport_id] + 1;
                return match;
            });
            allData = groupBy(allData, function (event) {
                return `${event?.sport_id}`;
            });
            forEach(Object.keys(allData), (sportId) => {
                allData[sportId] = orderBy(allData[sportId], ['start_date'], ['asc']);
            });
            dispatch({ type: Actions.SET_LAST_MINUTE_SPORTS, sports: events, allData, sportsObj });
        }
        else {
            dispatch({ type: Actions.SET_LAST_MINUTE_SPORTS, sports });
        }
    };
};

export const setClearData = () => {
    return (dispatch) => {

        dispatch({ type: Actions.SET_LAST_MINUTE_CLEAR_DATA });
    };
};

// Select active sport
export const selectSport = (sportId) => {
    return (dispatch, getState) => {
        // dispatch(getLastMinuteSports());
        dispatch({ type: Actions.ON_LAST_MINUTE_SPORT_SELECTED, sportId, mainSelectedMarket: MARKET_FOR_OUTER_SLIDER[sportId][0].Id });
        // dispatch(getSportEvents(sportId, page));
    };
};

// Get sport events list
export const getSportEvents = (eventsArray, startIndex, count) => {
    return (dispatch, getState) => {
        eventCount = 0;
        marketsArray = [];
        forEach(eventsArray, (event, i) => {
            dispatch(getMarketData(event.fixture_id, startIndex, i ,count));
        });
    };
};

// Set sport events list
export const setSportEvents = (events, nextIndex) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.SET_LAST_MINUTE_SPORT_EVENTS, events, nextIndex });
    };
};

// Clear sport events list
export const clearSportEvents = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_LAST_MINUTE_SPORT_EVENTS });
    };
};
