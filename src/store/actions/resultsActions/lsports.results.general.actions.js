import * as Actions from '../actionTypes';

// Set Locations component active
export const setLocationsActive = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_RESULTS_LOCATIONS_ACTIVE, value });
    };
};

// Set main component active
export const setResultsActive = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_RESULTS_ACTIVE, value });
    };
};

// Reset page number for request
export const setResultsResetPage = () => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_RESULTS_RESET_PAGE });
    };
};
