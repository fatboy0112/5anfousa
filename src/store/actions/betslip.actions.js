import find from 'lodash.find';
import { toastr } from 'react-redux-toastr';
import Util from '../../helper/Util';
import jwtService from '../../services/jwtService';
import * as Actions from '../actions/actionTypes';
import {filter, forEach, isEmpty} from 'lodash';
import { getUser, logoutUser } from './user.actions';
import { paramsMarketData,paramsMarketDataIndex  } from '../../dynamo/params';
import { dynamoClient } from '../../App';
import { lSportsConfig, MAX_BET_COUNT } from '../../config';

// Add bet to betslip page
export const addBet = (fixture, market, bet, provider, leagueName) => {
    return (dispatch, getState) => {
        const count = getState().betslip.count;
        if (count >= MAX_BET_COUNT ) {
            toastr.error('', `Cannot place more than ${ MAX_BET_COUNT } bets.`);
            return;
        }
        dispatch({
            type: Actions.ADD_BET,
            fixture,
            market,
            bet,
            provider,
            leagueName,
        });
    };
};

// Check for saved bets in localstorage to show in betslip page
export const checkSavedBets = () => {
    return (dispatch) => {
        dispatch({
            type: Actions.CHECK_SAVED_BETS,
        });
    };
};

// Remove bet from betslip page
export const removeBet = (fixture, market, bet, provider) => {
    return (dispatch) => {
        dispatch({
            type: Actions.REMOVE_BET,
            fixture,
            market,
            bet,
            provider,
        });
    };
};

// Clear bets from betslip and localstorage
export const clearBets = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_BETS });
    };
};

// Set amount of multiple bet
export const setMultiStake = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_MULTI_STAKE, value });
    };
};

// Set amount of single bet
export const setBetStake = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_BET_STAKE, value });
    };
};

// Get betting limits
export const getBetLimits = () => {
    return (dispatch ,getState) => {
         let language = getState().general.language; 
        jwtService
            .getBetLimits(language)
            .then((limits) => {
                dispatch(setLimits(limits));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// Set betting limits for user
export const setLimits = (limits) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_LIMITS, limits });
    };
};

// WebSocket - update bets if bet is settled/suspended (cannot be placed)
export const updateBets = (bets) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_BETS, bets });
    };
};

export const updateBetslipEvent = (event) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_BET_FIXTURE, event });
    };
};

// WebSocket - update bet (price and status)
export const updateBetslipEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_BETSLIP_EVENTS_MARKET, events });
    };
};

// WebSocket - update livescore (score)
export const updateBetslipEventsLivescore = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_BETSLIP_EVENTS_LIVESCORE, events });
    };
};

// WebSocket - update event status
export const updateBetslipEventsStatus = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_BETSLIP_EVENTS_STATUS, events });
    };
};

