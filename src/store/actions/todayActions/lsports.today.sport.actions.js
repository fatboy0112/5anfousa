import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import map from 'lodash.map';
import forEach from 'lodash.foreach';
import {setTodayLocations} from './lsports.today.location.actions';
import jwtService from '../../../services/jwtService';
import Util from '../../../helper/Util';
import {endOfDay, endOfToday, endOfTomorrow, format, startOfDay} from 'date-fns';
import {dynamoClient} from '../../../App';
import {
    getPartialEventsBatch,
    getTodayEventsParams,
    getTodayEventsParamsDesktop,
    getTodayEventsParamsMobile
} from '../../../dynamo/todaysParam/getTodayEventsParams';
import {paramsMarketDataIndex} from '../../../dynamo/params';
import {sortedLocations, staticPrematchSports} from '../../../config/sports';
import {MARKET_FOR_OUTER_SLIDER_PREMATCH} from '../../../config/markets';
import {
    getAllSportsEventsCount,
    getAllSportsEventsCountDesktop,
    getAllSportsEventsCountMobile
} from '../../../dynamo/todaysParam/getAllSportFixture';
import groupBy from 'lodash.groupby';
import {updateBetslipEventsMarket} from '../betslip.actions';
import {isMobileOnly} from 'react-device-detect';
import {prematchEventBatchSize, prematchMarketSize, totalSegments} from '../../../config';
import orderBy from 'lodash.orderby';

// Get sports list
let sportEventCount = [];
let sportCount = 0;
let eventCount = 0;

let sportEventCountDesktop = [];
let sportCountDesktop = 0;
let eventCountDesktop = 0;

let sportObjectCount = {};
let noOfBatches = 1;

export const getTodaySportsMobile = () => {
    return (dispatch, getState) => {
        sportEventCount = [];
        sportCount = 0;
        const sportsArr = [];
        Object.keys(staticPrematchSports()).forEach((key,i) => sportsArr.push(+key));
        for(let i=0; i<sportsArr.length ; i++) {
            dispatch(getTodaySportCount(sportsArr[i]));
        }
    };
};

