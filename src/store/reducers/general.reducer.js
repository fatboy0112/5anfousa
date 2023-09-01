import * as Actions from '../actions/actionTypes';
import { differenceInMinutes } from 'date-fns';

let sessionStats = sessionStorage.getItem('stats_data');
if (sessionStats) sessionStats = JSON.parse(sessionStats);

let sessionStatsData = null;
// keep data only if it is fetched 30 min before
if (sessionStats?.date && differenceInMinutes(new Date(), new Date(`${sessionStats.date}`)) < 30) sessionStatsData = sessionStats.data;

const initialState = {
    loading: false,
    language: localStorage.getItem('language') ? localStorage.getItem('language') : 'fr',
    country: '',
    translation: null,
    statsData: sessionStatsData,
    banners: [],
    matchBanners: [],
    isShowCasino : false,
};

const generalReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_LOADING: {
            return {
                ...state,
                loading: action.value,
            };
        }

        case Actions.SET_LANGUAGE: {
            return {
                ...state,
                language: action.value,
            };
        }

        case Actions.SET_COUNTRY_CODE: {
            return {
                ...state,
                country: action.countryCode,
            };
        }

        case Actions.SET_STATS_DATA: {
            return {
                ...state,
                statsData: action.data,
            };
        }

        case Actions.SET_BANNERS: {
            let data = {};
            if (action.isMatchBanner) data = { matchBanners: action.data };
            else data = { banners: action.data };
            return {
                ...state,
                ...data
            };
        }
         case Actions.SET_TENET_STATUS : {
            return {
               ...state,
                 isShowCasino: action.isShowCasino,
                //  isShowCasino: false,
            }
            
        }


        default:
            return state;
    }
};

export default generalReducer;
