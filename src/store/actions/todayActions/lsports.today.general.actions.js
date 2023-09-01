import * as Actions from '../actionTypes';

// Select main market from markets slider (tabs)
export const selectMainMarket = (marketId) => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_TODAY_MAIN_MARKET_SELECTED, marketId });
    };
};

// Reset page number for request
export const setTodayResetPage = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_TODAY_RESET_PAGE });
    };
};

// WebSocket - update bet (price and status)
export const updateTodayEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_TODAY_EVENTS_MARKET, events });
    };
};

// WebSocket - update event status
export const updateTodayEventsStatus = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_TODAY_EVENTS_STATUS, events });
    };
};