const getTodaySportCount = (sportId) => {
    return (dispatch, getState) => {
        sportObjectCount = {};
        jwtService
            .getPrematches(sportId)
            .then((data) => {
                sportCount++;
                if (!data || !data.sport) {
                    sportObjectCount[sportId] = 0;
                } else {
                    let { sport } = data;
                    let todayData = [];
                    sport = JSON.parse(sport);
                    const dateRange = [new Date().toISOString(), new Date(endOfTomorrow()).toISOString()];
                    Object.entries(sport).forEach(([key,value]) => {
                        let { start_date } = value;
                        if (new Date(start_date) >= new Date(dateRange[0]) && new Date(start_date) <= new Date(dateRange[1])) {
                            return todayData.push({ fixture_id: key, start_date });
                        }
                    });
                    sportObjectCount[sportId] = todayData.length || 0;
                }
                if(sportCount === Object.keys(staticPrematchSports()).length) {
                    dispatch({ type: Actions.SET_TODAY_SPORTS, sportCountObj: sportObjectCount });                    
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

export const getTodaySports = () => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        
        lSportsService
            .getSports(language)
            .then((sports) => {
                dispatch(setTodaySports(sports));
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

// Set sports list
export const setTodaySports = (sports, nextToken) => {
    return (dispatch) => {
        if (!sports) sportEventCount = [];
        const sportObj = {};
        Object.keys(staticPrematchSports()).map((key,i) => sportObj[`:sport${i}`] = +key);

        // Getting events till the end of tomorrow as Upcoming section;
        const dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];
        dynamoClient.scan(getAllSportsEventsCount(sportObj, dateRange, nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const { LastEvaluatedKey, Items } = data;
                sportEventCount.push( ...Items );
                if (LastEvaluatedKey) {
                    dispatch(fetchMore(setTodaySports, LastEvaluatedKey, sportObj));
                } else {
                    let sportCountObj = {};
                    const sportGrp = groupBy(sportEventCount, 'sport_id');
                    forEach(Object.values(sportObj), sport => {
                        sportCountObj[sport] = sportGrp[sport]?.length || 0;
                    });
                    dispatch({ type: Actions.SET_TODAY_SPORTS, sportCountObj });
                }
            }
        });
    };
};

// Select active sport
export const selectSport = (sportId, dontFetch) => {
    return (dispatch, getState) => {
        let page = getState().today.currentPage;
        //dispatch(getTodaySports());
        dispatch({ type: Actions.ON_TODAY_SPORT_SELECTED, sportId });
        if(!dontFetch)
        dispatch(getSportEvents(sportId, page));
        // dispatch(getTodayLocations(sportId));
    };
};

export const selectSportMobile = (sportId, dontFetch, dontClearMainEvents) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_TODAY_SPORT_SELECTED, sportId, dontClearMainEvents });
        if(!dontFetch){
            eventCount = 0;
            eventCountDesktop = 0;
            if (isMobileOnly) {
                dispatch(getTodaySportEvents(sportId));
            } else {
                dispatch(getSportEvents(sportId));
            }
        }
    };
};

const getTodaySportEvents = (sportId) => {
    return (dispatch, getState) => {
        jwtService
            .getPrematches(sportId)
            .then((data) => {
                let { sport } = data;
                let todayData = [];
                sport = JSON.parse(sport);
                const dateRange = [new Date().toISOString(), new Date(endOfTomorrow()).toISOString()];
                Object.entries(sport).forEach(([key,value]) => {
                    let { start_date } = value;
                    if (new Date(start_date) >= new Date(dateRange[0]) && new Date(start_date) <= new Date(dateRange[1])) {
                        return todayData.push({ fixture_id: key, start_date });
                    }
                });
                todayData = orderBy(todayData, ['start_date'], ['asc']);
                noOfBatches = 1;
                if (todayData.length) {
                    noOfBatches = Math.ceil(todayData.length / prematchEventBatchSize);
                    let j = 0;
                    for (let i = 1; i <=noOfBatches; i++) {
                        let segmentTodayData = todayData.slice(j, i*prematchEventBatchSize);
                        j = i*prematchEventBatchSize;
                        dispatch(getSportEventsMobile_2(segmentTodayData, sportId));
                    }
                } else {
                    dispatch(getSportEventsMobile_2(todayData, sportId));
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
        const lan = getState().general.language;
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
                let selectedSport = getState().today.selectedSport;
                Items = await Util.partialMatchFormatter(Items, lan, defaultMktObj);
                let sport = Items[0]?.sport_id;
                if (Items.length && sport !== selectedSport) return null;
                eventCount++;
                let fetching = eventCount === noOfBatches ? false : true;
                dispatch(setSportEvents(Items, fetching, fetching));
                if( eventCount === noOfBatches) {
                    let initialEvents = Items.slice(0, prematchMarketSize);
                    dispatch({ type: Actions.SET_TODAY_EVENTS_MARKETS, events: initialEvents, nextIndex: 0 });
                    let locations = {};
                    let matches = getState().today.partialAllEvents;
                    matches.map(match => locations[match.location.Id] = { ...match.location, name: match.location.name_en });
                    let locationArr = sortedLocations(Object.values(locations));
                    dispatch(setTodayLocations(locationArr));
                }
            }
        });
    };
};

// Set sports list
// export const setTodaySportsWithDateRange = (sports, nextToken) => {
//     return (dispatch, getState) => {
//         const dateFilter = getState().today.dateFilter;
//         if (!sports) sportEventCount = [];
//         const sportObj = {};
//         Object.keys(staticPrematchSports()).map((key,i) => sportObj[`:sport${i}`] = +key);

//         // Getting events till the end of tomorrow as Upcoming section;
//         let dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];

//         // used for desktop date range
//         if (dateFilter) {
//             if (dateFilter === 'all' || dateFilter === format(new Date(), 'yyyy-MM-dd')) dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];
//             else dateRange = [new Date(startOfDay(new Date(dateFilter))).toISOString(), new Date(endOfDay(new Date(dateFilter))).toISOString()];
//         }
//         dynamoClient.scan(getAllSportsEventsCount(sportObj, dateRange, nextToken), (err, data) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 const { LastEvaluatedKey, Items } = data;
//                 sportEventCount.push( ...Items );
//                 if (LastEvaluatedKey) {
//                     dispatch(fetchMore(setTodaySportsWithDateRange, LastEvaluatedKey, sportObj));
//                 } else {
//                     let sportCountObj = {};
//                     const sportGrp = groupBy(sportEventCount, 'sport_id');
//                     forEach(Object.values(sportObj), sport => {
//                         sportCountObj[sport] = sportGrp[sport]?.length || 0;
//                     });
//                     dispatch({ type: Actions.SET_TODAY_SPORTS, sportCountObj });
//                 }
//             }
//         });
//     };
// };

// Get market data for set of fixture
export const getMarketData = (data, startIndex, count) => {
    return (dispatch, getState) => {
        let betFixtures = getState().betslip.fixtures;
        let eventCount = 0;
        let marketsArray = [];
        if (!data.length) return null;
        const { sport_id: sportId } = data[0];
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId];
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        forEach(data, (event, i) => {
            let markets = {};
            // 25715992
            dynamoClient.query(paramsMarketDataIndex(`${event.fixture_id}`), (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let Items = res?.Items;
                    if(Items.length) markets = Util.marketFormatter(Items, event.fixture_id);
                    // console.log('markets ', markets);
                    
                    // });
                    if(Object.keys(markets).length && betFixtures.length) {
                        // dispatch(updateBetslipEvent({FixtureId: event.fixture_id, Market: JSON.parse(market) }));
                        dispatch(updateBetslipEventsMarket({[event.fixture_id]: { FixtureId: event.fixture_id, Market: markets }}));
                    }
                    let livescore = sessionStorage.getItem('liveScore');
                    if (livescore) {
                        livescore = JSON.parse(livescore);
                        sessionStorage.removeItem('liveScore');
                    }
                    marketsArray[i] = { [event.fixture_id] : { market: markets, livescore }};
                    eventCount++;
                }
            if(eventCount === count) {
                let allData  = getState().today.partialAllEvents;
                allData = allData.reduce((ac, a) => ({ ...ac, [ a.fixture_id ]: a }), {});
                marketsArray = map(marketsArray, (market, idx) => {
                    let values = Object.values(market);
                    let mktData = values[0]?.market || {};
                    let score = values[0]?.livescore || null;
                    return {
                        ...allData[Object.keys(market)[0]],
                        market: {
                            ...defaultMktObj,
                            ...mktData,
                        },
                        livescore: score,
                    };
                });
                dispatch({ type: Actions.SET_TODAY_EVENTS_MARKETS, events: marketsArray, nextIndex: startIndex + count });
            }
            });
        });
    };
};

