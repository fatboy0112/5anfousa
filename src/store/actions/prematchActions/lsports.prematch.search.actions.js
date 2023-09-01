import generalService from '../../../services/genralServices';
import * as Actions from '../actionTypes';
import { clearLeagueEvents, getMarketData } from './lsports.prematch.league.actions';
import { setPrematchResetPage } from './lsports.prematch.general.actions';
import Util from '../../../helper/Util';
import filter from 'lodash.filter';
import {forEach, slice} from 'lodash';
import { dynamoClient } from '../../../App';
import { getFavEvents } from '../../../dynamo/favoriteParams';

// Set search started
export const setSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_SEARCH_STARTED, value });
    };
};

export const setPrematchSearch = (events, nextIndex) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_SEARCH, events, nextIndex });
    };
};

export const setPrematchSearchLoadMore = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_SEARCH_LOAD_MORE, events, hasNextPage });
    };
};

// Set status of events to search (first inplay - 2, then prematch - 1)
export const setPrematchSearchStatus = (status) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_SEARCH_STATUS, status });
    };
};

export const setPrematchPartialSearchResults = (results) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_PARTIAL_SEARCH_RESULTS, results});
    };
};
// Search events by participant
export const search = (value) => {
    return (dispatch, getState) => {
        let searchValue = getState().prematch.searchValue;
        let partialLocations = getState().prematch.partialLocations;
        let partialSearchResults = getState().prematch.partialSearchResults;
        let nextIndex=getState().prematch.nextIndex;
        if (value === '') {
            dispatch(setSearchStarted(false));
            dispatch(clearSearch());
            dispatch(clearLeagueEvents());
        } else if (searchValue === value) {
            dispatch(setSearchStarted(true));
            const data = slice(partialSearchResults, nextIndex+0, nextIndex+20);
                forEach(data, (e, i) => dispatch(getMarketData(e.fixture_id, nextIndex, i, data.length, true, i===0 ? true: false))); 
            // let filteredEvents = filter(partialLocations, (me) => {
            //     let searchParam = `${me.participants[0].Name} ${me.participants[1].Name}` ;
            //     let lowercaseEventName = searchParam.toLowerCase();
            //     let lowercaseSearchVal = action.value.toLowerCase();
            //     return lowercaseEventName.includes(lowercaseSearchVal);
            // });
            // lSportsService
            //     .prematchSearchEvents(value, searchStatus, language, page + 1, sportId)
            //     .then((data) => {
            //         dispatch(setSearchStarted(false));
            //         if (data.results.length === 0) {
            //             // if (searchStatus === lSportsConfig.statuses.inplay) {
            //             //     dispatch(setPrematchSearchStatus(lSportsConfig.statuses.prematch));
            //             //     dispatch(search(value));
            //             // } else if (searchStatus === lSportsConfig.statuses.prematch) {
            //                 dispatch({ type: Actions.ON_PREMATCH_NO_SEARCH_RESULTS });
            //             //}
            //         } else {
            //             dispatch(setPrematchSearchLoadMore(data.results, data.next));

            //             if (data.next === null ) {
            //                 // if (searchStatus === lSportsConfig.statuses.inplay) {
            //                 //     dispatch({ type: Actions.SET_PREMATCH_HAS_NEXT_PAGE, value: true });
            //                 //     dispatch(setPrematchSearchStatus(lSportsConfig.statuses.prematch));
            //                 // } else if (searchStatus === lSportsConfig.statuses.prematch) {
            //                     dispatch({ type: Actions.SET_PREMATCH_HAS_NEXT_PAGE, value: false });
            //                 //}
            //             }
            //         }
            //     })
            //     .catch((error) => {
            //         dispatch(setSearchStarted(false));
            //         console.error(error);
            //         if (error && error.response && error.response.status && error.response.status === 401) {
            //             Util.handleRepeatedLogin(error.response);
            //         } else if (error.message === 'canceled') {
            //             // Do nothing if pervious request was canceled.
            //         } else {
            //             toastr.error('', 'Something went wrong.');
            //         }
            //     });
        } else {
            dispatch(setPrematchResetPage());
            dispatch(setSearchStarted(true));
            let filteredEvents = filter(partialLocations, (me) => {
                let searchParam = `${me.participant_one_full.Name} ${me.participant_two_full.Name}` ;
                let lowercaseEventName = searchParam.toLowerCase();
                let lowercaseSearchVal = value.toLowerCase();
                return lowercaseEventName.includes(lowercaseSearchVal);
            });
            if(filteredEvents.length > 0){
                dispatch({ type: Actions.ON_SEARCH, searchValue: value });
                dispatch(setPrematchPartialSearchResults(filteredEvents));
                const data = slice(filteredEvents, 0 ,20);
                forEach(data, (e, i) => dispatch(getMarketData(e.fixture_id, 0, i, data.length,true, i===0 ? true: false))); 
            }
            else 
                dispatch({ type: Actions.ON_PREMATCH_NO_SEARCH_RESULTS });
            // lSportsService
            //     .prematchSearchEvents(value, searchStatus, language, page + 1, sportId)
            //     .then((data) => {
            //         dispatch(setSearchStarted(false));
            //         dispatch({ type: Actions.ON_SEARCH, searchValue: value });
            //         if (data.results.length === 0) {
            //             // if (searchStatus === lSportsConfig.statuses.inplay) {
            //             //     dispatch(setPrematchSearchStatus(lSportsConfig.statuses.prematch));
            //             //     dispatch(search(value));
            //             // } else if (searchStatus === lSportsConfig.statuses.prematch) {
            //                 dispatch({ type: Actions.ON_PREMATCH_NO_SEARCH_RESULTS });
            //             //}
            //         } else {
            //             dispatch(setPrematchSearch(data.results, data.next));

            //             if (data.results.length < 20) {
            //                 if (searchStatus === lSportsConfig.statuses.inplay) {
            //                     dispatch(setPrematchSearchStatus(lSportsConfig.statuses.prematch));
            //                     dispatch(search(value));
            //                 }
            //             }
            //         }
            //     })
            //     .catch((error) => {
            //         dispatch(setSearchStarted(false));
            //         console.error(error);
            //         if (error && error.response && error.response.status && error.response.status === 401) {
            //             Util.handleRepeatedLogin(error.response);
            //         } else if (error.message === 'canceled') {
            //             // Do nothing if pervious request was canceled.
            //         } else {
            //             toastr.error('', 'Something went wrong.');
            //         }
            //     });
        }
    };
};

