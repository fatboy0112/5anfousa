import { toastr } from 'react-redux-toastr';
import Util from '../../helper/Util';
import lSportsService from '../../services/lSportsService';
import * as Actions from './actionTypes';
import { logoutUser } from './user.actions';

// Select extra markets slider (tabs)
export const selectExtraMarket = (marketName) => {
    return (dispatch) => {
        dispatch({ type: Actions.ON_EXTRA_MARKET_SELECTED, marketName });
    };
};

// Get extra market bets
export const getExtraMarkets = (eventId) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        lSportsService
            .getExtraMarkets(eventId, language)
            .then((markets) => {
                dispatch(setExtraMarkets(markets));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', error);
                }
            });
    };
};

// Set extra market bets
export const setExtraMarkets = (markets) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_EXTRA_MARKETS, markets });
    };
};

// Set extra market event
export const setCurrentEvent = (fixture) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_CURRENT_EVENT, fixture });
    };
};

// Clear extra market bets
export const clearExtraMarkets = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_EXTRA_MARKETS });
    };
};

// WebSocket - update bet (price and status)
export const updateExtraMarketsEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_EXTRA_MARKETS_EVENTS_MARKET, events });
    };
};

// WebSocket - update livescore (time and score)
export const updateExtraMarketsEventsLivescore = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_EXTRA_MARKETS_EVENTS_LIVESCORE, events });
    };
};

// Get Statistics data
// export const getStatistics = (eventId, statsType) => {
//     return (dispatch, getState) => {
//         let language = getState().general.language;
//         lSportsService
//             .getStatistics(eventId, language)
//             .then((data) => {
//                 dispatch(setStatistics(data.fixture_id, statsType));
//             })
//             .catch((error) => {
//                 console.error(error);
//                 if (error && error.response && error.response.status && error.response.status === 401) {
//                     Util.handleRepeatedLogin(error.response);
//                 } else if (error && error.response && error.response.status && error.response.status === 404) {
//                     toastr.error('', 'No Statistics for this game');
//                 } else {
//                     toastr.error('', error.response.statusText);
//                 }
//             });
//     };
// };

// Set Statistics data
export const setStatistics = (fixtureId, statsType, statsTemplateType) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_STATISTICS, fixtureId, statsType, statsTemplateType });
    };
};

// Clear Statistics bets
export const clearStatistics = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_STATISTICS });
    };
};

export const setExtraMarketLeagueName = (league) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_EXTRA_MARKET_LEAGUE_NAME, league });
    };
};

export const setExtraMarketLocationName = (location) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_EXTRA_MARKET_LOCATION_NAME, location });
    };
}