// Get sport events list
export const getSportEvents = (sportId) => {
    return (dispatch, getState) => {
        const dateFilter = getState().today.dateFilter;
        let nextToken = getState().today.nextToken;
        let dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];

        // used for desktop date range
        if (!isMobileOnly && dateFilter) {
            if (dateFilter === 'all') return null;
            if (dateFilter === format(new Date(), 'yyyy-MM-dd')) dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];
            else dateRange = [new Date(startOfDay(new Date(dateFilter))).toISOString(), new Date(endOfDay(new Date(dateFilter))).toISOString()];
        }
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[+sportId];
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        dynamoClient.scan(getTodayEventsParams(sportId, dateRange, nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let { Items, LastEvaluatedKey } = data;
                let selectedSport = getState().today.selectedSport;
                Items = Items.map(match => {
                    match.market = defaultMktObj;
                    match.market_count = 0;
                    match.livescore = {};
                    match.participant_one_full = JSON.parse(match.participant_one_full);
                    match.participant_two_full = JSON.parse(match.participant_two_full);
                    match.participant_one_full = { ...match.participant_one_full };
                    match.participant_two_full = { ...match.participant_two_full };
                    match.participants = [match.participant_one_full, match.participant_two_full];
                    match.league = { ...JSON.parse(match.league), Id: match.league_id };
                    if (match.league_id) match.league = { ...match.league, Id: match.league_id };
                    if(match.location) {
                        match.location = JSON.parse(match.location);
                        if (match.location_id) match.location = {...match.location, Id: match.location_id };
                    }
                    return match;
                });
                let sport = Items[0]?.sport_id;
                if (Items.length && sport !== selectedSport) return null;
                dispatch(setSportEvents(Items, LastEvaluatedKey, LastEvaluatedKey));
                if (LastEvaluatedKey) {
                    dispatch(fetchMore(getSportEvents, LastEvaluatedKey, sportId));
                }
                else {
                    let locations = {};
                    let matches = getState().today.partialAllEvents;
                    matches.map(match => locations[match.location.Id] = { ...match.location, name: match.location.name_en });
                    let locationArr = sortedLocations(Object.values(locations));
                    dispatch(setTodayLocations(locationArr));
                }
            }
        }); 
    };
};