export const getEventsData = (events) => {
    return (dispatch, getState) => {
        let nextIndex = getState().prematch.nextIndex;
        let searchValue = getState().prematch.searchValue;
        let partialSearchResults = getState().prematch.partialSearchResults;
        let nextPage = getState().prematch.nextPage;
        const eventObj = {};
        events.map((event,i) => eventObj[`:evt${event.fixture_id}`] = { fixture_id: `${event.fixture_id}` });
        dynamoClient.batchGet(getFavEvents(eventObj), (err, res) => {
            if (err) {
                console.log(err);
            } else {
                let { Responses: { PartialDevent } } = res;
                if (PartialDevent?.length) {
                    PartialDevent = PartialDevent.map(match => {
                        match.fixture_id = +match.fixture_id;
                        match.market = {};
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
                    const totalLength = partialSearchResults.length + PartialDevent.length;
                    if (totalLength < 5 && nextPage) dispatch(searchMore(searchValue, nextPage));
                    dispatch(setPrematchPartialSearchResults(PartialDevent));
                    forEach(PartialDevent, (e, i) => dispatch(getMarketData(`${e.fixture_id}`, nextIndex, i, PartialDevent.length, true, i===0 ? true: false))); 
                } else {
                    if (!nextPage) dispatch({ type: Actions.ON_PREMATCH_NO_SEARCH_RESULTS });
                    else {
                        dispatch(searchMore(searchValue, nextPage));
                    }
                }
            }
        });
    };
};

export const searchEvents = (value) => {
    return (dispatch, getState) => {
        let sportId = getState().prematch.selectedSport;
        if (value === '') {
            dispatch(setSearchStarted(false));
            dispatch(clearSearch());
            dispatch(clearLeagueEvents());
        } else {
            dispatch(setSearchStarted(true));
            dispatch({ type: Actions.ON_SEARCH, searchValue: value });
            generalService
                .getSearchEvents({value, sportId})
                .then((data) => {
                    if (data.results.length === 0 && !data.next) {
                        dispatch({ type: Actions.ON_PREMATCH_NO_SEARCH_RESULTS });
                    } else {
                        let { results } = data;
                        let payload = { value: false };
                        if (data.next) payload = { value: true, next: data.next };
                        dispatch({ type: Actions.SET_PREMATCH_HAS_NEXT_PAGE, ...payload });
                        dispatch(getEventsData(results));
                    }
                })
                .catch((error) => {
                    dispatch(setSearchStarted(false));
                    console.error(error);
                    if (error && error.response && error.response.status && error.response.status === 401) {
                        Util.handleRepeatedLogin(error.response);
                    }
                });
        }
    };
};

export const searchMore = (value, nextPage) => {
    return (dispatch, getState) => {
        let sportId = getState().prematch.selectedSport;
        let searchValue = getState().prematch.searchValue;
        // dispatch({ type: Actions.ON_SEARCH, searchValue: value });
        dispatch(setSearchStarted(true));
            generalService
                .getSearchEvents({value, sportId}, nextPage)
                .then((data) => {
                    if (data.results.length === 0 && !data.next) {
                        dispatch({ type: Actions.ON_PREMATCH_NO_SEARCH_RESULTS });
                    } else {
                        let nextUrl = new URL(nextPage);
                        let params = new URLSearchParams(nextUrl.search);
                        if (!(params.get('participant') === searchValue)) {
                            dispatch(setSearchStarted(false));
                            return null;
                        }
                        let { results } = data;
                        let payload = { value: false };
                        if (data.next) {
                            payload = { value: true, next: data.next };
                        }
                        dispatch({ type: Actions.SET_PREMATCH_HAS_NEXT_PAGE, ...payload });
                        dispatch(getEventsData(results));
                    }
                })
                .catch((error) => {
                    dispatch(setSearchStarted(false));
                    console.error(error);
                    if (error && error.response && error.response.status && error.response.status === 401) {
                        Util.handleRepeatedLogin(error.response);
                    }
                });
    };
}
// Clear search input value
export const clearSearch = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_CLEAR_SEARCH });
    };
};
