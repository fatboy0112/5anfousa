import map from 'lodash.map';
import forEach from 'lodash.foreach';
import * as Actions from './actionTypes';
// import lSportsService from '../../services/lSportsService';
// import { logoutUser } from './user.actions';
// import { setLoading } from './general.actions';
import { homePageLeagues } from '../../config/sports';
import { dynamoClient } from '../../App';
import { paramsHomeLeaguesEvents, paramsHomeLeaguesEventsMobile, paramsHomeLeaguesEventsDesktop, paramsMarketDataIndex } from '../../dynamo/params';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import { differenceInDays } from 'date-fns';
import Util from '../../helper/Util';
import { totalSegments } from '../../config';


// Get home page main leagues list
// export const getHomeLeagues = () => {
//     return (dispatch) => {
//         dispatch(setLoading(true));

//         lSportsService
//             .getHomeLeagues()
//             .then((leagues) => {
//                 dispatch(setLoading(false));
//                 dispatch(setHomeLeagues(leagues));
//             })
//             .catch((error) => {
//                 console.error(error);
//                 dispatch(setLoading(false));
//                 if (error && error.response && error.response.status && error.response.status === 401) {
//                     Util.handleRepeatedLogin(error.response);
//                 } else {
//                     toastr.error('', 'Something went wrong.');
//                 }
//             });
//     };
// };

let eventCount = 0;
let eventCountDesktop = 0


// Set home page main leagues list
export const setHomeLeagues = () => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_HOME_LEAGUES, leagues: homePageLeagues });
    };
};

// Set home items grid active
export const setHomeActive = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_HOME_ACTIVE, value });
    };
};

// Set league events active
export const setHomeLeaguesActive = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_HOME_LEAGUES_ACTIVE, value });
    };
};

// Select active league
export const selectHomeActiveLeague = (leagueId) => {
    return (dispatch) => {
        eventCountDesktop = 0
        eventCount = 0;
        dispatch({ type: Actions.ON_SELECT_HOME_ACTIVE_LEAGUE, leagueId });
    };
};

// Deselect active league
export const removeHomeActiveLeague = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_REMOVE_HOME_ACTIVE_LEAGUE });
    };
};

// Get market data for set of fixture
export const getMarketData = (data, startIndex, count) => {
    return (dispatch, getState) => {
        let eventCount = 0;
        let marketsArray = [];
        if (!data.length) return null;
        const { sport_id: sportId } = data[0];
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId];
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        forEach(data, (event, i) => {
            let markets = {};
            const fixtureId = event.fixture_id;
            dynamoClient.query(paramsMarketDataIndex(`${fixtureId}`), (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let Items = res?.Items;
                    if(Items.length) markets = Util.marketFormatter(Items, fixtureId);
                    let livescore = sessionStorage.getItem('liveScore');
                    if (livescore) {
                        livescore = JSON.parse(livescore);
                        sessionStorage.removeItem('liveScore');
                    }
                    marketsArray[i] = { [event.fixture_id]: {
                        market: markets,
                        livescore,
                    }};
                    eventCount++;
                }
                if(eventCount === count) {
                    let allData  = getState().home.partialAllEvents;
                    allData = allData.reduce((ac, a) => ({ ...ac, [ a.fixture_id ]: a }), {});
                    marketsArray = map(marketsArray, (market, idx) => {
                        let mktData = Object.values(market)[0];
                        return {
                            ...allData[Object.keys(market)[0]],
                            ...mktData,
                            market: {
                                ...defaultMktObj,
                                ...mktData.market,
                            },
                            livescore: mktData?.livescore || null,

                        };
                    });
                    dispatch({ type: Actions.SET_EVENTS_MARKETS_DATA, events: marketsArray, nextIndex: startIndex + count });
                }
            });
        });
    };
};

// Get home league events list
export const getHomeActiveLeagueEvents = (leagueId, nextToken) => {
    return (dispatch, getState) => {
        let sportId = 1; // sportID for football as all leagues are of football
        dynamoClient.scan(paramsHomeLeaguesEvents(leagueId, nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let { Items, LastEvaluatedKey } = data;
                if (Items?.length > 0) sportId = Items[0].sport_id;
                const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId]; 
                const defaultMktObj = {};
                defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
                Items = Items.map(match => {
                    match.market = defaultMktObj;
                    match.market_count = 0;
                    match.livescore = {};
                    match.participant_one_full = {};
                    match.participant_two_full = {};
                    match.participants = [match.participant_one_full, match.participant_two_full];
                    match.league = { ...JSON.parse(match.league), Id: match.league_id };
                    if(match.location) {
                        match.location = JSON.parse(match.location);
                        if (match.location_id) match.location = {...match.location, Id: match.location_id };
                    }
                    return match;
                });
                if (LastEvaluatedKey) dispatch(fetchMore(getHomeActiveLeagueEvents, LastEvaluatedKey, leagueId));
                Items = Items.filter(event => differenceInDays(Util.getFormattedDate(event.start_date),new Date())>= 0);
                dispatch(setHomeActiveLeagueEvents(Items, LastEvaluatedKey));
            }
        }); 
    };
};