const fetchMore = (action, token, params) => {
    return (dispatch) => {
        dispatch(action(params, token));
    };
};

// Set sport events list
export const setSportEvents = (events, hasNextPage, nextToken) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TODAY_SPORT_EVENTS, events, hasNextPage, nextToken });
    };
};

// Clear sport events list
export const clearSportEvents = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_TODAY_SPORT_EVENTS });
    };
};

// // Change date filter for desktop
// export const setDateFilter = (value) => {
//     return (dispatch) => {
//         dispatch({ type: Actions.SET_TODAY_DATE_FILTER, value });
//     };
// };

// set updated data for specific match
export const setUpdatedMatchData = (event) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_UPDATED_MATCH_DATA, event });
    };
};

export const setTodaySportsMobile = (sports, i) => {
    return (dispatch) => {
        // if (!sports) sportEventCount = [];
        const sportObj = {};
        Object.keys(staticPrematchSports()).map((key,i) => sportObj[`:sport${i}`] = +key);

        // Getting events till the end of tomorrow as Upcoming section;
        const dateRange = [new Date().toISOString(), new Date(endOfTomorrow()).toISOString()];
        dynamoClient.scan(getAllSportsEventsCountMobile(sportObj, dateRange, i, totalSegments), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                sportCount++;
                const { Items } = data;
                sportEventCount.push( ...Items );

                 if(sportCount === totalSegments) {
                     // TODO to add condition of excess data from BE more than no of segments
                    //  if(LastEvaluatedKey) {
                    //     dispatch(setTodaySportsMobile(null, null , LastEvaluatedKey ));
                    //  }
                    //  else {
                        let sportCountObj = {};
                        const sportGrp = groupBy(sportEventCount, 'sport_id');
                        forEach(Object.values(sportObj), sport => {
                            sportCountObj[sport] = sportGrp[sport]?.length || 0;
                        });
                        dispatch({ type: Actions.SET_TODAY_SPORTS, sportCountObj });
                    //  }
                    
                }
            }
        });
    };
};

export const getSportEventsMobile = (sportId, i) => {
    return (dispatch, getState) => {
        // let language = getState().general.language;
        const dateFilter = getState().today.dateFilter;
        let nextToken = getState().today.nextToken;
        const lan = getState().general.language;
        let dateRange = [new Date().toISOString(), new Date(endOfTomorrow()).toISOString()];
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[+sportId];
        // used for desktop date range
        if (dateFilter) {
            if (dateFilter === 'all' || format(new Date(), 'yyyy-MM-dd')) dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];
            else dateRange = [new Date(startOfDay(new Date(dateFilter))).toISOString(), new Date(endOfDay(new Date(dateFilter))).toISOString()];
        }
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        const totalSeg = nextToken ? null : totalSegments;
        dynamoClient.scan(getTodayEventsParamsMobile(+sportId, dateRange, nextToken, i, totalSeg ), async (err, data) => {
            if (err) {
                console.log(err);
            } else {
                
                let { Items } = data;
                let selectedSport = getState().today.selectedSport;
                Items = await Util.partialMatchFormatter(Items, lan, defaultMktObj);
                let sport = Items[0]?.sport_id;
                if (Items.length && sport !== selectedSport) return null;
                if(!nextToken)
                eventCount++;
                let fetching = eventCount === totalSegments ? false : true;
                dispatch(setSportEvents(Items, fetching, fetching));
                
                if( eventCount === totalSegments) {
                    // TODO to add condition of excess data from BE more than no of segments
                    // if(LastEvaluatedKey) {
                    //     dispatch(getSportEventsMobile(sportId, null , LastEvaluatedKey ));
                    // } else {
                        let locations = {};
                        let matches = getState().today.partialAllEvents;
                        matches.map(match => locations[match.location.Id] = { ...match.location, name: match.location.name_en });
                        let locationArr = sortedLocations(Object.values(locations));
                        dispatch(setTodayLocations(locationArr));
                    // }
                }
            }
        }); 
    };
};

