import { actions } from 'react-redux-toastr';
import * as Actions from '../actions/actionTypes';

const initialState = {
    transactions: [],
    loadingTransactions: true,
    currentPage: 0,
    hasNextPage: false,
    filterParams: {},
    selectedTab: null,
    countBets : 0,
    totalResultCount : 0,
    fetchMore : true,
};

const transactionReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_TRANSACTIONS: {
            let { currentPage, transactions, countBets } = state;
           
            if (action.transactions.results.length > 0) {
                //let hasNextPage = action.hasNextPage === null ? false : true;
                let count = action.transactions.results.length + countBets ;
                let fetchMore = true;
                if(count >= action.transactions.count)
                {
                    fetchMore = false;
                    count = 0;
                }
                if (action.firstPage) {
                    return {
                        ...state,
                        transactions: action.transactions.results,
                        loadingTransactions: false,
                        currentPage: 1,
                        //hasNextPage: hasNextPage,
                        countBets : count,
                        fetchMore : fetchMore,
                        totalResultCount : action.transactions.count,
                    };
                } else {
                    let page = currentPage + 1;
                    let transactionsList = transactions.concat(action.transactions.results);
                    return {
                        ...state,
                        transactions: transactionsList,
                        loadingTransactions: false,
                        currentPage: page,
                       // hasNextPage: hasNextPage,
                        countBets : count,
                        fetchMore : fetchMore,
                        totalResultCount : action.transactions.count,
                    };
                }
            } else {
                return {
                    ...state,
                    transactions: [],
                    loadingTransactions: false,
                    currentPage: 0,
                   // hasNextPage: false,
                };
            }
        }

        case Actions.SET_TRANSACTIONS_FILTER: {
            return {
                ...state,
                filterParams: action.params,
            };
        }

        case Actions.SET_TRANSACTIONS_ERROR: {
            return {
                ...state,
                transactions: [],
                loadingTransactions: false,
                currentPage: 0,
               // hasNextPage: false,
            };
        }

        case Actions.CLEAR_TRANSACTIONS: {
            return {
                ...state,
                transactions: [],
                loadingTransactions: true,
                currentPage: 0,
               // hasNextPage: false,
                filterParams: {},
            };
        }

        case Actions.SET_TRANSACTIONS_TAB: {
            return{
                ...state,
                selectedTab: actions.tab,
                currentpage: 0,
                loadingTransactions: true,
                transactions: [],
                //hasNextPage: false,
            };
        }
       
        default:
            return state;
    }
};

export default transactionReducer;
