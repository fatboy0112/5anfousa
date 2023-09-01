import filter from 'lodash.filter';
import cloneDeep from 'lodash.clonedeep';
import find from 'lodash.find';
import forEach from 'lodash.foreach';
import { isEmpty, concat } from 'lodash';
import Util from '../../helper/Util';
import * as Actions from '../actions/actionTypes';

const initialState = {
    sports: [],
    allEvents: [],
    filteredEvents: [],
    selectedSport: null,
    mainSelectedMarket: null,
    mainEvents: [],
    noEvents: false,
    currentPage: 0,
    hasNextPage: false,
    lastMinCountObj: {},
    fetchedAll: false,
    allData: {},
    nextIndex: 0,
    maxIndex: 0,
    isLastMinAvailable: false,
};

const lSportsLastMinuteReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_LAST_MINUTE_SPORTS: {            
            let currentSelectedSport;
            let sportsObj = action.sportsObj;
            if(!isEmpty(sportsObj) && sportsObj[1] > 0) {
                currentSelectedSport = 1;
            } else if(!isEmpty(sportsObj)){
                let max;
                for (const sport in sportsObj) {
                    if (!max) {
                        max = sportsObj[sport];
                        currentSelectedSport = sport;
                    }
                    else if( max < sportsObj[sport]) {
                        max = sportsObj[sport];
                        currentSelectedSport = sport;
                    }
                } 
            }
            return {
                ...state,
                sports: action.sports,
                selectedSport: currentSelectedSport,
                allData: action.allData ? action.allData : {},
                lastMinCountObj: sportsObj ? sportsObj : {},
                maxIndex: action.allData ? action.allData[currentSelectedSport] && action.allData[currentSelectedSport].length : 0,
                noEvents: isEmpty(sportsObj) ? true : false
            };
        }

        case Actions.ON_LAST_MINUTE_SPORT_SELECTED: {
            let { allData} = state;

            return {
                ...state,
                selectedSport: action.sportId,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
                maxIndex: !isEmpty(allData)? allData[action.sportId].length : 0,
                mainSelectedMarket: action.mainSelectedMarket
            };
        }

        case Actions.SET_LAST_MINUTE_COUNT: {
            return {
                ...state,
                lastMinCountObj: action.sportsCount
            }
        }

        case Actions.IS_LAST_MIN_AVAILABLE: {
            return {
                ...state,
                isLastMinAvailable: action.isLastMinAvailable
            }
        }

        case Actions.SET_LAST_MINUTE_FETCHED_ALL: {
            return {
                ...state,
                fetchedAll : true
            };
        }

        case Actions.SET_LAST_MINUTE_SPORT_EVENTS: {
            let { mainEvents, mainSelectedMarket, maxIndex } = state;
            if (action.events.length > 0) {
                let hasNextPage = action.nextIndex < maxIndex ? true : false;
                // let page = currentPage + 1;
                let events = concat(mainEvents, action.events);
                let selectedMarket = null;
                if(events && !isEmpty(events[0]?.market))
                 selectedMarket = Object.values(events[0].market)[0].Id;
                return {
                    ...state,
                    allEvents: action.events,
                    mainEvents: events,
                    mainSelectedMarket: mainSelectedMarket ? mainSelectedMarket : selectedMarket,
                    noEvents: false,
                    hasNextPage: hasNextPage,
                    nextIndex: action.nextIndex, 
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
                };
            }
        }

        case Actions.CLEAR_LAST_MINUTE_SPORT_EVENTS: {
            return {
                ...state,
                mainEvents: [],
                mainSelectedMarket: null,
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.SET_LAST_MINUTE_CLEAR_DATA: 
            return { ...initialState};
        

        case Actions.ON_LAST_MINUTE_REMOVE_LEAGUE: {
            let { mainEvents } = state;

            let filteredEvents = filter(mainEvents, (event) => {
                return event.league_lsport_id !== action.leagueId;
            });

            if (filteredEvents.length === 0) {
                return {
                    ...state,
                    mainEvents: [],
                    noEvents: true,
                };
            } else {
                return {
                    ...state,
                    mainEvents: filteredEvents,
                };
            }
        }

        case Actions.ON_LAST_MINUTE_MAIN_MARKET_SELECTED: {
            return {
                ...state,
                mainSelectedMarket: action.marketId,
            };
        }

        case Actions.ON_LAST_MINUTE_RESET_PAGE: {
            return {
                ...state,
                currentPage: 0,
                mainEvents: [],
                allData: {},
                lastMinCountObj: {},
                sports: [],
                fetchedAll: false,
            };
        }

        

        case Actions.UPDATE_LAST_MINUTE_EVENTS_MARKET: {
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

        case Actions.UPDATE_LAST_MINUTE_EVENTS_STATUS: {
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
                        let old_status = changed_fixture.fixture_status;
                        let new_status = event.Fixture && event.Fixture.Status;

                        if (old_status === 9 && new_status !== 9) {
                            updated = true;
                            old_events = filter(old_events, (e) => e.fixture_id !== event.FixtureId);

                            if (old_sports.length > 0) {
                                let changed_sport = find(old_sports, { sport_id: selectedSport });
                                changed_sport.last_minute_fixtures_count -= 1;

                                if (old_events.length === 0) {
                                    changed_sport.last_minute_fixtures_count = 0;
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

        default:
            return state;
    }
};

export default lSportsLastMinuteReducer;