export const getSportEventsDesktop = () => {
    return (dispatch,getState) => {    
        const sportId = getState().today.selectedSport; 
        eventCountDesktop = 0;
        dispatch(getTodaySportEventsDesktop(sportId));
    };
};

const getTodaySportEventsDesktop = (sportId) => {
    return (dispatch, getState) => {
        jwtService
            .getPrematches(sportId)
            .then((data) => {
                if (!data || !data.sport) {
                    dispatch(setSportEvents([], false, null));
                    dispatch(setTodayLocations([]));
                    return;
                }

                let { sport } = data;
                let todayData = [];
                sport = JSON.parse(sport);

                let dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];

                Object.entries(sport).forEach(([key,value]) => {
                    let { start_date } = value;
                    if (new Date(start_date) >= new Date(dateRange[0]) && new Date(start_date) <= new Date(dateRange[1])) {
                        return todayData.push({ fixture_id: key, start_date });
                    }
                });
                todayData = orderBy(todayData, ['start_date'], ['asc']);
                noOfBatches = 1;
                if (todayData.length) {
                    noOfBatches = Math.ceil(todayData.length / prematchEventBatchSize);
                    let j = 0;
                    for (let i = 1; i <=noOfBatches; i++) {
                        let segmentTodayData = todayData.slice(j, i*prematchEventBatchSize);
                        j = i*prematchEventBatchSize;
                        dispatch(getSportEventsForDesktop_2(segmentTodayData, sportId));
                    }
                } else {
                    // dispatch(getSportEventsForDesktop_2(todayData, sportId));
                    dispatch(setSportEvents([], false, null));
                    dispatch(setTodayLocations([]));
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

const getSportEventsForDesktop_2 = (fixtureArray, sportId = 1) => {
    return (dispatch, getState) => {
        const lan = getState().general.language;
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
                let selectedSport = getState().today.selectedSport;
                Items = await Util.partialMatchFormatter(Items, lan, defaultMktObj);
                let sport = Items[0]?.sport_id;
                if (Items.length && sport !== selectedSport) return null;
                eventCountDesktop++;
                let fetching = eventCountDesktop === noOfBatches ? false : true;
                dispatch(setSportEvents(Items, fetching, fetching));
                if( eventCountDesktop === noOfBatches) {
                    let initialEvents = Items.slice(0, prematchMarketSize);
                    dispatch({ type: Actions.SET_TODAY_EVENTS_MARKETS, events: initialEvents, nextIndex: 0 });
                    let locations = {};
                    let matches = getState().today.partialAllEvents;
                    matches.map(match => locations[match.location.Id] = { ...match.location, name: match.location.name_en });
                    let locationArr = sortedLocations(Object.values(locations));
                    dispatch(setTodayLocations(locationArr));
                }
            }
        });
    };
};


export const getSportEventsForDesktop = (sportId, i) => {
    return (dispatch, getState) => {
        let lan = `name_${ getState().general.language }`;
        const dateFilter = getState().today.dateFilter;
        let nextToken = getState().today.nextToken;
        let dateRange = [new Date().toISOString(), new Date(endOfTomorrow()).toISOString()];
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[+sportId];
        // used for desktop date range
        if (dateFilter) {
            if (dateFilter === 'all'|| dateFilter === format(new Date(), 'yyyy-MM-dd')) dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];
            else dateRange = [new Date(startOfDay(new Date(dateFilter))).toISOString(), new Date(endOfDay(new Date(dateFilter))).toISOString()];
        }
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        const totalSeg = nextToken ? null : totalSegments;
        dynamoClient.scan(getTodayEventsParamsDesktop(sportId, dateRange, nextToken, i, totalSeg ), async (err, data) => {
            if (err) {
                console.log(err);
            } else {
                
                let { Items } = data;
                let selectedSport = getState().today.selectedSport;
                Items = await Util.partialMatchFormatter(Items, lan, defaultMktObj);
                let sport = Items[0]?.sport_id;
                if (Items.length && sport !== selectedSport) return null;
                if(!nextToken)
                eventCountDesktop++;
                let fetching = eventCountDesktop === totalSegments ? false : true;
                dispatch(setSportEvents(Items, fetching, fetching));
                
                if( eventCountDesktop === totalSegments) {
                    // TODO to add condition of excess data from BE more than no of segments
                    // if(LastEvaluatedKey) {
                    //     dispatch(getSportEventsMobile(sportId, null , LastEvaluatedKey ));
                    // } else {
                        let locations = {};
                        let matches = getState().today.partialAllEvents;
                        matches.map(match => locations[match.location.Id] = { ...match.location, name: match.location.Name });
                        let locationArr = sortedLocations(Object.values(locations));
                        dispatch(setTodayLocations(locationArr));
                    // }
                }
            }
        }); 
    };
};

