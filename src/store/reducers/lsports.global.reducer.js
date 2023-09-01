import cloneDeep from 'lodash.clonedeep';
import find from 'lodash.find';
import forEach from 'lodash.foreach';
import flattenDepth from 'lodash.flattendepth';
import Util from '../../helper/Util';
import * as Actions from '../actions/actionTypes';

const initialState = {
    extraMarkets: {},
    extraMarketsLoading: true,
    extraSelectedMarket: '',
    extraMarketEvent: null,
    statisticsEventId: -1,
    statisticsType: '',
    statisticsTemplateType: '',
};

const lSportsGlobalReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_EXTRA_MARKETS: {

            return {
                ...state,
                extraMarketsLoading: false,
                extraMarkets: action.markets,
                // extraSelectedMarket: Object.keys(action.markets)[0],
            };
        }

        case Actions.ON_EXTRA_MARKET_SELECTED: {
            return {
                ...state,
                extraSelectedMarket: action.marketName,
            };
        }

        case Actions.CLEAR_EXTRA_MARKETS: {
            return {
                ...state,
                extraMarketsLoading: true,
                extraMarkets: {},
                extraSelectedMarket: '',
                extraMarketEvent: null,
            };
        }

        case Actions.SET_CURRENT_EVENT: {
            return {
                ...state,
                extraMarketEvent: action.fixture,
            };
        }

        case Actions.SET_STATISTICS: {
            return {
                ...state,
                statisticsEventId: action.fixtureId,
                statisticsType: action.statsType,
                statisticsTemplateType: action.statsTemplateType,
            };
        }

        case Actions.CLEAR_STATISTICS: {
            return {
                ...state,
                statisticsEventId: -1,
                statisticsType: '',
                statisticsTemplateType: '',
            };
        }

        case Actions.UPDATE_EXTRA_MARKETS_EVENTS_MARKET: {
            let new_events = action.events;
            let old_markets_list = cloneDeep(state.extraMarkets);

            let updated = false;

            if (Object.keys(old_markets_list).length > 0) {
                forEach(new_events, (event) => {
                    let changed_fixture = state.extraMarketEvent.fixture_id === event.FixtureId ? true : false;

                    if (changed_fixture) {
                        let new_markets = event.Markets;
                        let old_markets = Object.values(old_markets_list);
                        let old_markets_flattened = flattenDepth(old_markets, 2);

                        forEach(new_markets, (market) => {
                            let changed_market = find(old_markets_flattened, { Id: market.Id });

                            if (changed_market) {
                                let new_providers = market.Providers;
                                let old_providers = Util.orderProviders(changed_market.Providers);

                                forEach(new_providers, (provider) => {
                                    if (old_providers) {
                                        let changed_provider = old_providers[0].Id === provider.Id ? old_providers[0] : undefined;

                                        if (changed_provider) {
                                            let new_bets = provider.Bets;
                                            let old_bets = changed_provider.Bets;

                                            forEach(new_bets, (bet) => {
                                                let changed_bet = find(old_bets, { Id: bet.Id.toString() });

                                                if (changed_bet) {
                                                    let new_price = Math.floor(bet.Price * 100) / 100;
                                                    let old_price = Math.floor(changed_bet.Price * 100) / 100;
                                                    let new_status = bet.Status;
                                                    let new_classname = changed_bet.Classname ? changed_bet.Classname : '';

                                                    changed_bet.Status = new_status;

                                                    updated = true;

                                                    if (new_price === old_price) {
                                                        return;
                                                    }

                                                    if (new_price > old_price) {
                                                        new_classname = 'increased';
                                                    } else if (new_price < old_price) {
                                                        new_classname = 'decreased';
                                                    }

                                                    changed_bet.Price = new_price;
                                                    changed_bet.Classname = new_classname;
                                                } else {
                                                    // bet ids doesn't match ???
                                                    // old_bets.push(bet);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }

            if (updated) {
                return {
                    ...state,
                    extraMarkets: old_markets_list,
                };
            } else {
                return state;
            }
        }

        case Actions.UPDATE_EXTRA_MARKETS_EVENTS_LIVESCORE: {
            let new_events = action.events;
            let old_event = cloneDeep(state.extraMarketEvent);

            let updated = false;

            forEach(new_events, (event) => {
                let changed_fixture = old_event.fixture_id === event.FixtureId;

                if (changed_fixture) {
                    let new_livescore = event.Livescore;

                    if (new_livescore) {
                        updated = true;
                        old_event.livescore = new_livescore;
                    }
                }
            });

            if (updated) {
                return {
                    ...state,
                    extraMarketEvent: old_event,
                };
            } else {
                return state;
            }
        }

        default:
            return state;
    }
};

export default lSportsGlobalReducer;
