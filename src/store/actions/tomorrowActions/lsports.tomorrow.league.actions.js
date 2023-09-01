import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import { setTomorrowSearchLoadMore } from './lsports.tomorrow.search.actions';
import { getTomorrowLocations } from './lsports.tomorrow.location.actions';
import { getSportEvents } from './lsports.tomorrow.sport.actions';
import Util from '../../../helper/Util';

// Remove league from main events on 'x' icon click
export const removeLeague = (leagueId) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_TOMORROW_REMOVE_LEAGUE, leagueId: leagueId });

        let hasNextPage = getState().tomorrow.hasNextPage;
        let mainEvents = getState().tomorrow.mainEvents;

        if (mainEvents.length < 20 && hasNextPage) {
            // get new events
            let language = getState().general.language;
            let selectedLocations = getState().tomorrow.selectedLocations;
            let sportId = getState().tomorrow.selectedSport;
            let searchStarted = getState().tomorrow.searchStarted;
            let page = getState().tomorrow.currentPage;
            let searchValue = getState().tomorrow.searchValue;
            let locations = selectedLocations.toString();

            if (searchStarted) {
                lSportsService
                    .tomorrowSearchEvents(searchValue, locations, language, page + 1)
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
                dispatch(getSportEvents(sportId));
            }
        }
    };
};
