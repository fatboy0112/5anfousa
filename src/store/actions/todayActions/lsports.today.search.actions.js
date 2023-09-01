import find from 'lodash.find';
import filter from 'lodash.filter';
import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import { getTodayLocations } from './lsports.today.location.actions';
import { setTodayResetPage } from './lsports.today.general.actions';
import Util from '../../../helper/Util';

// Set search started
export const setSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TODAY_SEARCH_STARTED, value });
    };
};

export const setTodaySearch = (events, hasNextPage, selectedLocations) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TODAY_SEARCH, events, hasNextPage, selectedLocations });
    };
};

export const setTodaySearchLoadMore = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TODAY_SEARCH_LOAD_MORE, events, hasNextPage });
    };
};

// Search events by participant
export const search = (value) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        let page = getState().today.currentPage;
        let searchValue = getState().today.searchValue;
        let selectedLocations = getState().today.selectedLocations;
        let locations = selectedLocations.toString();

        if (searchValue === value) {
            lSportsService
                .todaySearchEvents(value, locations, language, page + 1)
                .then((data) => {
                    if (data.results.length === 0) {
                        dispatch({ type: Actions.ON_TODAY_NO_SEARCH_RESULTS });
                    } else {
                        dispatch(setTodaySearchLoadMore(data.results, data.next));
                        dispatch(getTodayLocations(''));
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
        } else {
            dispatch(setTodayResetPage());
            let page = getState().today.currentPage;
            let selectedLocations = getState().today.selectedLocations;

            lSportsService
                .todaySearchEvents(value, locations, language, page + 1)
                .then((data) => {
                    dispatch({ type: Actions.ON_TODAY_SEARCH, searchValue: value });
                    if (data.results.length === 0) {
                        dispatch({ type: Actions.ON_TODAY_NO_SEARCH_RESULTS });
                    } else {
                        let selected_locations = filter(selectedLocations, (locationId) => {
                            return find(data.results, ['location_lsport_id', parseInt(locationId)]);
                        });
                        let selectedLocationsList = selected_locations ? selected_locations : [];

                        dispatch(getTodayLocations(''));
                        dispatch(setTodaySearch(data.results, data.next, selectedLocationsList));
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
    };
};

// Clear search input value
export const clearSearch = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_CLEAR_TODAY_SEARCH });
    };
};

export const searchTodayEvents = (value) => {
    if (value.length) {
        return (dispatch) => {
            dispatch({ type: Actions.SEARCH_TODAY_EVENTS, value });
        };
    } else {
        return (dispatch) => {
            dispatch({ type: Actions.ON_CLEAR_TODAY_SEARCH });
        };
    }
};
