import cloneDeep from 'lodash.clonedeep';
import find from 'lodash.find';
import { isEqual, sortBy } from 'lodash';
import forEach from 'lodash.foreach';
import filter from 'lodash.filter';
import Util from '../../helper/Util';
import * as Actions from '../actions/actionTypes';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';

const initialState = {
    isHomeActive: true,
    isHomeLeagueActive: false,
    selectedLeague: null,
    leagues: [],
    mainSelectedMarket: 1,
    mainEvents: [],
    fetchedAll: false,
    nextIndex: 0,
    partialAllEvents: [], // hold all matches data without market
    currentPage: 0,
    hasNextPage: false,
    noEvents: false,
};

const homeReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_HOME_LEAGUES: {
            return {
                ...state,
                leagues: action.leagues,
            };
        }

        case Actions.SET_HOME_ACTIVE: {
            return {
                ...state,
                isHomeActive: action.value,
            };
        }

        case Actions.SET_HOME_LEAGUES_ACTIVE: {
            return {
                ...state,
                isHomeLeagueActive: action.value,
            };
        }

        case Actions.ON_SELECT_HOME_ACTIVE_LEAGUE: {
            return {
                ...state,
                selectedLeague: action.leagueId,
                isHomeActive: false,
                isHomeLeagueActive: true,
                mainEvents: [],
                mainSelectedMarket: null,
                fetchedAll: false,
                nextIndex: 0,
                partialAllEvents: [],
                currentPage: 0,
                hasNextPage: false,
                noEvents: false,
            };
        }

        case Actions.ON_REMOVE_HOME_ACTIVE_LEAGUE: {
            return {
                ...state,
                selectedLeague: null,
                isHomeActive: true,
                isHomeLeagueActive: false,
                mainEvents: [],
                mainSelectedMarket: null,
                currentPage: 0,
                hasNextPage: false,
                noEvents: false,
            };
        }

        case Actions.SET_HOME_ACTIVE_LEAGUE_EVENTS: {
            let { currentPage, partialAllEvents } = state;

            if (action.events.length > 0) {
                let hasNextPage = action.hasNextPage === null ? false : true;
                let page = currentPage + 1;
                let events = partialAllEvents.concat(action.events);
                events = sortBy(events, [ 'start_date']);
                return {
                    ...state,
                    partialAllEvents: events,
                    fetchedAll: !action.hasNextPage,
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    noEvents: false,
                };
            } else {
                return {
                    ...state,
                    // mainEvents: [],
                    // mainSelectedMarket: null,
                    // currentPage: 0,
                    noEvents: action.hasNextPage  ? false : partialAllEvents.length === 0,
                    hasNextPage: false,
                    fetchedAll: action.hasNextPage ? false : true,
                };
            }
        }

        case Actions.SET_EVENTS_MARKETS_DATA: {
            let { mainEvents, mainSelectedMarket } = state;
            if (action.events.length > 0) {
                const start = action.nextIndex - action.events.length;
                mainEvents.splice(start, action.events.length, ...action.events);
                mainEvents = mainEvents.filter(event => !isEqual(event.fixture_status, 2) && Object.keys(event?.market).length);
                let events = sortBy(mainEvents, [ 'start_date']);
                let sportId = mainEvents[0].sport_id;
                let selectedMarket = mainSelectedMarket ? mainSelectedMarket : MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId]?.[0]?.Id;
                return {
                    ...state,
                    mainEvents: events,
                    fetchedAll: false,
                    mainSelectedMarket: selectedMarket,
                    nextIndex: action.nextIndex,
                    noEvents: mainEvents.length || true,
                };
            } else {
                return {
                    ...state,
                    mainSelectedMarket: null,
                    currentPage: 0,
                    hasNextPage: false,
                    noEvents: true,
                };
            }
        }

        case Actions.ON_HOME_MAIN_MARKET_SELECTED: {
            return {
                ...state,
                mainSelectedMarket: action.marketId,
            };
        }

        case Actions.ON_HOME_RESET_PAGE: {
            return {
                ...state,
                currentPage: 0,
                mainEvents: [],
            };
        }

        case Actions.CLEAR_HOME_ACTIVE_LEAGUE_EVENTS: {
            return {
                ...state,
                mainEvents: [],
                mainSelectedMarket: null,
                selectedLeague: null,
                currentPage: 0,
                hasNextPage: false,
                noEvents: false,
            };
        }

        case Actions.UPDATE_HOME_EVENTS_MARKET: {
            let new_events = action.events;
            let old_events = cloneDeep(state.mainEvents);

            let updated = false;

            if (old_events.length > 0) {
                forEach(new_events, (event) => {
                    let changed_fixture = find(old_events, { fixture_id: event.FixtureId });

                    if (changed_fixture) {
                        let new_markets = event.Markets;
                        let old_markets = Object.values(changed_fixture.market);

                        forEach(new_markets, (market) => {
                            let changed_market = find(old_markets, { Id: market.Id });

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
                    mainEvents: old_events,
                };
            } else {
                return state;
            }
        }

        case Actions.UPDATE_HOME_EVENTS_STATUS: {
            let new_events = action.events;
            let old_events = cloneDeep(state.mainEvents);

            let updated = false;

            if (old_events.length > 0) {
                forEach(new_events, (event) => {
                    let changed_fixture = find(old_events, { fixture_id: event.FixtureId });

                    if (changed_fixture) {
                        let old_status = changed_fixture.fixture_status;
                        let new_status = event.Fixture && event.Fixture.Status;

                        if (old_status === 1 && new_status !== 1) {
                            updated = true;
                            old_events = filter(old_events, (e) => e.fixture_id !== event.FixtureId);
                        }
                    }
                });
            }

            if (updated) {
                if (old_events.length === 0) {
                    return {
                        ...state,
                        isHomeActive: true,
                        isHomeLeagueActive: false,
                        mainEvents: [],
                        mainSelectedMarket: null,
                        selectedLeague: null,
                        currentPage: 0,
                        hasNextPage: false,
                    };
                } else {
                    return {
                        ...state,
                        mainEvents: old_events,
                    };
                }
            } else {
                return state;
            }
        }

        default:
            return state;
    }
};

export default homeReducer;