const fetchMore = (action, token, params) => {
    return (dispatch) => {
        dispatch(action( params, token));
    };
};

// Set home league events list
export const setHomeActiveLeagueEvents = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_HOME_ACTIVE_LEAGUE_EVENTS, events, hasNextPage });
    };
};

// Select main market from markets slider (tabs)
export const selectMainMarket = (marketId) => {
    return (dispatch) => {
        dispatch({
            type: Actions.ON_HOME_MAIN_MARKET_SELECTED,
            marketId: marketId,
        });
    };
};

// Reset page number for request
export const setHomeResetPage = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_HOME_RESET_PAGE });
    };
};

// Clear home league events list
export const clearHomeActiveLeagueEvents = (dontClearLeagueId) => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_HOME_ACTIVE_LEAGUE_EVENTS, dontClearLeagueId });
    };
};

// WebSocket - update bet (price and status)
export const updateHomeEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_HOME_EVENTS_MARKET, events });
    };
};

// WebSocket - update event status
export const updateHomeEventsStatus = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_HOME_EVENTS_STATUS, events });
    };
};

export const getHomeActiveLeagueEventsMobile = (leagueId, i) => {
    return (dispatch, getState) => {
        let sportId = 1; // sportID for football as all leagues are of football
        dynamoClient.scan(paramsHomeLeaguesEventsMobile(leagueId, i, totalSegments), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let { Items } = data;
                if (Items?.length > 0) sportId = Items[0].sport_id;
                const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId]; 
                const defaultMktObj = {};
                defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
                Items = Items.map(match => {
                    match.market = defaultMktObj;
                    match.market_count = 0;
                    match.livescore = {};
                    match.participant_one_full = JSON.parse(match.participant_one_full);
                    match.participant_two_full = JSON.parse(match.participant_two_full);
                    match.participants = [match.participant_one_full, match.participant_two_full];
                    match.league = { ...JSON.parse(match.league), Id: match.league_id };
                    if(match.location) {
                        match.location = JSON.parse(match.location);
                        if (match.location_id) match.location = {...match.location, Id: match.location_id };
                    }
                    return match;
                });
                eventCount++;
                Items = Items.filter(event => differenceInDays(Util.getFormattedDate(event.start_date),new Date())>= 0);
                let hasNextPage = eventCount === totalSegments ? null : true;
                dispatch(setHomeActiveLeagueEvents(Items, hasNextPage));
            }
        }); 
    };
};
export const getHomeActiveLeagueEventsDesktop = (leagueId, i) => {
    return (dispatch, getState) => {
        let sportId = 1; // sportID for football as all leagues are of football
        dynamoClient.scan(paramsHomeLeaguesEventsDesktop(leagueId, i, totalSegments), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let { Items } = data;
                if (Items?.length > 0) sportId = Items[0].sport_id;
                const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId]; 
                const defaultMktObj = {};
                defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
                Items = Items.map(match => {
                    match.market = defaultMktObj;
                    match.market_count = 0;
                    match.livescore = {};
                    match.participant_one_full = JSON.parse(match.participant_one_full);
                    match.participant_two_full = JSON.parse(match.participant_two_full);
                    match.participants = [match.participant_one_full, match.participant_two_full];
                    match.league = { ...JSON.parse(match.league), Id: match.league_id };
                    if(match.location) {
                        match.location = JSON.parse(match.location);
                        if (match.location_id) match.location = {...match.location, Id: match.location_id };
                    }
                    return match;
                });
                eventCountDesktop++;
                Items = Items.filter(event => differenceInDays(Util.getFormattedDate(event.start_date),new Date())>= 0);
                let hasNextPage = eventCountDesktop === totalSegments ? null : true;
                dispatch(setHomeActiveLeagueEvents(Items, hasNextPage));
            }
        }); 
    };
};

