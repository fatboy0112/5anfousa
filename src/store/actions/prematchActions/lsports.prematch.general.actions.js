import * as Actions from '../actionTypes';

// Select main market from markets slider (tabs)
export const selectMainMarket = (marketId) => {
    return (dispatch) => {
        dispatch({
            type: Actions.ON_MAIN_MARKET_SELECTED,
            marketId: marketId,
        });
    };
};

// Set Locations component active
export const setLocationsActive = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_LOCATIONS_ACTIVE, value });
    };
};

// Set main component active
export const setPrematchActive = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PREMATCH_ACTIVE, value });
    };
};

// Reset page number for request
export const setPrematchResetPage = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_PREMATCH_RESET_PAGE });
    };
};

// WebSocket - update bet (price and status)
export const updatePrematchEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_PREMATCH_EVENTS_MARKET, events });
    };
};

// WebSocket - update livescore (time and score)
export const updatePrematchEventsLivescore = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_PREMATCH_EVENTS_LIVESCORE, events });
    };
};

// WebSocket - update event status
export const updatePrematchEventsStatus = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_PREMATCH_EVENTS_STATUS, events });
    };
};
