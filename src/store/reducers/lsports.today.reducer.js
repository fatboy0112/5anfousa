import forEach from 'lodash.foreach';
import find from 'lodash.find';
import filter from 'lodash.filter';
import { sortBy, union, xor, isEqual } from 'lodash';
import cloneDeep from 'lodash.clonedeep';
import Util from '../../helper/Util';
import * as Actions from '../actions/actionTypes';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import orderBy from 'lodash.orderby';

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
    filteredTodayEvents: [],
    sportCountObj: {},
    dateFilter: 'all',
    partialLocations: [],
    locationObj: {},
    selectedLeagues: [],
    selectedLocationList: [],
};

const lSportsTodayReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_TODAY_SPORTS: {
            let { selectedSport, sports } = state;

            return {
                ...state,
                sports: action.sports || sports,
                sportCountObj: action.sportCountObj,
                selectedSport: selectedSport ? selectedSport : action.sports[0].sport_id,
                // filteredTodayEvents: [],
            };
        }

        case Actions.ON_TODAY_SPORT_SELECTED: {
            if (!action.dontClearMainEvents) {
            return {
                ...state,
                selectedSport: action.sportId,
                selectedLocation: '',
                mainSelectedMarket: MARKET_FOR_OUTER_SLIDER_PREMATCH[+action.sportId]?.[0].Id,
                mainEvents: [],
                searchValue: '',
                currentPage: 0,
                hasNextPage: false,
                nextToken: null,
                fetchedAll: false,
                nextIndex: 0,
                partialAllEvents: [],
                filteredTodayEvents: [],
                searchStarted: false,
                selectedLeagues: [],
                selectedLocationList: [],
            };
        }
            return state;
        }

        case Actions.SET_TODAY_NOEVENT: {
            return {
                ...state,
                noEvents: action.data,
            };
        }

        case Actions.SET_TODAY_SPORT_EVENTS: {
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
                    fetchedAll: action.nextToken ? false : true,
                    noEvents: fetchedAll && partialAllEvents.length === 0,
                    hasNextPage: false,
                    nextToken: action.nextToken,
                };
            }
        }

        case Actions.SET_TODAY_EVENTS_MARKETS: {
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

        case Actions.CLEAR_TODAY_SPORT_EVENTS: {
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

        case Actions.SET_TODAY_SPORT_LEAGUES: {
            let leagues = [];
            if (action.leagues) leagues = [action.leagues];
            return {
                ...state,
                selectedLeagues: leagues
            };
        }

        case Actions.CLEAR_TODAY_LEAGUES: {
            return {
                ...state,
                selectedLeagues: [],
            };
        }

        case Actions.ON_TODAY_REMOVE_LEAGUE: {
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

        case Actions.SET_TODAY_SPORT_LOCATIONS_LOADING: {
            return {
                ...state,
                locationsLoading: action.data
            };
        }

        // set locations top list
        case Actions.SET_TODAY_SPORT_LOCATIONS: {
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
        case Actions.SET_TODAY_LOCATION_EVENTS: {
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
                    hasNextPage: action.hasNextPage,
                    nextToken: action.nextToken,
                    noEvents: events.length === 0,
                    filteredTodayEvents: [],
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

        case Actions.CLEAR_TODAY_LOCATIONS: {
            return {
                ...state,
                locations: [],
                selectedLocation: '',
                selectedLocationList: [],
            };
        }

        case Actions.CLEAR_TODAY_PARTIAL_LOCATIONS: {
            return {
                ...state,
                partialLocations: [],
            };
        }

        case Actions.SET_TODAY_SELECTED_LOCATIONS_WITH_LEAGUES: {
            let { selectedLocationList, selectedLeagues } = state;
            let leagues = action.leagues;
            let newLeagues = [];

            if (!action.location) {
                return {
                    ...state,
                    selectedLocationList: [],
                    selectedLeagues: []
                };
            }

            if(selectedLocationList.indexOf(action.location) === -1) {
                newLeagues = union(selectedLeagues,leagues);

                return {
                    ...state,
                    selectedLocation: action.location,
                    selectedLocationList: selectedLocationList.concat(action.location),
                    selectedLeagues: newLeagues
                };
            } else {
                newLeagues = xor(selectedLeagues,leagues);
                let updatedLocationList = selectedLocationList;
                updatedLocationList = updatedLocationList.filter(loc => loc !== action.location)
                return {
                    ...state,
                    selectedLocation: action.location,
                    selectedLocationList: updatedLocationList,
                    selectedLeagues: newLeagues
                };
            }
        }

        case Actions.SET_TODAY_SELECTED_LOCATIONS: {
            let { selectedLocationList } = state;
            if(selectedLocationList.indexOf(action.location) === -1) {
                return {
                    ...state,
                    selectedLocation: action.location,
                    selectedLocationList: selectedLocationList.concat(action.location)
                };
            } else {
                let updatedLocationList = selectedLocationList
                updatedLocationList = updatedLocationList.filter(loc => loc !== action.location)
                return {
                    ...state,
                    selectedLocation: action.location,
                    selectedLocationList: updatedLocationList
                };
            }
        }

        case Actions.ON_TODAY_MAIN_MARKET_SELECTED: {
            return {
                ...state,
                mainSelectedMarket: action.marketId,
            };
        }

        case Actions.SET_TODAY_SEARCH_STARTED: {
            return {
                ...state,
                searchStarted: action.value,
            };
        }

        case Actions.ON_TODAY_SEARCH: {
            return {
                ...state,
                searchValue: action.searchValue,
                locations: [],
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.ON_TODAY_NO_SEARCH_RESULTS: {
            return {
                ...state,
                noSearchResults: true,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.SET_TODAY_SEARCH: {
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

        case Actions.ON_CLEAR_TODAY_SEARCH: {
            return {
                ...state,
                searchValue: '',
                noSearchResults: false,
                filteredTodayEvents: []
            };
        }

        case Actions.ON_TODAY_RESET_PAGE: {
            return {
                ...state,
                currentPage: 0,
                mainEvents: [],
            };
        }

        case Actions.SET_TODAY_SEARCH_LOAD_MORE: {
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

        case Actions.UPDATE_TODAY_EVENTS_MARKET: {
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

        case Actions.UPDATE_TODAY_EVENTS_STATUS: {
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
                                changed_sport.today_fixtures_count -= 1;

                                if (old_events.length === 0) {
                                    changed_sport.today_fixtures_count = 0;
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

        case Actions.SEARCH_TODAY_EVENTS: {
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
                    filteredTodayEvents: filteredEvents,
                    noSearchResults: false,
                };
            } else {
                return {
                    ...state,
                    filteredTodayEvents: [],
                    noSearchResults: true,
                };
            }
        }

        case Actions.SET_TODAY_DATE_FILTER: {
            return {
                ...state,
                dateFilter: action.value,
                fetchedAll: false,
                // locations: [],
            };
        }

        // Partial Locations

        case Actions.SET_TODAY_PARTIAL_LOCATIONS: {
            let { partialLocations } = state;
            
            if(action.clear) {
                return{
                    ...state,
                    partialLocations: []
                };    
            }
            else {
                if(action.sort){
                    partialLocations = orderBy(action.partialLocations, ['start_date'], ['asc']);
                }
            return{
                ...state,
                partialLocations: action.sort? partialLocations : partialLocations.concat(action.locations)
            };
        }
        }

        case Actions.SET_TODAY_LOCATIONS_OBJECT: {
            return{
                ...state,
                locationObj: action.locationObj
            };
        }

        case Actions.SET_UPDATED_MATCH_DATA: {
            const { mainEvents } = state;
            let copyMainEvents = [...mainEvents];
            const index = mainEvents.findIndex(evt => evt.fixture_id === action.event?.fixture_id);
            if (index > -1) {
                copyMainEvents[index] = action.event;
            }
            return {
                ...state,
                mainEvents: copyMainEvents,
            };
        }

         case Actions.CLEAR_PARTIAL_EVENTS: {
            return {
                 ...state,
                 partialAllEvents:[]
            }
        }
        
        default: 
            return state;
    }
};

export default lSportsTodayReducer;
