import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import { lSportsConfig } from '../../../config';
import * as Actions from '../actionTypes';
import { search, setPrematchSearchStatus, setPrematchSearchLoadMore } from './lsports.prematch.search.actions';
import Util from '../../../helper/Util';
import { map, isEmpty, filter, forEach, slice } from 'lodash';
import { differenceInDays, format } from 'date-fns';
import { dynamoClient } from '../../../App';
import { paramsMarketDataIndex } from '../../../dynamo/params';
import { setPrematchSearch } from '.';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../../config/markets';

let eventCount;
let marketsArray = [];
// Get league events list
export const getPrematchLeagueEvents = (startIndex) => {
    return (dispatch, getState) => {
        let partialLeagueEvents = getState().prematch.partialLeagueEvents;
        let events = slice(partialLeagueEvents ,startIndex, startIndex + 20);
        eventCount = 0;
        forEach(events, (event, i) => {
            dispatch(getMarketData(event.fixture_id, startIndex, i ,events.length));
        });
    };
};

export const getMarketData = (fixture_id, startIndex, i, count, isSearch, clear) => {
    return (dispatch, getState) => {
    if(clear) {
        marketsArray = [];
        eventCount = 0;
    }
    dynamoClient.query(paramsMarketDataIndex(`${ fixture_id }`), (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let markets = {};
            let Items = data?.Items;
            if (Items.length) markets = Util.marketFormatter(Items, fixture_id);
            let livescore = sessionStorage.getItem('liveScore');
            if (livescore) {
                livescore = JSON.parse(livescore);
                sessionStorage.removeItem('liveScore');
            }
            marketsArray[i] = { [fixture_id]: {
                market: markets ? markets : {},
                livescore,
            }};
            eventCount++;
        }
        
        if(eventCount === count && !isSearch) {
            let partialLeagueEvents = getState().prematch.partialLeagueEvents;
            // If fixtures id's are same club the data
            marketsArray = map(marketsArray, (market , i) =>{
                if(market && partialLeagueEvents && !isEmpty(Object.values(market)[0]) && Object.keys(market)[0] == partialLeagueEvents[startIndex + i]?.fixture_id) {
                    let mktData = Object.values(market)[0];
                    return {
                        ...partialLeagueEvents[startIndex + i],
                        ...mktData,
                        market: { ...partialLeagueEvents[startIndex + i].market, ...mktData.market},
                        livescore: mktData?.livescore || null
                    };
                }
            });

            marketsArray = filter(marketsArray, (market) => market && !isEmpty(Object.values(market)[0]));
            dispatch(setPrematchLeagueEvents(marketsArray, startIndex + count));

        } else if(eventCount === count && isSearch) {
            let partialSearchResults = getState().prematch.partialSearchResults;
            marketsArray = map(marketsArray, (market , i) =>{
                const mktData = Object.values(market)[0];
                if(mktData.fixture_status === undefined) return null;
                if(market && partialSearchResults && !isEmpty(mktData) && Object.keys(market)[0] == partialSearchResults[startIndex + i]?.fixture_id) {
                    return { ...partialSearchResults[startIndex + i], market: { ...partialSearchResults[startIndex + i].market, ...mktData.market}, ...mktData };
                }
            });

            marketsArray = filter(marketsArray, (market) => market);
            dispatch(setPrematchSearch(marketsArray, startIndex + count));
        }
    }); 
};
};

// Set league events list
export const setPrematchLeagueEvents = (events, nextIndex) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.SET_PREMATCH_LEAGUE_EVENTS, events, nextIndex });
    };
};

// Remove league from main events on 'x' icon click
export const removeLeague = (leagueId) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_PREMATCH_REMOVE_LEAGUE, leagueId });

        let searchStarted = getState().prematch.searchStarted;

        if (searchStarted) {
            let hasNextPage = getState().prematch.hasNextPage;
            let mainEvents = getState().prematch.mainEvents;
            let language = getState().general.language;
            let page = getState().prematch.currentPage;
            let searchValue = getState().prematch.searchValue;
            let searchStatus = getState().prematch.searchStatus;

            if (mainEvents.length < 20 && hasNextPage) {
                // get new events
                lSportsService
                    .prematchSearchEvents(searchValue, searchStatus, language, page + 1)
                    .then((data) => {
                        if (data.results.length === 0) {
                            if (searchStatus === lSportsConfig.statuses.inplay) {
                                dispatch(setPrematchSearchStatus(lSportsConfig.statuses.prematch));
                                dispatch(search(searchValue));
                            } else if (searchStatus === lSportsConfig.statuses.prematch) {
                                dispatch({ type: Actions.ON_PREMATCH_NO_SEARCH_RESULTS });
                            }
                        } else {
                            dispatch(setPrematchSearchLoadMore(data.results, data.next));

                            if (data.next === null || data.results.length < 20) {
                                if (searchStatus === lSportsConfig.statuses.inplay) {
                                    dispatch({ type: Actions.SET_PREMATCH_HAS_NEXT_PAGE, value: true });
                                    dispatch(setPrematchSearchStatus(lSportsConfig.statuses.prematch));
                                } else if (searchStatus === lSportsConfig.statuses.prematch) {
                                    dispatch({ type: Actions.SET_PREMATCH_HAS_NEXT_PAGE, value: false });
                                }
                            }
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
            }
        }
    };
};

// Clear league events list
export const clearLeagueEvents = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_LEAGUE_EVENTS });
    };
};


export const setPartialLeagueData = (leagues) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PARTIAL_LEAGUE_DATA, leagues });
        dispatch(getPrematchLeagueEvents(0));
    };
};
// Set selected league
export const selectLeague = (leagueId) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_LEAGUE_SELECTED, leagueId });
        let selectedSport = getState().prematch.selectedSport;
        let partialLocations = getState().prematch.partialLocations;
        let dateFilter = getState().prematch.dateFilter;
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[selectedSport]; 
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        let leagues;
        if(format(new Date(), 'yyyy-MM-dd') === dateFilter) {
            leagues = filter(partialLocations, (event) => event.league?.Id === leagueId && event?.sport_id === selectedSport);
        }
        else {
            leagues = filter(partialLocations, (event) => event.league?.Id === leagueId && event?.sport_id === selectedSport && format(new Date(event.start_date), 'yyyy-MM-dd') === dateFilter);
        }
        leagues = leagues.filter(event => differenceInDays(Util.getFormattedDate(event.start_date),new Date())>= 0);
        dispatch(setPartialLeagueData(leagues));
        eventCount = 0;
    };
};
