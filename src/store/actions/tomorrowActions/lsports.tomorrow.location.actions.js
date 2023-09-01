import { toastr } from 'react-redux-toastr';
import forEach from 'lodash.foreach';
import map from 'lodash.map';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import { selectSport } from './lsports.tomorrow.sport.actions';
import { setTomorrowResetPage } from './lsports.tomorrow.general.actions';
import Util from '../../../helper/Util';
import { dynamoClient } from '../../../App';
import { paramsMarketData } from '../../../dynamo/params';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../../config/markets';

// Get locations top list
export const getTomorrowLocations = (sportId) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        dispatch(setLocationLoading(true));
        lSportsService
            .getTomorrowLocations(language, sportId)
            .then((locations) => {
                // set locations top list
                dispatch(setTomorrowLocations(locations));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else if (error.message === 'canceled') {
                // Do nothing if pervious request was canceled.
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// Set locations top list
export const setTomorrowLocations = (locations) => {
    return (dispatch) => {
        dispatch(setLocationLoading(false));
        dispatch({ type: Actions.SET_TOMORROW_SPORT_LOCATIONS, locations });
    };
};

export const setLocationLoading = (data) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TOMORROW_SPORT_LOCATIONS_LOADING, data });
    };
};
// Clear locations top list
export const clearLocations = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_TOMORROW_LOCATIONS });
    };
};

// Set selected locations top list
export const setTomorrowSelectedLocations = (location) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TOMORROW_SELECTED_LOCATIONS, location });
    };
};

// Get market data for set of fixture
export const getMarketData = (data, startIndex, count) => {
    return (dispatch, getState) => {
        let eventCount = 0;
        let marketsArray = [];
        if (!data.length) return null;
        const { sport_id: sportId } = data[0];
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId];
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        forEach(data, (event, i) => {
            dynamoClient.query(paramsMarketData(event.fixture_id), (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const { participant_one_full, participant_two_full, market } = data.Items[0]; 
                    marketsArray[i] = { [event.fixture_id]: {
                        market: JSON.parse(market),
                        fixture_status: data.Items[0].fixture_status,
                        participant_one_full: participant_one_full ? JSON.parse(participant_one_full) : {},
                        participant_two_full: participant_two_full ? JSON.parse(participant_two_full) : {},
                    }};
                    eventCount++;
                }
                if(eventCount === count) {
                    let allData  = getState().tomorrow.partialAllEvents;
                    allData = allData.reduce((ac, a) => ({ ...ac, [ a.fixture_id ]: a }), {});
                    marketsArray = map(marketsArray, (market, idx) => {
                        let mktData = Object.values(market)[0];
                        return {
                            ...allData[Object.keys(market)[0]],
                            ...mktData,
                            market: {
                                ...defaultMktObj,
                                ...mktData.market,
                            },
                            participants: [mktData.participant_one_full, mktData.participant_two_full],
                        };
                    });
                    dispatch(setTomorrowLocationEvents(marketsArray));
                }
            });
        });
    };
};

// On location top list item click (filter by location)
export const selectLocation = (locationId) => {
    return (dispatch, getState) => {
        dispatch(setTomorrowResetPage());

        let selectedLocation = locationId;// = getState().tomorrow.selectedLocations;

        dispatch(setTomorrowSelectedLocations(selectedLocation));

        let location = selectedLocation.toString();

        const partialEvents = getState().tomorrow.partialAllEvents;
        let locationEvent = partialEvents.filter(event => event.location.Id === location);
        if(!location) locationEvent = partialEvents.slice(0,20);
        dispatch(getMarketData(locationEvent,0 ,locationEvent.length));
    };
};

// Set events of selected locations
export const setTomorrowLocationEvents = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TOMORROW_LOCATION_EVENTS, events, hasNextPage });
    };
};

// On All locations click
export const resetSelectedLocations = () => {
    return (dispatch, getState) => {
        let sportId = getState().tomorrow.selectedSport;
        dispatch(setTomorrowResetPage());
        dispatch(selectSport(sportId));
    };
};
