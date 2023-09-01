import lSportsService from '../../../services/lSportsService';
import { toastr } from 'react-redux-toastr';
import { lSportsConfig } from '../../../config/lsports.config';
import * as Actions from '../actionTypes';
import { getInplayLocations } from './lsports.inplay.location.actions';
import { setInplayEventsStatus } from './lsports.inplay.general.actions';
import Util from '../../../helper/Util';

// Get sports list
// export const getInplaySports = () => {
//     return (dispatch, getState) => {
//         let language = getState().general.language;
//         lSportsService
//             .getSports(language)
//             .then((sports) => {
//                 dispatch(setInplaySports(sports));
//             })
//             .catch((error) => {
//                 console.error(error);
//                 if (error && error.response && error.response.status && error.response.status === 401) {
//                     Util.handleRepeatedLogin();
//                 } else {
//                     toastr.error('', 'Something went wrong.');
//                 }
//             });
//     };
// };

// Set sports list
export const setInplaySports = (sports) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_SPORTS, sports });
    };
};

// Select active sport
export const selectSport = (sportId) => {
    return (dispatch, getState) => {
        let page = getState().inplay.currentPage;
        // dispatch(getInplaySports());
        dispatch({ type: Actions.ON_INPLAY_SPORT_SELECTED, sportId });
        dispatch(getSportEvents(sportId, page));
        dispatch(getInplayLocations(sportId));
    };
};

export const setTotalEventCount = (count) => {
    return (dispatch, getState) => {

        dispatch({ type: Actions.ON_INPLAY_EVENT_COUNT, count});

    };
};

export const setCurrentEventCount = (count) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_INPLAY_CURRENT_EVENT_COUNT, count});

    };
}

// Get sport events list
export const getSportEvents = (sportId) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        let page = getState().inplay.currentPage;
        let selectedLocations = getState().inplay.selectedLocations;
        let eventsStatus = getState().inplay.eventsStatus;
        let locations;

        if (selectedLocations.length > 0) {
            locations = selectedLocations.toString();
        }

        if (eventsStatus === lSportsConfig.statuses.inplay) {
            lSportsService
                .inplayGetSportEvents(sportId, locations, language, page + 1)
                .then((data) => {
                    if (data.results.length === 0 || data.results.length < 20 || data.next === null) {
                        dispatch(setSportEvents(data.results, data.next));
                        dispatch(setInplayEventsStatus('today'));
                        let page = getState().inplay.currentPage;

                        // get Today events
                        lSportsService
                            .todayGetSportEvents(sportId, locations, language, page + 1)
                            .then((data) => {
                                dispatch(setSportEvents(data.results, data.next));
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
                        dispatch(setSportEvents(data.results, data.next));
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
                    dispatch(setSportEvents(data.results, data.next));
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

// Set sport events list
export const setSportEvents = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_SPORT_EVENTS, events, hasNextPage });
    };
};

// Clear sport events list
export const clearSportEvents = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_SPORT_EVENTS });
    };
};

export const resetLiveMatches = (liveEvents) => {
    return (dispatch, getState) => {
        lSportsService
        .resetLiveMatches(liveEvents)
        .then(() => {
            dispatch({type: Actions.RESET_LIVE_MATCH});
        })
        .catch((error) => {
            console.error(error);
            if (error && error.response && error.response.status && error.response.status === 401) {
                Util.handleRepeatedLogin();
            }
        });
    };
};
