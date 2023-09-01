import * as Actions from '../actionTypes';

// Select main market from markets slider (tabs)
export const selectMainMarket = (marketId) => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_TOMORROW_MAIN_MARKET_SELECTED, marketId });
    };
};

// Reset page number for request
export const setTomorrowResetPage = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_TOMORROW_RESET_PAGE });
    };
};

// WebSocket - update bet (price and status)
export const updateTomorrowEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_TOMORROW_EVENTS_MARKET, events });
    };
};

// WebSocket - update event status
export const updateTomorrowEventsStatus = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_TOMORROW_EVENTS_STATUS, events });
    };
};
