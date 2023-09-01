import * as Actions from '../actionTypes';

// Select main market from markets slider (tabs)
export const selectMainMarket = (marketId) => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_LAST_MINUTE_MAIN_MARKET_SELECTED, marketId });
    };
};

// Reset page number for request
export const setLastMinuteResetPage = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_LAST_MINUTE_RESET_PAGE });
    };
};

// WebSocket - update bet (price and status)
export const updateLastMinuteEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_LAST_MINUTE_EVENTS_MARKET, events });
    };
};

// WebSocket - update event status
export const updateLastMinuteEventsStatus = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_LAST_MINUTE_EVENTS_STATUS, events });
    };
};
