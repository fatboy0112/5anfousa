import includes from 'lodash.includes';
import filter from 'lodash.filter';
import find from 'lodash.find';
import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import { lSportsConfig } from '../../../config';
import * as Actions from '../actionTypes';
import { selectSport } from './lsports.inplay.sport.actions';
import { setInplaySearch, search } from './lsports.inplay.search.actions';
import { setInplayResetPage } from './lsports.inplay.general.actions';
import { setInplayEventsStatus } from './lsports.inplay.general.actions';
import Util from '../../../helper/Util';

// Get locations top list
export const getInplayLocations = (sportId) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        let status = lSportsConfig.statuses.inplay;

        let liveLocations;
        let todayLocations;

        lSportsService
            .getLocations(status, language, sportId)
            .then((locations) => {
                liveLocations = locations;
                lSportsService
                    .getTodayLocations(language, sportId)
                    .then((locations) => {
                        todayLocations = locations;
                        let allLocations = liveLocations.concat(todayLocations);
                        // set locations top list
                        dispatch(setInplayLocations(allLocations));
                    })
                    .catch((error) => {
                        console.error(error);
                        if (error && error.response && error.response.status && error.response.status === 401) {
                            Util.handleRepeatedLogin(error.response);
                        } else {
                            toastr.error('', 'Something went wrong.');
                        }
                    });
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

// Set locations top list
export const setInplayLocations = (locations) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_SPORT_LOCATIONS, locations });
    };
};

// Clear locations top list
export const clearLocations = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_INPLAY_LOCATIONS });
    };
};

// Set selected locations top list
export const setInplaySelectedLocations = (locations) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_SELECTED_LOCATIONS, locations });
    };
};

// On location top list item click (filter by location)
export const selectLocation = (locationId) => {
    return (dispatch, getState) => {
        dispatch(setInplayResetPage());

        let language = getState().general.language;
        let selectedLocations = getState().inplay.selectedLocations;
        let sportId = getState().inplay.selectedSport;
        let searchStarted = getState().inplay.searchStarted;
        let page = getState().inplay.currentPage;
        let eventsStatus = getState().inplay.eventsStatus;
        let containsLocation = includes(selectedLocations, locationId.toString());

        if (containsLocation) {
            selectedLocations = filter(selectedLocations, (l) => {
                return locationId !== l;
            });
        } else {
            selectedLocations = [...selectedLocations, locationId];
        }

        dispatch(setInplaySelectedLocations(selectedLocations));

        let locations = selectedLocations.toString();

        if (searchStarted) {
            dispatch(setInplayResetPage());
            let page = getState().inplay.currentPage;
            let searchValue = getState().inplay.searchValue;
            let selectedLocations = getState().inplay.selectedLocations;

            lSportsService
                .inplaySearchEvents(searchValue, locations, language, page + 1)
                .then((data) => {
                    dispatch({ type: Actions.ON_INPLAY_SEARCH, searchValue });
                    if (data.results.length === 0) {
                        dispatch(setInplayEventsStatus('today'));
                        dispatch(search(searchValue));
                    } else {
                        let selected_locations = filter(selectedLocations, (locationId) => {
                            return find(data.results, ['location_lsport_id', parseInt(locationId)]);
                        });
                        let selectedLocationsList = selected_locations ? selected_locations : [];

                        dispatch(getInplayLocations(''));
                        dispatch(setInplaySearch(data.results, data.next, selectedLocationsList));

                        if (data.results.length < 20 || data.next === null) {
                            dispatch(setInplayEventsStatus('today'));
                            dispatch(search(searchValue));
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
            if (eventsStatus === lSportsConfig.statuses.inplay) {
                lSportsService
                    .inplayGetLocationEvents(sportId, locations, language, page + 1)
                    .then((data) => {
                        if (data.results.length === 0 || data.results.length < 20 || data.next === null) {
                            dispatch(setInplayLocationEvents(data.results, data.next));
                            dispatch(setInplayEventsStatus('today'));
                            let page = getState().inplay.currentPage;

                            // get Today events
                            lSportsService
                                .todayGetSportEvents(sportId, locations, language, page + 1)
                                .then((data) => {
                                    dispatch(setInplayLocationEvents(data.results, data.next));
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
                            dispatch(setInplayLocationEvents(data.results, data.next));
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
                // get Today events
                lSportsService
                    .todayGetSportEvents(sportId, locations, language, page + 1)
                    .then((data) => {
                        dispatch(setInplayLocationEvents(data.results, data.next));
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

// Set events of selected locations
export const setInplayLocationEvents = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_LOCATION_EVENTS, events, hasNextPage });
    };
};

// On All locations click
export const resetSelectedLocations = () => {
    return (dispatch, getState) => {
        let sportId = getState().inplay.selectedSport;
        dispatch(setInplayResetPage());
        dispatch(selectSport(sportId));
    };
};
