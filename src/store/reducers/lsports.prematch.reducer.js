import find from 'lodash.find';
import filter from 'lodash.filter';
import forEach from 'lodash.foreach';
import cloneDeep from 'lodash.clonedeep';
import { format } from 'date-fns';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config/lsports.config';
import * as Actions from '../actions/actionTypes';
import { orderBy, isEqual, sortBy, uniqBy } from 'lodash';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
let today = format(new Date(), 'yyyy-MM-dd');

const initialState = {
    isLoaded: false,
    sports: [],
    locations: [],
    searchValue: '',
    mainSelectedMarket: null,
    selectedSport: null,
    selectedLocation: null,
    selectedLeague: null,
    isLocationsActive: false,
    isPrematchActive: true,
    mainEvents: [],
    searchStarted: false,
    noSearchResults: false,
    noEvents: false,
    noLocations: false,
    noLeagues: false,
    currentPage: 0,
    hasNextPage: false,
    nextPage: null,
    searchStatus: lSportsConfig.statuses.inplay, // status to search events in (live, prematch)
    dateFilter: today,
    leagues: [],
    locationObj: {},
    partialLocations: [],
    allEvents: [],
    partialLeagueEvents: [],
    maxIndex: 0,
    nextIndex: 0,
    sportsCountObj: {},
    partialSearchResults: [],
};

const lSportsPrematchReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_PREMATCH_SPORTS: {
            let { selectedSport } = state;

            return {
                ...state,
                sports: action.sports,
                selectedSport: selectedSport ? selectedSport : action.sports[0].sport_id,
            };
        }

        case Actions.ON_SPORT_SELECTED: {
            return {
                ...state,
                selectedSport: action.sportId,
                mainEvents: [],
                locations: [],
                currentPage: 0,
                hasNextPage: false,
                partialLocations: [],
                locationObj: {}
            };
        }

        case Actions.ON_LOCATION_SELECTED: {
            return {
                ...state,
                selectedLocation: action.locationId,
            };
        }

        case Actions.SET_PREMATCH_LOCATIONS: {
            let locations = action.locations;
            if (locations.length > 0) {
                return {
                    ...state,
                    noLocations: false,
                    locations: action.locations,
                };
            } else {
                return {
                    ...state,
                    noLocations: true,
                    locations: [],
                };
            }
        }

        case Actions.SET_PREMATCH_PARTIAL_LOCATIONS: {
            let { partialLocations } = state;
            const { clear, sort, locations } = action
            if(clear) {
                return{
                    ...state,
                    partialLocations: []
                };    
            }
            else {
                if(sort){
                    partialLocations = orderBy(partialLocations, ['start_date'], ['asc']);
                }
            return{
                ...state,
                partialLocations: sort? partialLocations : uniqBy(partialLocations.concat(locations), 'fixture_id')
            };
        }
        }

        case Actions.SET_PREMATCH_ALL_EVENTS: {
            return {
                ...state,
                allEvents: action.allEvents,
            };
        }

        case Actions.SET_PARTIAL_LEAGUE_DATA: {
            return {
                ...state,
                partialLeagueEvents: action.leagues,
                maxIndex: action.leagues.length,
            }
        }

        case Actions.SET_PREMATCH_LOCACTIONS_OBJECT: {
            return{
                ...state,
                locationObj: action.locationObj
            }
        }

        case Actions.SET_PREMATCH_SPORTS_COUNT_OBJECT: {
            return{
                ...state,
                sportsCountObj: action.sportsCountObj
            }
        }

        case Actions.SET_PREMATCH_CLEAR_LOCATIONS: {
            return{
                ...state,
                partialLocations: [],
                allEvents: [],
                partialLeagueEvents: [],
                leagues: [],
                locationObj: {},
            }
        }

        case Actions.SET_PREMATCH_LEAGUE_FOR_LOCATION: {
            let leagues = action.leagues[0].leagues;
            if (leagues.length > 0) {
                return {
                    ...state,
                    noLeagues: false,
                    leagues: leagues,
                };
            } else {
                return {
                    ...state,
                    noLeagues: true,
                    leagues: [],
                };
            }
        }

        case Actions.CLEAR_PREMATCH_LOCATIONS: {
            return {
                ...state,
                locations: [],
                selectedSport: lSportsConfig.prematch.selectedSport,
                noLocations: false,
            };
        }

        case Actions.SET_PREMATCH_DATE_FILTER: {
            
            return {
                ...state,
                dateFilter: action.value,
                // locations: [],
            };
        }

        case Actions.ON_LEAGUE_SELECTED: {
            return {
                ...state,
                selectedLeague: action.leagueId,
                searchValue: '',
                partialLeagueEvents: [],
                mainEvents: [],
                noSearchResults: false,
            };
        }

        case Actions.SET_PREMATCH_LEAGUE_EVENTS: {
            let { mainEvents, mainSelectedMarket, maxIndex, selectedSport } = state;

            if (action.events.length > 0 || mainEvents.length > 0) {
                const start = action.nextIndex - action.events.length;
                mainEvents.splice(start, action.events.length, ...action.events);
                mainEvents = mainEvents.filter(event => !isEqual(event.fixture_status, 2) && Object.keys(event?.market).length);
                let events = sortBy(mainEvents, [ 'start_date']);
                let selectedMarket = !mainSelectedMarket ? MARKET_FOR_OUTER_SLIDER_PREMATCH[selectedSport][0].Id : mainSelectedMarket;
                return {
                    ...state,
                    mainEvents: events,
                    mainSelectedMarket: selectedMarket,
                    noEvents: false,
                    nextIndex: action.nextIndex,
                    hasNextPage: action.nextIndex < maxIndex,
                };
            } else {
                return {
                    ...state,
                    mainEvents: [],
                    mainSelectedMarket: null,
                    noEvents: true,
                    currentPage: 0,
                    hasNextPage: false,
                };
            }
        }

        case Actions.ON_PREMATCH_REMOVE_LEAGUE: {
            let { mainEvents } = state;

            let filteredEvents = filter(mainEvents, (event) => {
                return event.league_lsport_id !== action.leagueId;
            });

            if (filteredEvents.length === 0) {
                return {
                    ...state,
                    mainEvents: mainEvents,
                };
            } else {
                return {
                    ...state,
                    mainEvents: filteredEvents,
                };
            }
        }

        case Actions.CLEAR_LEAGUE_EVENTS: {
            return {
                ...state,
                mainEvents: [],
                mainSelectedMarket: null,
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.ON_MAIN_MARKET_SELECTED: {
            return {
                ...state,
                mainSelectedMarket: action.marketId,
            };
        }

        case Actions.SET_LOCATIONS_ACTIVE: {
            return {
                ...state,
                isLocationsActive: action.value,
            };
        }

        case Actions.SET_PREMATCH_ACTIVE: {
            return {
                ...state,
                isPrematchActive: action.value,
            };
        }

        case Actions.SET_PREMATCH_SEARCH_STARTED: {
            return {
                ...state,
                searchStarted: action.value,
                maxIndex: 0,
                nextIndex: 0,
                nextPage: null,
                partialSearchResults: [],
                noSearchResults: !action.value,
            };
        }

        case Actions.ON_SEARCH: {
            return {
                ...state,
                searchValue: action.searchValue,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
                searchStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.SET_PREMATCH_SEARCH_STATUS: {
            return {
                ...state,
                searchStatus: action.status,
                currentPage: 0,
            };
        }

        case Actions.SET_PREMATCH_PARTIAL_SEARCH_RESULTS: {
            return {
                ...state,
                partialSearchResults: action.results,
            };
        }

        case Actions.SET_PREMATCH_HAS_NEXT_PAGE: {
            return {
                ...state,
                hasNextPage: action.value,
                nextPage: action.next,
                currentPage: 0,
            };
        }

        case Actions.SET_PREMATCH_SEARCH: {
            let { partialSearchResults, mainEvents, mainSelectedMarket } = state;
            let hasNextPage = action.nextIndex < partialSearchResults.length ? true : false;
            mainEvents = mainEvents.concat(action.events);
            if (mainEvents?.length) {
                let { sport_id: sportId } = mainEvents[0];
                mainSelectedMarket = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId][0].Id;
            }
            return {
                ...state,
                mainSelectedMarket,
                mainEvents: mainEvents,
                noEvents: false,
                maxIndex: partialSearchResults.length,
                noSearchResults: false,
                nextIndex: action.nextIndex,
                hasNextPage: hasNextPage,
            };
        }

        case Actions.ON_CLEAR_SEARCH: {
            return {
                ...state,
                searchValue: '',
                searchStatus: lSportsConfig.statuses.inplay,
                maxIndex: 0,
                nextIndex: 0,
                nextPage: null,
                partialSearchResults: []
            };
        }

        case Actions.ON_PREMATCH_NO_SEARCH_RESULTS: {
            return {
                ...state,
                noSearchResults: true,
                searchStarted: false,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
                nextPage: null,
                searchStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.ON_PREMATCH_RESET_PAGE: {
            return {
                ...state,
                currentPage: 0,
                mainEvents: [],
                searchStatus: lSportsConfig.statuses.inplay,
            };
        }

        case Actions.SET_PREMATCH_SEARCH_LOAD_MORE: {
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

        case Actions.UPDATE_PREMATCH_EVENTS_MARKET: {
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

        case Actions.UPDATE_PREMATCH_EVENTS_LIVESCORE: {
            let new_events = action.events;
            let old_events = cloneDeep(state.mainEvents);

            let updated = false;

            if (old_events.length > 0) {
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

        case Actions.UPDATE_PREMATCH_EVENTS_STATUS: {
            let new_events = action.events;
            let old_events = cloneDeep(state.mainEvents);
            let oldSports = state.sports;
            let old_sports = cloneDeep(oldSports);
            let selectedSport = state.selectedSport;

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

                            if (old_sports.length > 0) {
                                let changed_sport = find(old_sports, { sport_id: selectedSport });
                                changed_sport.prematch_fixtures_count -= 1;

                                if (old_events.length === 0) {
                                    changed_sport.prematch_fixtures_count = 0;
                                }
                            }
                        }

                        // for live events in search
                        if (old_status === 2 && new_status !== 2) {
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
                        mainEvents: [],
                        noEvents: true,
                        sports: old_sports,
                    };
                } else {
                    return {
                        ...state,
                        mainEvents: old_events,
                        sports: old_sports,
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

export default lSportsPrematchReducer;
