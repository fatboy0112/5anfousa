import * as Actions from '../actionTypes';
import { getSportEvents } from './lsports.lastMinute.sport.actions';

// Remove league from main events on 'x' icon click
export const removeLeague = (leagueId) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.ON_LAST_MINUTE_REMOVE_LEAGUE, leagueId });

        let hasNextPage = getState().lastMinute.hasNextPage;
        let mainEvents = getState().lastMinute.mainEvents;

        if (mainEvents.length < 20 && hasNextPage) {
            // get new events
            let sportId = getState().lastMinute.selectedSport;
            dispatch(getSportEvents(sportId));
        }
    };
};