export const setTodaySportsWithDateRangeDesktop = () => {
    return (dispatch) => {    
        sportEventCountDesktop = [];
        sportCountDesktop = 0;
        dispatch(getTodaySportCountDesktop(1));
    };
};

const getTodaySportCountDesktop = (sportId) => {
    return (dispatch, getState) => {
        sportObjectCount = {};
        jwtService
            .getPrematches(sportId)
            .then((data) => {
                if (!data || !data.sport_count) return;

                let { sport_count } = data;
                sportCount = JSON.parse(sport_count);

                const sportsArr = [];
                Object.keys(staticPrematchSports()).forEach((key,i) => sportsArr.push(+key));

                sportsArr.forEach((id) => {
                    sportCountDesktop++;
                    sportObjectCount[id] = sportCount[id] || 0;
                });

                if(sportCountDesktop === sportsArr.length) {
                    dispatch({ type: Actions.SET_TODAY_SPORTS, sportCountObj: sportObjectCount });                    
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

export const setTodaySportsDesktop = (sports, i) => {
    return (dispatch,getState) => {
        const dateFilter = getState().today.dateFilter;
        if (!sports) sportEventCount = [];
        const sportObj = {};
        Object.keys(staticPrematchSports()).map((key,i) => sportObj[`:sport${i}`] = +key);

        // Getting events till the end of tomorrow as Upcoming section;
        let dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];

        // used for desktop date range
        if (dateFilter) {
            if (dateFilter === 'all' || format(new Date(), 'yyyy-MM-dd')) dateRange = [new Date().toISOString(), new Date(endOfToday()).toISOString()];
            else dateRange = [new Date(startOfDay(new Date(dateFilter))).toISOString(), new Date(endOfDay(new Date(dateFilter))).toISOString()];
        }
        
        dynamoClient.scan(getAllSportsEventsCountDesktop(sportObj, dateRange, i, totalSegments), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                sportCountDesktop++;
                const { Items } = data;
                sportEventCountDesktop.push( ...Items );

                 if(sportCountDesktop === totalSegments) {
                     // TODO to add condition of excess data from BE more than no of segments
                    //  if(LastEvaluatedKey) {
                    //     dispatch(setTodaySportsMobile(null, null , LastEvaluatedKey ));
                    //  }
                    //  else {
                        let sportCountObj = {};
                        const sportGrp = groupBy(sportEventCountDesktop, 'sport_id');
                        forEach(Object.values(sportObj), sport => {
                            sportCountObj[sport] = sportGrp[sport]?.length || 0;
                        });
                        dispatch({ type: Actions.SET_TODAY_SPORTS, sportCountObj });
                    //  }
                    
                }
            }
        });
    };
};
export const clearPartialEvents = () => {
    return (dispatch) =>{
        dispatch({type: Actions.CLEAR_PARTIAL_EVENTS})
    }
}
