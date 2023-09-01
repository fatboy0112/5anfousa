import filter from 'lodash.filter';
import uniqBy from 'lodash.uniqby';
import { lSportsConfig } from '../../config/lsports.config';
import * as Actions from '../actions/actionTypes';

const initialState = {
    sports: [],
    locations: [],
    searchValue: '',
    selectedSport: null,
    selectedLocation: null,
    isLocationsActive: false,
    isLocationLoading: false,
    isResultsActive: true,
    mainEvents: [],
    searchStarted: false,
    noSearchResults: false,
    noEvents: false,
    currentPage: 0,
    hasNextPage: false,
    partialLocations: [],
    sportsCountObj: {}
};

const lSportsResultsReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_RESULTS_SPORTS: {
            let { selectedSport } = state;

            return {
                ...state,
                sports: action.sports,
                selectedSport: selectedSport ? selectedSport : action.sports[0].sport_id,
            };
        }

        case Actions.ON_RESULTS_SPORT_SELECTED: {
            return {
                ...state,
                selectedSport: action.sportId,
                mainEvents: [],
                locations: [],
                noEvents: false,
                currentPage: 0,
                hasNextPage: false,
                partialLocations: [],
            };
        }

        case Actions.ON_RESULTS_LOCATION_SELECTED: {
            return {
                ...state,
                selectedLocation: action.locationId,
            };
        }

        case Actions.SET_RESULTS_LOCATIONS: {
            let locationsList = uniqBy(action.locations, 'location_id');
            return {
                ...state,
                locations: locationsList,
            };
        }

        case Actions.SET_RESULTS_LOCATION_LOADING: {
            return {
                ...state,
                isLocationLoading: action.data
            };
        }

        case Actions.CLEAR_RESULTS_LOCATIONS: {
            return {
                ...state,
                selectedSport: lSportsConfig.results.selectedSport,
            };
        }

        case Actions.SET_RESULTS_PARTIAL_LOCATIONS: {
            let { partialLocations } = state;
            return{
                ...state,
                partialLocations: partialLocations.concat(action.locations)
            }
        }

        case Actions.SET_RESULTS_LOCATION_EVENTS: {
            let { currentPage, mainEvents } = state;

            if (action.events.length > 0) {
                let hasNextPage = action.hasNextPage === null ? false : true;
                let page = currentPage + 1;
                let events = mainEvents.concat(action.events);
                return {
                    ...state,
                    mainEvents: events,
                    noEvents: false,
                    currentPage: page,
                    hasNextPage: hasNextPage,
                };
            } else {
                return {
                    ...state,
                    mainEvents: [],
                    noEvents: true,
                    currentPage: 0,
                    hasNextPage: false,
                };
            }
        }

        case Actions.ON_RESULTS_REMOVE_LEAGUE: {
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

        case Actions.CLEAR_RESULTS_LOCATION_EVENTS: {
            return {
                ...state,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.SET_RESULTS_LOCATIONS_ACTIVE: {
            return {
                ...state,
                isLocationsActive: action.value,
            };
        }

        case Actions.SET_RESULT_SPORTS_COUNT_OBJECT: {
            return{
                ...state,
                sportsCountObj: action.sportsCountObj
            }
        }

        case Actions.SET_RESULTS_ACTIVE: {
            return {
                ...state,
                isResultsActive: action.value,
            };
        }

        case Actions.SET_RESULTS_SEARCH_STARTED: {
            return {
                ...state,
                searchStarted: action.value,
            };
        }

        case Actions.ON_RESULTS_SEARCH: {
            return {
                ...state,
                searchValue: action.searchValue,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.SET_RESULTS_HAS_NEXT_PAGE: {
            return {
                ...state,
                hasNextPage: action.value,
                currentPage: 0,
            };
        }

        case Actions.SET_RESULTS_SEARCH: {
            let hasNextPage = action.hasNextPage === null ? false : true;

            return {
                ...state,
                mainEvents: action.events,
                noEvents: false,
                noSearchResults: false,
                currentPage: 1,
                hasNextPage: hasNextPage,
            };
        }

        case Actions.ON_RESULTS_CLEAR_SEARCH: {
            return {
                ...state,
                searchValue: '',
                noSearchResults: false,
            };
        }

        case Actions.ON_RESULTS_NO_SEARCH_RESULTS: {
            return {
                ...state,
                noSearchResults: true,
                mainEvents: [],
                currentPage: 0,
                hasNextPage: false,
            };
        }

        case Actions.ON_RESULTS_RESET_PAGE: {
            return {
                ...state,
                currentPage: 0,
                mainEvents: [],
            };
        }

        case Actions.SET_RESULTS_SEARCH_LOAD_MORE: {
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

        default:
            return state;
    }
};

export default lSportsResultsReducer;
