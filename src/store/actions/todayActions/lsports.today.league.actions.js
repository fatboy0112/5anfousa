import { toastr } from 'react-redux-toastr';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import { setTodaySearchLoadMore } from './lsports.today.search.actions';
import { getTodayLocations } from './lsports.today.location.actions';
import { getSportEvents } from './lsports.today.sport.actions';
import Util from '../../../helper/Util';
import { setTodayResetPage } from './lsports.today.general.actions';
import {  getMarketData } from './lsports.today.location.actions';

// Remove league from main events on 'x' icon click
export const removeLeague = (leagueId) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_TODAY_REMOVE_LEAGUE, leagueId: leagueId });

        let hasNextPage = getState().today.hasNextPage;
        let mainEvents = getState().today.mainEvents;

        if (mainEvents.length < 20 && hasNextPage) {
            // get new events
            let language = getState().general.language;
            let selectedLocations = getState().today.selectedLocations;
            let sportId = getState().today.selectedSport;
            let searchStarted = getState().today.searchStarted;
            let page = getState().today.currentPage;
            let searchValue = getState().today.searchValue;
            let locations = selectedLocations.toString();

            if (searchStarted) {
                lSportsService
                    .todaySearchEvents(searchValue, locations, language, page + 1)
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
                dispatch(getSportEvents(sportId));
            }
        }
    };
};

export const selectLeague = (leagueId) => {
    return (dispatch, getState) => {
        let selectedLeagues = getState().today.selectedLeagues;
        let selectedLocationList = getState().today.selectedLocationList;
        dispatch(setTodayResetPage());

        dispatch({ type: Actions.SET_TODAY_SPORT_LEAGUES, leagues: leagueId });
        const partialEvents = getState().today.partialAllEvents;
        let leagueEvent = partialEvents.filter(event => (event.league_id == leagueId || event.league?.Id == leagueId || selectedLocationList.indexOf(`${event.location_id}`) > -1));
        // if(!selectedLeagueArray.length && !selectedLocationList.length) leagueEvent = partialEvents.slice(0, 20);
        if (leagueId && !leagueEvent.length) {
            dispatch({type: Actions.SET_TODAY_NOEVENT, data: true});
            return null;
        }
        dispatch(getMarketData(leagueEvent,0 ,leagueEvent.length));
    };
};

export const clearSelectedLeagues = () => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.CLEAR_TODAY_LEAGUES });
    };
};