// Place a bet
export const placeBet = (data, unsubscribe) => {
    return (dispatch, getState) => {
        const betslipID = getState().betslip.lastBetId;
        const newData = { ...data, betslip_id: betslipID };
        let language = getState().general.language

        dispatch(setPlaceBetError(null));
        dispatch(setPlaceBetDisabled(true));
        jwtService
            .placeLiveBet(newData, language)
            .then((data) => {
                unsubscribe();
                dispatch(setPlaceBetDisabled(false));
                dispatch(setLastBetslipId(data.betslip_id[data.betslip_id.length -1]));
                dispatch(setPlaceBetSuccess(false));
                dispatch(setPlaceBetCountdown(false));
                dispatch(setBetPlacedMessage(true)); // Bet placed
                dispatch(setBetslipLoading(false));
                dispatch(clearBets());
                dispatch(getUser());

                setTimeout(() => {
                    dispatch(setBetPlacedMessage(false)); // Hide bet placed message
                }, 3000);
            })
            .catch((error) => {
                dispatch(setPlaceBetDisabled(false));
                dispatch(setBetslipLoading(false));
                dispatch(setPlaceBetCountdown(false));
                if (error && error.response && error.response.status === 400) {
                    let message = error.response.data.non_field_errors[0];

                    if (message?.includes('Price')) {
                        let converted1 = message.replace(/'/g, '"');
                        let converted2 = converted1.replace(/"$/, '\'');
                        let converted3 = converted2.replace(/^"/, '\'');
                        dispatch(updateBets(JSON.parse(converted3)));
                        dispatch(setPlaceBetError('Bet can not be placed'));
                    } else {
                        dispatch(setPlaceBetError(message));
                    }
                } else if (error && error.response && error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else if (error && error.response && error && error.response && error.response.status && error.response.status === 489) {
                    dispatch(setPlaceBetError(error.response.message));    
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// Place a bet
export const placeBetWithOutLoader = (data, timer) => {
    return (dispatch, getState) => {        
        const fixtures = getState().betslip.fixtures;
         let language = getState().general.language
        dispatch(setPlaceBetError(null));
        dispatch(setPlaceBetDisabled(true));

        jwtService
            .placeBet(data, language)
            .then((data) => {
                dispatch(setLastBetslipId(data.betslip_id));
                let containsLiveEvent = find(fixtures, (fixture) => {
                    if (fixture.fixture.fixture_status) return fixture.fixture.fixture_status === lSportsConfig.statuses.inplay; 
                    else return fixture.fixture?.Fixture?.Status === lSportsConfig.statuses.inplay;
                });
                if (!containsLiveEvent) {           // Only Prematch then accept the bet
                    dispatch(setPlaceBetDisabled(false));
                    dispatch(setLastBetslipId(data.betslip_id));
                    dispatch(setPlaceBetSuccess(false));
                    dispatch(setPlaceBetCountdown(false));
                    dispatch(setBetPlacedMessage(true)); // Bet placed
                    dispatch(setBetslipLoading(false));
                    dispatch(clearBets());
                    dispatch(getUser());

                    setTimeout(() => {
                        dispatch(setBetPlacedMessage(false)); // Hide bet placed message
                    }, 3000);
                }
            })
            .catch((error) => {
                clearTimeout(timer); // Clear the countdown timer on betslip page in case of error.
                dispatch(setPlaceBetDisabled(false));
                dispatch(setBetslipLoading(false));
                dispatch(setPlaceBetCountdown(false));
                if (error && error.response && error.response.status === 400) {
                    let message = error.response.data.non_field_errors &&  error.response.data.non_field_errors[0];

                    if (message?.includes('Price')) {
                        let converted1 = message.replace(/'/g, '"');
                        let converted2 = converted1.replace(/"$/, '\'');
                        let converted3 = converted2.replace(/^"/, '\'');
                        dispatch(updateBets(JSON.parse(converted3)));
                        dispatch(setPlaceBetError('Bet can not be placed'));
                    } else {
                        dispatch(setPlaceBetError(error.response.data.message));
                    }
                } else if (error && error.response && error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// Set betslip loading
export const setBetslipLoading = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_BETSLIP_LOADING, value });
    };
};
// Set place bet error message
export const setPlaceBetError = (error) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PLACE_BET_ERROR, error });
    };
};

// Set place bet button disabled during request
export const setPlaceBetSuccess = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PLACE_BET_SUCCESS, value });
    };
};
// Set place bet success value
export const setPlaceBetDisabled = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PLACE_BET_DISABLED, value });
    };
};

// Set place bet countdown (start - true, end - false)
export const setPlaceBetCountdown = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PLACE_BET_COUNTDOWN, value });
    };
};

// Set 'Bet Placed' message
export const setBetPlacedMessage = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_BET_PLACED_MESSAGE, value });
    };
};

// Set last placed betslip id
export const setLastBetslipId = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_LAST_BET_ID, value });
    };
};

// Get last placed betslip
export const getLastBetslip = (id) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        jwtService
            .getLastBetslip(id, language)
            .then((betslips) => {
                let repeatBetAvailable = true; 
                forEach(betslips, (e) => {
                    e.event = (typeof e.event == 'string') ? JSON.parse(e.event) : e.event;
                    let market = (typeof e.market == 'string') ? JSON.parse(e.market) : e.market;
                    let fMarket = Util.marketFormatter([market], market.match_id);
                    e.market = fMarket[`id_${e.market_id}`];
                    if(isEmpty(e.event)){
                        repeatBetAvailable = false;
                    }
                });
                if(repeatBetAvailable) {
                forEach(betslips, async (e, i) => {
                    if(e.event.fixture_status !== lSportsConfig.statuses.inplay ) {
                    const fixtureId = e.event.fixture_id;
                    await dynamoClient.query(paramsMarketDataIndex(fixtureId.toString()), (err, data) => {
                        if(err){
                            console.log(err);
                        }
                        else {
                            if (data.Items.length) betslips[i].event.market = Util.marketFormatter(data.Items, fixtureId);
                            betslips[i].event.participants = [betslips[i].event.participant_one_full, betslips[i].event.participant_two_full];
                        }
                    });
                } else {
                  betslips[i].event.participants = [betslips[i].event.participant_one_full, betslips[i].event.participant_two_full];
                  betslips[i].event.Livescore = betslips[i].livescore; 
                }
                });
                dispatch(setLastBetslip(betslips));
                }
                else {
                    toastr.error('', 'Repeat Bet Not Available');
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
    };
};

// Set last placed betslip
export const setLastBetslip = (betslips) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_LAST_BETSLIP, betslips });
    };
};
