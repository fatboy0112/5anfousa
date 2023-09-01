import * as Actions from '../actions/actionTypes';

const initialState = {
    betslips: [],
    singleBetslip: {},
    selectedBetslip: null,
    loadingBetslip: true,
    currentPage: 0,
   // hasNextPage: false,
    totalBetslipCount: 0,
    cashoutData: {},
    loadingCashout: false,
    showCashoutSuccess: false,
    mybetsFilterParams: {},
    countBets : 0,
    totalResultCount : 0,
    fetchMore : true,
};

const betsReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_BETSLIPS: {
            let { currentPage, betslips, countBets } = state;

            if (action.betslips.results.length > 0) {
                //let hasNextPage = action.betslips.next === null ? false : true;
                
                let count = action.betslips.results.length + countBets ;
                let fetchMore = true;
                if(count >= action.betslips.count)
                {
                    fetchMore = false;
                    count = 0;
                }
                let page = currentPage + 1;
                if(action.firstPage) {
                    page = 1; 
                }
                let bets;
                if(page === 1) { 
                    bets = action.betslips.results;
                }
                else {
                    bets = betslips.concat(action.betslips.results);
                }
                return {
                    ...state,
                    betslips: bets,
                    loadingBetslip: false,
                    currentPage: page,
                    countBets : count,
                    fetchMore : fetchMore,
                    totalResultCount : action.betslips.count,
                   // hasNextPage: hasNextPage,
                    totalBetslipCount: action.betslips.count,
                };
            } else {
                return {
                    ...state,
                    betslips: [],
                    loadingBetslip: false,
                    currentPage: 0,
                    //hasNextPage: false,
                };
            }
        }

        case Actions.SET_MYBET_FILTER_PARAMS: {
            return {
                ...state,
                mybetsFilterParams: action.params,
            };
        }

        case Actions.REMOVE_MYBET_FILTERS_PARAMS: {
            return {
                ...state,
                mybetsFilterParams: {}
            };
        }
        case Actions.SET_SINGLE_BETSLIP: {
            return {
                ...state,
                singleBetslip: action.singleBetslip[0],
            };
        }

        case Actions.ON_BETSLIP_SELECTED: {
            return {
                ...state,
                selectedBetslip: action.value,
                betslips: [],
                loadingBetslip: true,
                currentPage: 0,
                //hasNextPage: false,
                countBets : 0,
            };
        }

        case Actions.SET_CASHOUT_DATA: {
            
            return {
                ...state,
                cashoutData: action.value
            };
        }

        case Actions.SET_CASHOUT_LOADING: {
            return{
                ...state,
                loadingCashout: action.value,
            };
        }

        case Actions.RESET_CASHOUT_DATA: {
            
            return {
                ...state,
                cashoutData: {}
            };
        }

        case Actions.SET_CASHOUT_SUCCESS: {
            return{
                ...state,
                showCashoutSuccess: action.value,
            };
        }

        default:
            return state;
    }
};

export default betsReducer;
