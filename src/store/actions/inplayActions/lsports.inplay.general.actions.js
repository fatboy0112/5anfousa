import * as Actions from '../actionTypes';

// Select main market from markets slider (tabs)
export const selectMainMarket = (marketId) => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_INPLAY_MAIN_MARKET_SELECTED, marketId });
    };
};

// Reset page number for request
export const setInplayResetPage = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_INPLAY_RESET_PAGE });
    };
};

// Set status of events to load (first inplay - 2, then today)
export const setInplayEventsStatus = (status) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_EVENTS_STATUS, status });
    };
};

// WebSocket - update bet (price and status)
export const updateInplayEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_INPLAY_EVENTS_MARKET, events });
    };
};

// WebSocket - update livescore (time and score)
export const updateInplayEventsLivescore = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_INPLAY_EVENTS_LIVESCORE, events });
    };
};

// WebSocket - update event status
export const updateInplayEventsStatus = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_INPLAY_EVENTS_STATUS, events });
    };
};

export const setInplayLoading = (bool) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_INPLAY_LOADING, bool});
    };
};

export const setLiveMatchesObject = (liveMatchesObj) => {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            dispatch({ type: Actions.SET_LIVE_MATCHES_OBJECT, liveMatchesObj });
            resolve();
        });
    };
};

export const setLiveMatches = (liveMatches) => {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            dispatch({ type: Actions.SET_LIVE_MATCHES, liveMatches });
            resolve();
        });
    };
};

export const setSelectedLocation = (locationId) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_INPLAY_LOCATION, locationId });
    };
}

export const setCurrentSelectedSport = (selectedSport) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_CURRENT_SELECTED_SPORT, selectedSport });
    };
};

export const setPartialEvents = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PARTIAL_EVENTS, events });
    };
};

export const removeLiveEvents = () => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_REMOVE_EVENTS});
    };
};