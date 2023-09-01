import forEach from 'lodash.foreach';
import find from 'lodash.find';
import cloneDeep from 'lodash.clonedeep';
import filter from 'lodash.filter';
import Util from '../../helper/Util';
import * as Actions from '../actions/actionTypes';

const initialState = {
    favorites: [],
    favoritesLiveMatches: [],
    loadingFavorites: true,
};

const favoritesReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_FAVORITES: {
            return {
                ...state,
                favorites: action.events,
                loadingFavorites: false,
            };
        }

        case Actions.SET_FAVORITES_LIVE: {
            return {
                ...state,
                favoritesLiveMatches: action.events,
                loadingFavorites: false,
            };
        }

        case Actions.ADD_FAVORITE: {
            let old_favorites = cloneDeep(state.favorites);
            old_favorites.push({
                fixture_id: action.fixtureId,
            });

            return {
                ...state,
                favorites: old_favorites,
            };
        }

        case Actions.REMOVE_FAVORITE: {
            let old_favorites = cloneDeep(state.favorites.concat(state.favoritesLiveMatches));
            old_favorites = filter(old_favorites, (e) => e.fixture_id !== action.fixtureId);

            return {
                ...state,
                favorites: old_favorites,
                favoritesLiveMatches: [],
            };
        }

        case Actions.SET_FAVORITES_ERROR: {
            return {
                ...state,
                favorites: [],
                loadingFavorites: false,
            };
        }

        case Actions.UPDATE_FAVORITES_EVENTS_MARKET: {
            let new_events = action.events;
            let old_events = cloneDeep(state.favorites);

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
                    favorites: old_events,
                };
            } else {
                return state;
            }
        }

        case Actions.UPDATE_FAVORITES_EVENTS_LIVESCORE: {
            let new_events = action.events;
            let old_events = cloneDeep(state.favorites);

            let updated = false;

            forEach(new_events, (event) => {
                let changed_fixture = find(old_events, { fixture_id: event.FixtureId });

                if (changed_fixture) {
                    let new_livescore = event.Livescore;

                    if (new_livescore) {
                        updated = true;
                        changed_fixture.livescore = new_livescore;
                    }
                }
            });

            if (updated) {
                return {
                    ...state,
                    favorites: old_events,
                };
            } else {
                return state;
            }
        }

        case Actions.UPDATE_FAVORITES_EVENTS_STATUS: {
            let new_events = action.events;
            let old_events = cloneDeep(state.favorites);

            let updated = false;

            forEach(new_events, (event) => {
                let changed_fixture = find(old_events, { fixture_id: event.FixtureId });

                if (changed_fixture) {
                    let old_status = changed_fixture.fixture_status;
                    let new_status = event.Fixture && event.Fixture.Status;

                    if (old_status === 2 && new_status !== 2) {
                        updated = true;
                        old_events = filter(old_events, (e) => e.fixture_id !== event.FixtureId);
                    } else if (new_status !== 1 || new_status !== 9 || new_status !== 2) {
                        updated = true;
                        old_events = filter(old_events, (e) => e.fixture_id !== event.FixtureId);
                    }
                }
            });

            if (updated) {
                if (old_events.length === 0) {
                    return {
                        ...state,
                        favorites: [],
                        loadingFavorites: false,
                    };
                } else {
                    return {
                        ...state,
                        favorites: old_events,
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

export default favoritesReducer;
