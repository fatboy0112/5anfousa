import forEach from 'lodash.foreach';
import find from 'lodash.find';
import filter from 'lodash.filter';
import { sortBy, isEqual } from 'lodash';
import cloneDeep from 'lodash.clonedeep';
import Util from '../../helper/Util';
import * as Actions from '../actions/actionTypes';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';

const initialState = {
    sports: [],
    filteredEvents: [],
    locations: [],
    locationsLoading: false,
    selectedSport: null,
    searchValue: '',
    selectedLocation: '',
    mainSelectedMarket: null,
    mainEvents: [],
    fetchedAll: false,
    nextIndex: 0,
    partialAllEvents: [], // hold all matches data without market
    searchStarted: false,
    noSearchResults: false,
    noEvents: false,
    currentPage: 0,
    hasNextPage: false,
    nextToken: null,
    filteredTomorrowEvents: [],
    sportCountObj: {},
};

const lSportsTomorrowReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_TOMORROW_SPORTS: {
            let { selectedSport, sports } = state;

            return {
                ...state,
                sports: action.sports || sports,
                sportCountObj: action.sportCountObj,
                selectedSport: selectedSport ? selectedSport : action.sports[0].sport_id,
                filteredTomorrowEvents: [],
            };
        }

        case Actions.ON_TOMORROW_SPORT_SELECTED: {
            return {
                ...state,
                selectedSport: action.sportId,
                selectedLocation: '',
                mainSelectedMarket: MARKET_FOR_OUTER_SLIDER_PREMATCH[+action.sportId][0].Id,
                mainEvents: [],
                searchValue: '',
                currentPage: 0,
                hasNextPage: false,
                nextToken: null,
                fetchedAll: false,
                nextIndex: 0,
                partialAllEvents: [],
                filteredTomorrowEvents: [],
                searchStarted: false,
            };
        }

        case Actions.SET_TOMORROW_NOEVENT: {
            return {
                ...state,
                noEvents: action.data
            };
        }

        case Actions.SET_TOMORROW_SPORT_EVENTS: {
            let { currentPage, partialAllEvents, fetchedAll } = state;
            
            if (action.events.length > 0) {
                let hasNextPage = action.hasNextPage === null ? false : true;
                let page = currentPage + 1;
                let events = partialAllEvents.concat(action.events);
                events = sortBy(events, [ 'start_date','league.Id']);
                // let selectedMarket = Object.values(events[0].market)[0]?.Id;
                return {
                    ...state,
                    partialAllEvents: events,
                    fetchedAll: !action.hasNextPage,
                    noEvents: false,
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    nextToken: action.nextToken,
                };
            } else {
                return {
                    ...state,
                    // mainEvents: [],
                    // mainSelectedMarket: null,
                    // selectedLocation: '',
                    // currentPage: 0,
                    fetchedAll: action.nextToken ? false : true,
                    noEvents: fetchedAll && partialAllEvents.length === 0,
                    hasNextPage: false,
                    nextToken: action.nextToken,
                };
            }
        }

        case Actions.SET_TOMORROW_EVENTS_MARKETS: {
            let { mainEvents, partialAllEvents, mainSelectedMarket } = state;
            if (action.events.length > 0) {
                const start = action.nextIndex - action.events.length;
                mainEvents.splice(start, action.events.length, ...action.events);
                mainEvents = mainEvents.filter(event => !isEqual(event.fixture_status, 2) && Object.keys(event?.market).length);
                let events = sortBy(mainEvents, [ 'start_date']);
                let selectedMarket = mainSelectedMarket ? mainSelectedMarket : Object.values(mainEvents[0].market)[0]?.Id;
                return {
                    ...state,
                    mainEvents: events,
                    fetchedAll: false,
                    hasNextPage: action.nextIndex < partialAllEvents.length,
                    mainSelectedMarket: selectedMarket,
                    nextIndex: action.nextIndex,
                    noEvents: mainEvents.length === 0,
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

        case Actions.CLEAR_TOMORROW_SPORT_EVENTS: {
            return {
                ...state,
                mainEvents: [],
                mainSelectedMarket: null,
                noEvents: false,
                currentPage: 0,
                hasNextPage: false,
                nextToken: null,
            };
        }

        case Actions.ON_TOMORROW_REMOVE_LEAGUE: {
            let { mainEvents, selectedLocation } = state;

            let filteredEvents = filter(mainEvents, (event) => {
                return event.league_lsport_id !== action.leagueId;
            });

            if (filteredEvents.length === 0) {
                return {
                    ...state,
                    mainEvents: [],
                    noEvents: true,
                    selectedLocation: '',
                };
            } else {
                let selectedLocationsList = [];
                if (selectedLocation.length > 0) {
                    forEach(filteredEvents, (event) => {
                        return selectedLocationsList.push(event.location_lsport_id.toString());
                    });
                }
                return {
                    ...state,
                    mainEvents: filteredEvents,
                    selectedLocation: selectedLocationsList,
                };
            }
        }

        case Actions.SET_TOMORROW_SPORT_LOCATIONS_LOADING: {
            return {
                ...state,
                locationsLoading: action.data
            };
        }

        // set locations top list
        case Actions.SET_TOMORROW_SPORT_LOCATIONS: {
            if (action.locations.length > 0 ) {
                let locationsList = action.locations;
                return {
                    ...state,
                    locations: locationsList,
                };
            }
            else {
                return {
                    ...state,
                    locations: [],
                    noEvents: true,
                };
            }
        }

        // set events of selected locations
        case Actions.SET_TOMORROW_LOCATION_EVENTS: {
            let { currentPage } = state;

            if (action.events.length > 0) {
                let page = currentPage + 1;
                let events = action.events;
                events = sortBy(events, [ 'start_date','league.Id']);
                // let selectedMarket = Object.values(events[0].market)[0]?.Id;
                return {
                    ...state,
                    mainEvents: events,
                    // mainSelectedMarket: selectedMarket,
                    currentPage: page,
                    hasNextPage: false,
                    nextToken: action.nextToken,
                    noEvents: events.length === 0,
                    filteredTomorrowEvents: [],
                };
            } else {
                return {
                    ...state,
                    // mainEvents: [],
                    // mainSelectedMarket: null,
                    // noEvents: true,
                    currentPage: 0,
                    hasNextPage: false,
                    nextToken: action.nextToken,
                };
            }
        }

        case Actions.CLEAR_TOMORROW_LOCATIONS: {
            return {
                ...state,
                locations: [],
                selectedLocation: '',
            };
        }

        case Actions.SET_TOMORROW_SELECTED_LOCATIONS: {
            return {
                ...state,
                selectedLocation: action.location,
            };
        }

        case Actions.ON_TOMORROW_MAIN_MARKET_SELECTED: {
            return {
                ...state,
                mainSelectedMarket: action.marketId,
            };
        }

        case Actions.SET_TOMORROW_SEARCH_STARTED: {
            return {
                ...state,
                searchStarted: action.value,
            };
        }

        case Actions.ON_TOMORROW_SEARCH: {
            return {
                ...state,
                searchValue: action.searchValue,
                locations: [],
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.ON_TOMORROW_NO_SEARCH_RESULTS: {
            return {
                ...state,
                noSearchResults: true,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.SET_TOMORROW_SEARCH: {
            let hasNextPage = action.hasNextPage === null ? false : true;

            return {
                ...state,
                mainEvents: action.events,
                selectedLocation: action.selectedLocation,
                noEvents: false,
                noSearchResults: false,
                currentPage: 1,
                hasNextPage: hasNextPage,
            };
        }

        case Actions.ON_CLEAR_TOMORROW_SEARCH: {
            return {
                ...state,
                searchValue: '',
            };
        }

        case Actions.ON_TOMORROW_RESET_PAGE: {
            return {
                ...state,
                currentPage: 0,
                mainEvents: [],
            };
        }

        case Actions.SET_TOMORROW_SEARCH_LOAD_MORE: {
            let { currentPage, mainEvents } = state;

            let hasNextPage = action.hasNextPage === null ? false : true;
            let page = currentPage + 1;
            let events = mainEvents.concat(action.events);

            return {
                ...state,
                mainEvents: events,
                noEvents: false,
                noSearchResults: false,
                currentPage: page,
                hasNextPage: hasNextPage,
            };
        }

        case Actions.UPDATE_TOMORROW_EVENTS_MARKET: {
            let new_events = action.events;
            let oldEvents = state.filteredEvents.length > 0 ? state.filteredEvents : state.mainEvents;
            let old_events = cloneDeep(oldEvents);

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
                if (state.filteredEvents.length > 0) {
                    return {
                        ...state,
                        filteredEvents: old_events,
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

        case Actions.UPDATE_TOMORROW_EVENTS_STATUS: {
            let new_events = action.events;
            let oldEvents = state.filteredEvents.length > 0 ? state.filteredEvents : state.mainEvents;
            let old_events = cloneDeep(oldEvents);
            let oldSports = state.sports;
            let old_sports = cloneDeep(oldSports);
            let selectedSport = state.selectedSport;

            let updated = false;

            if (old_events.length > 0) {
                forEach(new_events, (event) => {
                    let changed_fixture = find(old_events, { fixture_id: event.FixtureId });

                    if (changed_fixture) {
                        let new_status = event.Fixture && event.Fixture.Status;

                        if (new_status !== 1 || new_status !== 9) {
                            updated = true;
                            old_events = filter(old_events, (e) => e.fixture_id !== event.FixtureId);

                            if (old_sports.length > 0) {
                                let changed_sport = find(old_sports, { sport_id: selectedSport });
                                changed_sport.tomorrow_fixtures_count -= 1;

                                if (old_events.length === 0) {
                                    changed_sport.tomorrow_fixtures_count = 0;
                                }
                            }
                        }
                    }
                });
            }

            if (updated) {
                if (old_events.length === 0) {
                    return {
                        ...state,
                        filteredEvents: [],
                        mainEvents: [],
                        noEvents: true,
                        sports: old_sports,
                    };
                } else {
                    if (state.filteredEvents.length > 0) {
                        return {
                            ...state,
                            filteredEvents: old_events,
                            sports: old_sports,
                        };
                    } else {
                        return {
                            ...state,
                            mainEvents: old_events,
                            sports: old_sports,
                        };
                    }
                }
            } else {
                return state;
            }
        }

        case Actions.SEARCH_TOMORROW_EVENTS: {
            let { mainEvents } = state;

            let filteredEvents = filter(mainEvents, (me) => {
                let searchParam = `${me.participants[0].name_en} ${me.participants[1].name_en}` ;
                let lowercaseEventName = searchParam.toLowerCase();
                let lowercaseSearchVal = action.value.toLowerCase();
                return lowercaseEventName.includes(lowercaseSearchVal);
            });

            if (filteredEvents.length > 0) {
                return {
                    ...state,
                    filteredTomorrowEvents: filteredEvents,
                    noSearchResults: false,
                };
            } else {
                return {
                    ...state,
                    filteredTomorrowEvents: [],
                    noSearchResults: true,
                };
            }
        }

        default:
            return state;
    }
};

export default lSportsTomorrowReducer;
