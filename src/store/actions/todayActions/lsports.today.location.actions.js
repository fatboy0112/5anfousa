import { toastr } from 'react-redux-toastr';
import forEach from 'lodash.foreach';
import map from 'lodash.map';
import lSportsService from '../../../services/lSportsService';
import * as Actions from '../actionTypes';
import { selectSportMobile } from './lsports.today.sport.actions';
import { setTodayResetPage } from './lsports.today.general.actions';
import Util from '../../../helper/Util';
import { dynamoClient } from '../../../App';
import { paramsMarketDataIndex } from '../../../dynamo/params';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../../config/markets';
import { updateBetslipEventsMarket } from '../betslip.actions';
// Get locations top list
export const getTodayLocations = (sportId) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        dispatch(setLocationLoading(true));
        lSportsService
            .getTodayLocations(language, sportId)
            .then((locations) => {
                // set locations top list
                dispatch(setTodayLocations(locations));
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
export const setTodayLocations = (locations) => {
    return (dispatch) => {
        dispatch(setLocationLoading(false));
        dispatch({ type: Actions.SET_TODAY_SPORT_LOCATIONS, locations });
    };
};

export const setLocationLoading = (data) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TODAY_SPORT_LOCATIONS_LOADING, data });
    };
};

export const clearPartialLocations = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_TODAY_PARTIAL_LOCATIONS });
    };
};
// Clear locations top list
export const clearLocations = () => {
    return (dispatch) => {
        dispatch({ type: Actions.CLEAR_TODAY_LOCATIONS });
    };
};

// Set selected locations top list
export const setTodaySelectedLocations = (location) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TODAY_SELECTED_LOCATIONS, location });
    };
};

// Get market data for set of fixture
// Get market data for set of fixture
export const getMarketData = (data, startIndex, count) => {
    return (dispatch, getState) => {
        let betFixtures = getState().betslip.fixtures;
        let eventCount = 0;
        let marketsArray = [];
        if (!data.length) return null;
        const { sport_id: sportId } = data[0];
        const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId];
        const defaultMktObj = {};
        defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
        forEach(data, (event, i) => {
            let markets = {};
            // 25715992
            const fixtureId = event.fixture_id;
            dynamoClient.query(paramsMarketDataIndex(`${fixtureId}`), (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let Items = res?.Items;
                    if (Items.length) markets = Util.marketFormatter(Items, fixtureId);
                    // });
                    if(Object.keys(markets).length && betFixtures.length) {
                        // dispatch(updateBetslipEvent({FixtureId: fixtureId, Market: JSON.parse(market) }));
                        dispatch(updateBetslipEventsMarket({[fixtureId]: { FixtureId: fixtureId, Market: markets }}));
                    }
                    let livescore = sessionStorage.getItem('liveScore');
                        if (livescore) {
                            livescore = JSON.parse(livescore);
                            sessionStorage.removeItem('liveScore');
                        }
                    marketsArray[ i ] = { [fixtureId] : { market: markets,  livescore }};
                    eventCount++;
                }
                if(eventCount === count) {
                    let allData  = getState().today.partialAllEvents;
                    allData = allData.reduce((ac, a) => ({ ...ac, [ a.fixture_id ]: a }), {});
                    marketsArray = map(marketsArray, (market, idx) => {
                    let values = Object.values(market);
                    let mktData = values[0]?.market || {};
                    let score = values[0]?.livescore || null;
                    return {
                        ...allData[Object.keys(market)[0]],
                        market: {
                            ...defaultMktObj,
                            ...mktData,
                        },
                        livescore: score,
                        };
                    });
                    dispatch(setTodayLocationEvents(marketsArray));
                }
            });
        });
    };
};


// On location top list item click (filter by location)
export const selectLocation = (locationId) => {
    return (dispatch, getState) => {
        dispatch(setTodayResetPage());

        let selectedLocation = locationId;

        dispatch(setTodaySelectedLocations(selectedLocation));

        let location = selectedLocation?.toString();

        const partialEvents = getState().today.partialAllEvents;
        let locationEvent = partialEvents.filter(event => event.location.Id == location);
        if(!location) locationEvent = partialEvents.slice(0,20);
        if (!locationEvent.length) {
            return dispatch({type: Actions.SET_TODAY_NOEVENT, data: true});
        }
        dispatch(getMarketData(locationEvent,0 ,locationEvent.length));
    };
};

// Set events of selected locations
export const setTodayLocationEvents = (events, hasNextPage) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_TODAY_LOCATION_EVENTS, events, hasNextPage });
    };
};

// On All locations click
export const resetSelectedLocations = (fromLivePage) => {
    return (dispatch, getState) => {
        let sportId = getState().today.selectedSport;
        dispatch(setTodayResetPage());
        if(!fromLivePage) {
            dispatch(selectSportMobile(sportId));
        }
    };
};
