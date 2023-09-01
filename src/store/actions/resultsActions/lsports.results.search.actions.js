import * as Actions from '../actionTypes';
import { setResultsResetPage } from './lsports.results.general.actions';
import filter from 'lodash.filter';

// Set search started
export const setSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_RESULTS_SEARCH_STARTED, value });
    };
};

export const setResultsSearch = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_RESULTS_SEARCH, events, hasNextPage });
    };
};

export const setResultsSearchLoadMore = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_RESULTS_SEARCH_LOAD_MORE, events, hasNextPage });
    };
};

// Search events by participant
export const search = (value) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        const lan = `name_${ language.toLowerCase() }`;
        let partialLocations = getState().results.partialLocations;
        // if (searchValue === value) {
        //     lSportsService
        //         .resultsSearchEvents(value, language, page + 1)
        //         .then((data) => {
        //             if (data.results.length === 0) {
        //                 dispatch({ type: Actions.ON_RESULTS_NO_SEARCH_RESULTS });
        //             } else {
        //                 dispatch(setResultsSearchLoadMore(data.results, data.next));
        //             }
        //         })
        //         .catch((error) => {
        //             console.error(error);
        //             if (error && error.response && error.response.status && error.response.status === 401) {
        //                 Util.handleRepeatedLogin(error.response);
        //             } else {
        //                 toastr.error('', 'Something went wrong.');
        //             }
        //         });
        // } else {
            dispatch(setResultsResetPage());
            let filteredEvents = filter(partialLocations, (me) => {
                let searchParam = `${me.participant_one_full[lan] || me.participant_one_full.name_en} ${me.participant_two_full[lan] || me.participant_two_full.name_en}` ;
                let lowercaseEventName = searchParam.toLowerCase();
                let lowercaseSearchVal = value.toLowerCase();
                return lowercaseEventName.includes(lowercaseSearchVal);
            });

            if(filteredEvents.length > 0){
                dispatch({ type: Actions.ON_RESULTS_SEARCH, searchValue: value });
                dispatch(setResultsSearch(filteredEvents));
            } 
            else 
                dispatch({ type: Actions.ON_RESULTS_NO_SEARCH_RESULTS });
            // let page = getState().results.currentPage;

            // lSportsService
            //     .resultsSearchEvents(value, language, page + 1)
            //     .then((data) => {
            //         dispatch({ type: Actions.ON_RESULTS_SEARCH, searchValue: value });
            //         if (data.results.length === 0) {
            //             dispatch({ type: Actions.ON_RESULTS_NO_SEARCH_RESULTS });
            //         } else {
            //             dispatch(setResultsSearch(data.results, data.next));
            //         }
            //     })
            //     .catch((error) => {
            //         console.error(error);
            //         if (error && error.response && error.response.status && error.response.status === 401) {
            //             Util.handleRepeatedLogin(error.response);
            //         } else {
            //             toastr.error('', 'Something went wrong.');
            //         }
            //     });
        // }
    };
};

// Clear search input value
export const clearSearch = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_RESULTS_CLEAR_SEARCH });
    };
};
