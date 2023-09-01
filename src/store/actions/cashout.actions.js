import { toastr } from 'react-redux-toastr';
import * as Actions from './actionTypes';
import jwtService from '../../services/jwtService';
import { logoutUser, getUser } from './user.actions';
import { selectBetslip } from './bets.actions';
import Util from '../../helper/Util';
import { Translate } from '../../localization';

export const setCashoutData = (betslip_id, total_odds, stake_price) => {
    return (dispatch) => {
        
        jwtService
            .getCashoutData(betslip_id, total_odds, stake_price)
            .then((value) => {
                dispatch({ type:Actions.SET_CASHOUT_DATA, value });
                dispatch({ type:Actions.SET_CASHOUT_LOADING, value: false });
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type:Actions.SET_CASHOUT_LOADING, value: false });
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else if (error && error.response && error.response.status && error.response.status === 406) {
                    //toastr.error('', `${error.response.data.message}`); Disabling the error toaster
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });   
    };
};

export const processCashout = (betslipID, cashoutAmount) =>  {
    return  (dispatch) => {
        jwtService
            .processCashout(betslipID, cashoutAmount)
            .then((data) => {
                if(data.status === true){
                    //toastr.success(data.message);
                    dispatch(showCashoutSuccess(true));
                    dispatch(getUser());
                    dispatch(selectBetslip(''));
                    setTimeout(() => {
                        dispatch(showCashoutSuccess(false));    
                    }, 2000);
                    setTimeout(()=> {
                        dispatch(selectBetslip(''));
                    }, 2001);
                }
                 else {
                    showCashoutError(Translate.someThingWrong);
                }
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                }
                else if (error && error.response && error.response.status && error.response.status === 406) {
                    showCashoutError('Cashout Not Available, Please Try Again');
                }
                 else {
                toastr.error('', 'Something went wrong.');
                }
            });
        }

};

export const setCashoutLoading = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_CASHOUT_LOADING, value });
    };
};

export const resetCashoutData = () => {
    return (dispatch) => {
        dispatch({ type: Actions.RESET_CASHOUT_DATA });
    };
};

export const showCashoutSuccess = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_CASHOUT_SUCCESS, value });
    };
};

export const showCashoutError = (msg) => {
    return toastr.error(msg);
}


