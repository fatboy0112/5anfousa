import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import map from 'lodash.map';
import forEach from 'lodash.foreach';
import { setTomorrowLocations } from './lsports.tomorrow.location.actions';
// import { logoutUser } from '../user.actions';
import Util from '../../../helper/Util';
import { startOfTomorrow, endOfTomorrow } from 'date-fns';
import { dynamoClient } from '../../../App';
import { getTomorrowEventsParams } from '../../../dynamo/tomorrowsParam/getTomorrowEventsParams';
import { paramsMarketData } from '../../../dynamo/params';
import { sortedLocations, staticPrematchSports } from '../../../config/sports';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../../config/markets';
import { getAllSportsEventsCount } from '../../../dynamo/tomorrowsParam/getAllSportFixture';
import groupBy from 'lodash.groupby';

// Get sports list
let sportEventCount = [];
export const getTomorrowSports = () => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        
        lSportsService
            .getSports(language)
            .then((sports) => {
                dispatch(setTomorrowSports(sports));
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
export const setTomorrowSports = (sports, nextToken) => {
    return (dispatch) => {
        if (!sports) sportEventCount = [];
        const sportObj = {};
        Object.keys(staticPrematchSports()).map((key,i) => sportObj[`:sport${i}`] = +key);

        // Getting events till the end of tomorrow as Upcoming section;
        const dateRange = [new Date(startOfTomorrow()).toISOString(), new Date(endOfTomorrow()).toISOString()];
        dynamoClient.scan(getAllSportsEventsCount(sportObj, dateRange, nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const { LastEvaluatedKey, Items } = data;
                sportEventCount.push( ...Items );
                if (LastEvaluatedKey) {
                    dispatch(fetchMore(setTomorrowSports, LastEvaluatedKey, sportObj));
                } else {
                    let sportCountObj = {};
                    const sportGrp = groupBy(sportEventCount, 'sport_id');
                    forEach(Object.values(sportObj), sport => {
                        sportCountObj[sport] = sportGrp[sport]?.length || 0;
                    });
                    dispatch({ type: Actions.SET_TOMORROW_SPORTS, sportCountObj });
                }
            }
        });
    };
};

// Select active sport
export const selectSport = (sportId) => {
    return (dispatch, getState) => {
        let page = getState().tomorrow.currentPage;
        dispatch({ type: Actions.ON_TOMORROW_SPORT_SELECTED, sportId });
        dispatch(getSportEvents(sportId, page));
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
            dynamoClient.query(paramsMarketData(event.fixture_id), (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    const { participant_one_full, participant_two_full } = res.Items[0]; 
                    marketsArray[i] = { [event.fixture_id]: {
                        market: JSON.parse(res.Items[0].market),
                        fixture_status: res.Items[0].fixture_status,
                        participant_one_full: participant_one_full ? JSON.parse(participant_one_full) : {},
                        participant_two_full: participant_two_full ? JSON.parse(participant_two_full) : {},
                    }};
                    eventCount++;
                }
                if(eventCount === count) {
                    let allData  = getState().tomorrow.partialAllEvents;
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
                            participants: [mktData.participant_one_full, mktData.participant_two_full],

                        };
                    });
                    dispatch({ type: Actions.SET_TOMORROW_EVENTS_MARKETS, events: marketsArray, nextIndex: startIndex + count });
                }
            });
        });
    };
};

// Get sport events list
export const getSportEvents = (sportId) => {
    return (dispatch, getState) => {
        // let language = getState().general.language;
        let nextToken = getState().tomorrow.nextToken;
        const dateRange = [new Date(startOfTomorrow()).toISOString(), new Date(endOfTomorrow()).toISOString()];
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[+sportId];
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        dynamoClient.scan(getTomorrowEventsParams(sportId, dateRange, nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let { Items, LastEvaluatedKey } = data;
                let selectedSport = getState().tomorrow.selectedSport;
                Items = Items.map(match => {
                    match.market = defaultMktObj;
                    match.market_count = 0;
                    match.livescore = {};
                    match.participant_one_full = {};
                    match.participant_two_full = {};
                    match.participants = [match.participant_one_full, match.participant_two_full];
                    match.league = JSON.parse(match.league);
                    if(match.location) {
                        match.location = JSON.parse(match.location);
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
                    let matches = getState().tomorrow.partialAllEvents;
                    matches.map(match => locations[match.location.Id] = { ...match.location, name: match.location.name_en });
                    let locationArr = sortedLocations(Object.values(locations));
                    dispatch(setTomorrowLocations(locationArr));
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
        dispatch({ type: Actions.SET_TOMORROW_SPORT_EVENTS, events, hasNextPage, nextToken });
    };
};

// Clear sport events list
export const clearSportEvents = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_TOMORROW_SPORT_EVENTS });
    };
};
