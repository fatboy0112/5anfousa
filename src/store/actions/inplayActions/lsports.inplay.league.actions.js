import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import { lSportsConfig } from '../../../config/lsports.config';
import * as Actions from '../actionTypes';
import { setInplaySearchLoadMore, search } from './lsports.inplay.search.actions';
import { getInplayLocations } from './lsports.inplay.location.actions';
import { getSportEvents } from './lsports.inplay.sport.actions';
import { setInplayEventsStatus } from './lsports.inplay.general.actions';
import Util from '../../../helper/Util';

// Remove league from main events on 'x' icon click
export const removeLeague = (leagueId) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_INPLAY_REMOVE_LEAGUE, leagueId });

        let hasNextPage = getState().inplay.hasNextPage;
        let mainEvents = getState().inplay.mainEvents;
        let filteredEvents = getState().inplay.filteredEvents;

        if (mainEvents.length < 20 && hasNextPage) {
            // get new events
            let language = getState().general.language;
            let selectedLocations = getState().inplay.selectedLocations;
            let sportId = getState().inplay.selectedSport;
            let searchStarted = getState().inplay.searchStarted;
            let page = getState().inplay.currentPage;
            let searchValue = getState().inplay.searchValue;
            let locations = selectedLocations.toString();
            let eventsStatus = getState().inplay.eventsStatus;

            if (searchStarted) {
                if (eventsStatus === lSportsConfig.statuses.inplay) {
                    lSportsService
                        .inplaySearchEvents(searchValue, locations, language, page + 1)
                        .then((data) => {
                            if (data.results.length === 0) {
                                dispatch(setInplayEventsStatus('today'));
                                dispatch(search(searchValue));
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
                        .todaySearchEvents(searchValue, locations, language, page + 1)
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
                dispatch(getSportEvents(sportId));
            }
        }
    };
};
