import { toastr } from 'react-redux-toastr';
import Util from '../../helper/Util';
import jwtService from '../../services/jwtService';
import * as Actions from '../actions/actionTypes';
import { logoutUser } from './user.actions';

// Get transactions list
export const getTransactions = (tab, params, firstPage) => {
    return (dispatch, getState) => {
        let page = getState().transaction.currentPage;
          let language = getState().general.language; 
        if (firstPage) {
            page = 0;
        }
        jwtService
            .getTransactions(tab, params, page ,language)
            .then((data) => {
                dispatch(setTransactions(data, firstPage));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    dispatch(setTransactionsError());
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// Set transactions list
export const setTransactions = (transactions, firstPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TRANSACTIONS, transactions, firstPage });
    };
};

// Set transactions filter params
export const setTransactionsFilter = (params) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TRANSACTIONS_FILTER, params });
    };
};

// Set transactions error
export const setTransactionsError = () => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TRANSACTIONS_ERROR });
    };
};

// Clear transactions list
export const clearTransactions = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_TRANSACTIONS });
    };
};

export const selectTransactionTab = (tab) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.SET_TRANSACTIONS_TAB, tab });
    };
};