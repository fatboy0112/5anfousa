import find from 'lodash.find';
import filter from 'lodash.filter';
import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import { getTomorrowLocations } from './lsports.tomorrow.location.actions';
import { setTomorrowResetPage } from './lsports.tomorrow.general.actions';
import Util from '../../../helper/Util';

// Set search started
export const setSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TOMORROW_SEARCH_STARTED, value });
    };
};

export const setTomorrowSearch = (events, hasNextPage, selectedLocations) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TOMORROW_SEARCH, events, hasNextPage, selectedLocations });
    };
};

export const setTomorrowSearchLoadMore = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TOMORROW_SEARCH_LOAD_MORE, events, hasNextPage });
    };
};

// Search events by participant
export const search = (value) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        let page = getState().tomorrow.currentPage;
        let searchValue = getState().tomorrow.searchValue;
        let selectedLocations = getState().tomorrow.selectedLocations;
        let locations = selectedLocations.toString();

        if (searchValue === value) {
            lSportsService
                .tomorrowSearchEvents(value, locations, language, page + 1)
                .then((data) => {
                    if (data.results.length === 0) {
                        dispatch({ type: Actions.ON_TOMORROW_NO_SEARCH_RESULTS });
                    } else {
                        dispatch(setTomorrowSearchLoadMore(data.results, data.next));
                        dispatch(getTomorrowLocations(''));
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
            dispatch(setTomorrowResetPage());
            let page = getState().tomorrow.currentPage;
            let selectedLocations = getState().tomorrow.selectedLocations;

            lSportsService
                .tomorrowSearchEvents(value, locations, language, page + 1)
                .then((data) => {
                    dispatch({ type: Actions.ON_TOMORROW_SEARCH, searchValue: value });
                    if (data.results.length === 0) {
                        dispatch({ type: Actions.ON_TOMORROW_NO_SEARCH_RESULTS });
                    } else {
                        let selected_locations = filter(selectedLocations, (locationId) => {
                            return find(data.results, ['location_lsport_id', parseInt(locationId)]);
                        });
                        let selectedLocationsList = selected_locations ? selected_locations : [];

                        dispatch(getTomorrowLocations(''));
                        dispatch(setTomorrowSearch(data.results, data.next, selectedLocationsList));
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
        dispatch({ type: Actions.ON_CLEAR_TOMORROW_SEARCH });
    };
};

export const searchTomorrowEvents = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SEARCH_TOMORROW_EVENTS, value });
    };
};
