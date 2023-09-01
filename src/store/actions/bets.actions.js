import { format } from 'date-fns';
import { toastr } from 'react-redux-toastr';
import Util from '../../helper/Util';
import jwtService from '../../services/jwtService';
import * as Actions from './actionTypes';
import { logoutUser } from './user.actions';

// Set betslips in "My bets" page
export const setBetslips = (betslips ,firstPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_BETSLIPS, betslips, firstPage });
    };
};

// Get betslips for "My bets" page
export const getBetslips = (betslip_status, firstPage, params) => {
    return (dispatch, getState) => {
        let page = getState().bets.currentPage;
        if(firstPage) {
            page = 0;
        }
        if(!firstPage && betslip_status === '') {
            params = getState().bets.mybetsFilterParams;
        }
        
        let newParams = {};
        
        if(betslip_status !== '') {
            newParams = null;
        }
        if(params && params.startDate) {
            let startDate = params.startDate;
            let endDate = params.endDate;
            newParams.startDate = format(startDate, 'yyyy-MM-dd');
            newParams.endDate = format(endDate, 'yyyy-MM-dd');
            newParams.activityType = params.activityType;
            newParams.timezone_offset = params.startDate.getTimezoneOffset() / (-60);
        }

        
         let language = getState().general.language; 
        jwtService
            .getBetslips(betslip_status, page , newParams, language)
            .then((data) => {
                dispatch(setBetslips(data, firstPage));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else if (error.message === 'canceled') {
                    // Do nothing if pervious request was canceled.
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// Get betslip by id for "My bets" page popup
export const getSingleBetslip = (betslip_id) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        jwtService
            .getSingleBetslip(betslip_id, language)
            .then((singleBetslip) => {
                dispatch(setSingleBetslip(singleBetslip));
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

// Set single betslip
export const setSingleBetslip = (singleBetslip) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_SINGLE_BETSLIP, singleBetslip });
    };
};

// Select active tab in "My bets" page and get data
export const selectBetslip = (value) => {
    return (dispatch,getState) => {
        let params;
        if (value === ''){
            params = getState().bets.mybetsFilterParams;
        }
        dispatch({ type: Actions.ON_BETSLIP_SELECTED, value });
        dispatch(getBetslips(value, false, params));
    };
};

export const setMybetsFilters = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_MYBET_FILTER_PARAMS, params: value });
        dispatch(getBetslips('', true, value));
    };
};

export const removeMyBetsFilters = () => {
    return (dispatch) => {
        dispatch({ type: Actions.REMOVE_MYBET_FILTERS_PARAMS });
    };
};


