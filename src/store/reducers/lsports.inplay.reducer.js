import forEach from 'lodash.foreach';
import find from 'lodash.find';
import filter from 'lodash.filter';
import uniqBy from 'lodash.uniqby';
import cloneDeep from 'lodash.clonedeep';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config/lsports.config';
import * as Actions from '../actions/actionTypes';
import { MARKET_FOR_OUTER_SLIDER } from '../../config/markets';

const initialState = {
    sports: [],
    filteredEvents: [],
    locations: [],
    selectedSport: lSportsConfig.inplay.selectedSport,
    searchValue: '',
    selectedLocations: [],
    mainSelectedMarket:null,
    mainEvents: [],
    searchStarted: false,
    noSearchResults: false,
    noEvents: false,
    currentPage: 0,
    hasNextPage: false,
    totalEventCount: 0,
    lastIndex: 0,
    isLoading: false,
    eventsStatus: lSportsConfig.statuses.inplay, // status to get events in (live, today)
    liveMatchesObj: {},
    partialEvents: {},
    liveStreamData: [],
    liveMatches: {},
    locationId: 'all',
};

const lSportsInplayReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_INPLAY_LOADING: {
            return {
                ...state,
                isLoading: action.bool,
            };
        }
        case Actions.SET_INPLAY_SPORTS: {
            let { selectedSport } = state;

            return {
                ...state,
                sports: action.sports,
                selectedSport: selectedSport ? selectedSport : action.sports[0].sport_id,
                liveMatches : {}
            };
        }

        case Actions.ON_INPLAY_SPORT_SELECTED: {
            return {
                ...state,
                selectedSport: action.sportId,
                selectedLocations: [],
                mainEvents: [],
                searchValue: '',
                currentPage: 0,
                hasNextPage: false,
                eventsStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.SET_INPLAY_SPORT_EVENTS: {
            let { currentPage, mainEvents, mainSelectedMarket } = state;

            if (action.events.length > 0 || mainEvents.length > 0) {
                let hasNextPage = action.hasNextPage === null ? false : true;
                let page = action.events.length > 0 ? currentPage + 1 : 0;
                let events = mainEvents.concat(action.events);
                let selectedMarket = Object.values(events[0].market)[0].Id;
                return {
                    ...state,
                    mainEvents: events,
                    mainSelectedMarket: mainSelectedMarket ? mainSelectedMarket : selectedMarket,
                    noEvents: false,
                    currentPage: page,
                    hasNextPage: hasNextPage,
                };
            } else {
                return {
                    ...state,
                    mainEvents: [],
                    mainSelectedMarket: null,
                    selectedLocations: [],
                    noEvents: true,
                    currentPage: 0,
                    hasNextPage: false,
                    eventsStatus: lSportsConfig.statuses.inplay,
                };
            }
        }

        case Actions.ON_INPLAY_EVENT_COUNT: {
            return{
                ...state,
                totalEventCount: action.count
            }
        }

        case Actions.ON_INPLAY_CURRENT_EVENT_COUNT: {
            return{
                ...state,
                lastIndex: action.count
            }
        }

        case Actions.CLEAR_SPORT_EVENTS: {
            return {
                ...state,
                mainEvents: [],
                mainSelectedMarket: null,
                currentPage: 0,
                hasNextPage: false,
                eventsStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.ON_INPLAY_REMOVE_LEAGUE: {
            let { mainEvents, selectedLocations } = state;

            let filteredEvents = filter(mainEvents, (event) => {
                return event.league_lsport_id !== action.leagueId;
            });

            if (filteredEvents.length === 0) {
                return {
                    ...state,
                    mainEvents: [],
                    noEvents: true,
                    selectedLocations: [],
                    eventsStatus: lSportsConfig.statuses.inplay,
                };
            } else {
                let selectedLocationsList = [];
                if (selectedLocations.length > 0) {
                    forEach(filteredEvents, (event) => {
                        return selectedLocationsList.push(event.location_lsport_id.toString());
                    });
                }
                return {
                    ...state,
                    mainEvents: filteredEvents,
                    selectedLocations: selectedLocationsList,
                };
            }
        }

        // set locations top list
        case Actions.SET_INPLAY_SPORT_LOCATIONS: {
            let locationsList = uniqBy(action.locations, 'location_lsport_id');
            return {
                ...state,
                locations: locationsList,
            };
        }

        // set events of selected locations
        case Actions.SET_INPLAY_LOCATION_EVENTS: {
            let { currentPage, mainEvents } = state;

            if (action.events.length > 0 || mainEvents.length > 0) {
                let hasNextPage = action.hasNextPage === null ? false : true;
                let page = action.events.length > 0 ? currentPage + 1 : 0;
                let events = mainEvents.concat(action.events);
                let selectedMarket = Object.values(events[0].market)[0].Id;
                return {
                    ...state,
                    mainEvents: events,
                    mainSelectedMarket: selectedMarket,
                    noEvents: false,
                    currentPage: page,
                    hasNextPage: hasNextPage,
                };
            } else {
                return {
                    ...state,
                    mainEvents: [],
                    mainSelectedMarket: null,
                    noEvents: true,
                    currentPage: 0,
                    hasNextPage: false,
                    eventsStatus: lSportsConfig.statuses.inplay,
                };
            }
        }

        case Actions.CLEAR_INPLAY_LOCATIONS: {
            return {
                ...state,
                locations: [],
                selectedLocations: [],
            };
        }

        case Actions.SET_INPLAY_SELECTED_LOCATIONS: {
            return {
                ...state,
                selectedLocations: action.locations,
            };
        }

        case Actions.ON_INPLAY_MAIN_MARKET_SELECTED: {
            return {
                ...state,
                mainSelectedMarket: action.marketId,
            };
        }

        case Actions.SET_INPLAY_SEARCH_STARTED: {
            return {
                ...state,
                searchStarted: action.value,
                locations: [],
                filteredEvents: [],
                mainEvents: [],
                noEvents: false,
                noSearchResults: false,
                currentPage: 0,
                hasNextPage: false,
                eventsStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.ON_INPLAY_SEARCH: {
            return {
                ...state,
                searchValue: action.searchValue,
                locations: [],
                filteredEvents: [],
                mainEvents: [],
                noEvents: false,
                noSearchResults: false,
                currentPage: 0,
                hasNextPage: false,
                eventsStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.SET_INPLAY_EVENTS_STATUS: {
            return {
                ...state,
                eventsStatus: action.status,
                currentPage: 0,
            };
        }

        case Actions.SET_INPLAY_HAS_NEXT_PAGE: {
            return {
                ...state,
                hasNextPage: action.value,
                currentPage: 0,
            };
        }

        case Actions.ON_INPLAY_NO_SEARCH_RESULTS: {
            return {
                ...state,
                noSearchResults: true,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
                eventsStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.SET_INPLAY_SEARCH: {
            let hasNextPage = action.hasNextPage === null ? false : true;

            return {
                ...state,
                mainEvents: action.events,
                selectedLocations: action.selectedLocations,
                noEvents: false,
                noSearchResults: false,
                currentPage: 1,
                hasNextPage: hasNextPage,
            };
        }

        case Actions.ON_CLEAR_INPLAY_SEARCH: {
            return {
                ...state,
                searchValue: '',
                eventsStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.ON_INPLAY_RESET_PAGE: {
            return {
                ...state,
                currentPage: 0,
                filteredEvents: [],
                mainEvents: [],
                eventsStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.SET_INPLAY_SEARCH_LOAD_MORE: {
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

        case Actions.UPDATE_INPLAY_EVENTS_MARKET: {
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

        case Actions.SET_LIVE_MATCHES_OBJECT: {
            return {
                ...state,
                liveMatchesObj: action.liveMatchesObj
            };
        }

        case Actions.SET_LIVE_MATCHES: {
            return {
                ...state,
                liveMatches: action.liveMatches
            };
        }

        case Actions.SET_INPLAY_LOCATION: {
            return {
                ...state,
                locationId: action.locationId
            };
        }

        case Actions.SET_CURRENT_SELECTED_SPORT: {
            return {
                ...state,
                selectedSport: action.selectedSport
            };
        }

        case Actions.SET_PARTIAL_EVENTS: {
            return {
                ...state,
                partialEvents: action.events
            };
        }

        case Actions.SET_PARTIAL_DATA: {
            return {
                ...state,
                liveStreamData: action.data
            };
        } 


        case Actions.SET_REMOVE_EVENTS : {
            return {
                ...state,
                partialEvents: {},
                selectedSport: lSportsConfig.inplay.selectedSport,
                mainSelectedMarket: +MARKET_FOR_OUTER_SLIDER[lSportsConfig.inplay.selectedSport][0].Id
            }
        }


        case Actions.UPDATE_INPLAY_EVENTS_LIVESCORE: {
            let new_events = action.events;
            let oldEvents = state.filteredEvents.length > 0 ? state.filteredEvents : state.mainEvents;
            let old_events = cloneDeep(oldEvents);

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

        case Actions.UPDATE_INPLAY_EVENTS_STATUS: {
            let new_events = action.events;
            let oldEvents = state.filteredEvents.length > 0 ? state.filteredEvents : state.mainEvents;
            let old_events = cloneDeep(oldEvents);
            let oldSports = state.sports;
            let old_sports = cloneDeep(oldSports);
            let selectedSport = state.selectedSport;

            let updated = false;

            forEach(new_events, (event) => {
                let changed_fixture = find(old_events, { fixture_id: event.FixtureId });

                if (changed_fixture) {
                    let old_status = changed_fixture.fixture_status;
                    let new_status = event.Fixture && event.Fixture.Status;

                    if (old_status === 2 && new_status !== 2) {
                        updated = true;
                        old_events = filter(old_events, (e) => e.fixture_id !== event.FixtureId);

                        if (old_sports.length > 0) {
                            let changed_sport = find(old_sports, { sport_id: selectedSport });
                            changed_sport.inplay_fixtures_count -= 1;

                            if (old_events.length === 0) {
                                changed_sport.inplay_fixtures_count = 0;
                            }
                        }
                    }

                    // for today events
                    if ((old_status === 1 || old_status === 9) && (new_status !== 1 || new_status !== 9)) {
                        updated = true;
                        old_events = filter(old_events, (e) => e.fixture_id !== event.FixtureId);

                        if (old_sports.length > 0) {
                            let changed_sport = find(old_sports, { sport_id: selectedSport });
                            changed_sport.today_fixtures_count -= 1;

                            if (old_events.length === 0) {
                                changed_sport.today_fixtures_count = 0;
                            }
                        }
                    }
                }
            });

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

        default:
            return state;
    }
};

export default lSportsInplayReducer;
