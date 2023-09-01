import { combineReducers } from 'redux';
import { reducer as toastrReducer } from 'react-redux-toastr';

import generalReducer from './general.reducer';
import userReducer from './user.reducer';
import betsReducer from './bets.reducer';
import betslipReducer from './betslip.reducer';
import transactionReducer from './transaction.reducer';
import homeReducer from './home.reducer';
import lSportsGlobalReducer from './lsports.global.reducer';
import lSportsPrematchReducer from './lsports.prematch.reducer';
import lSportsInplayReducer from './lsports.inplay.reducer';
import lSportsLastMinuteReducer from './lsports.lastMinute.reducer';
import lSportsResultsReducer from './lsports.results.reducer';
import lSportsTodayReducer from './lsports.today.reducer';
import lSportsTomorrowReducer from './lsports.tomorrow.reducer';
import favoritesReducer from './favorites.reducer';
import casinoReducer from './casino.reducer';
import promotionReducer from './promotion.reducer';

const rootReducer = combineReducers({
    general: generalReducer,
    user: userReducer,
    bets: betsReducer,
    betslip: betslipReducer,
    transaction: transactionReducer,
    home: homeReducer,
    lsportsGlobal: lSportsGlobalReducer,
    prematch: lSportsPrematchReducer,
    inplay: lSportsInplayReducer,
    lastMinute: lSportsLastMinuteReducer,
    results: lSportsResultsReducer,
    today: lSportsTodayReducer,
    tomorrow: lSportsTomorrowReducer,
    favorites: favoritesReducer,
    casino: casinoReducer,
    toastr: toastrReducer,
    promotion: promotionReducer
});

export default rootReducer;
