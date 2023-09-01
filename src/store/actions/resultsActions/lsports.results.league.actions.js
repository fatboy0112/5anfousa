import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import { setResultsSearchLoadMore } from './lsports.results.search.actions';
import { setResultsLocationEvents } from './lsports.results.location.actions';
import { logoutUser } from '../user.actions';
import Util from '../../../helper/Util';

// Remove league from main events on 'x' icon click
export const removeLeague = (leagueId) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_RESULTS_REMOVE_LEAGUE, leagueId });

        let hasNextPage = getState().results.hasNextPage;
        let mainEvents = getState().results.mainEvents;

        if (mainEvents.length < 20 && hasNextPage) {
            // get new events
            let language = getState().general.language;
            let locationId = getState().results.selectedLocation;
            let searchStarted = getState().results.searchStarted;
            let page = getState().results.currentPage;
            let searchValue = getState().results.searchValue;

            if (searchStarted) {
                lSportsService
                    .resultsSearchEvents(searchValue, language, page + 1)
                    .then((data) => {
                        if (data.results.length === 0) {
                            dispatch({ type: Actions.ON_RESULTS_NO_SEARCH_RESULTS });
                        } else {
                            dispatch(setResultsSearchLoadMore(data.results, data.next));
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
                dispatch(setResultsLocationEvents(locationId));
            }
        }
    };
};
