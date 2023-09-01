import find from 'lodash.find';
import filter from 'lodash.filter';
import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import { lSportsConfig } from '../../../config';
import * as Actions from '../actionTypes';
import { getInplayLocations } from './lsports.inplay.location.actions';
import { setInplayResetPage, setInplayEventsStatus } from './lsports.inplay.general.actions';
import { clearSportEvents } from './lsports.inplay.sport.actions';
import Util from '../../../helper/Util';

// Set search started
export const setSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_SEARCH_STARTED, value });
    };
};

export const setInplaySearch = (events, hasNextPage, selectedLocations) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_SEARCH, events, hasNextPage, selectedLocations });
    };
};

export const setInplaySearchLoadMore = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_SEARCH_LOAD_MORE, events, hasNextPage });
    };
};

// Search events by participant
export const search = (value) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        let page = getState().inplay.currentPage;
        let searchValue = getState().inplay.searchValue;
        let eventsStatus = getState().inplay.eventsStatus;
        let selectedLocations = getState().inplay.selectedLocations;
        let mainEvents = getState().inplay.mainEvents;
        let filteredEvents = getState().inplay.filteredEvents;
        let locations = selectedLocations.toString();

        if (searchValue === value) {
            if (eventsStatus === lSportsConfig.statuses.inplay) {
                lSportsService
                    .inplaySearchEvents(value, locations, language, page + 1)
                    .then((data) => {
                        if (data.results.length === 0) {
                            dispatch(setInplayEventsStatus('today'));
                            dispatch(search(value));
                        } else {
                            dispatch(setInplaySearchLoadMore(data.results, data.next));
                            dispatch(getInplayLocations(''));

                            if (data.next === null || data.results.length < 20) {
                                dispatch({ type: Actions.SET_INPLAY_HAS_NEXT_PAGE, value: true });
                                dispatch(setInplayEventsStatus('today'));
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
            } else {
                lSportsService
                    .todaySearchEvents(value, locations, language, page + 1)
                    .then((data) => {
                        if (data.results.length === 0) {
                            if (mainEvents.length === 0 && filteredEvents.length === 0) {
                                dispatch({ type: Actions.ON_INPLAY_NO_SEARCH_RESULTS });
                            }
                        } else {
                            dispatch(setInplaySearchLoadMore(data.results, data.next));
                            dispatch(getInplayLocations(''));

                            if (data.next === null || data.results.length < 20) {
                                dispatch({ type: Actions.SET_INPLAY_HAS_NEXT_PAGE, value: false });
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
        } else {
            if (value === '') {
                dispatch(setSearchStarted(true));
                dispatch(clearSearch());
                dispatch(clearSportEvents());
            } else {
                dispatch(setInplayResetPage());
                let page = getState().inplay.currentPage;
                let selectedLocations = getState().inplay.selectedLocations;
                let eventsStatus = getState().inplay.eventsStatus;
                let mainEvents = getState().inplay.mainEvents;
                let filteredEvents = getState().inplay.filteredEvents;

                if (eventsStatus === lSportsConfig.statuses.inplay) {
                    lSportsService
                        .inplaySearchEvents(value, locations, language, page + 1)
                        .then((data) => {
                            dispatch({ type: Actions.ON_INPLAY_SEARCH, searchValue: value });
                            if (data.results.length === 0) {
                                dispatch(setInplayEventsStatus('today'));
                                dispatch(search(value));
                            } else {
                                let selected_locations = filter(selectedLocations, (locationId) => {
                                    return find(data.results, ['location_lsport_id', parseInt(locationId)]);
                                });
                                let selectedLocationsList = selected_locations ? selected_locations : [];

                                dispatch(getInplayLocations(''));
                                dispatch(setInplaySearch(data.results, data.next, selectedLocationsList));

                                if (data.results.length < 20 || data.next === null) {
                                    dispatch(setInplayEventsStatus('today'));
                                    dispatch(search(value));
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
                } else {
                    lSportsService
                        .todaySearchEvents(value, locations, language, page + 1)
                        .then((data) => {
                            if (data.results.length === 0) {
                                if (mainEvents.length === 0 && filteredEvents.length === 0) {
                                    dispatch({ type: Actions.ON_INPLAY_NO_SEARCH_RESULTS });
                                }
                            } else {
                                let selected_locations = filter(selectedLocations, (locationId) => {
                                    return find(data.results, ['location_lsport_id', parseInt(locationId)]);
                                });
                                let selectedLocationsList = selected_locations ? selected_locations : [];

                                dispatch(getInplayLocations(''));
                                dispatch(setInplaySearch(data.results, data.next, selectedLocationsList));
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
        }
    };
};

// Clear search input value
export const clearSearch = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_CLEAR_INPLAY_SEARCH });
    };
};
