import { toastr } from 'react-redux-toastr';
import Util from '../../helper/Util';
import lSportsService from '../../services/lSportsService';
import * as Actions from './actionTypes';
import { dynamoClient } from '../../App';
import { paramsMarketData, paramsMarketDataIndex, paramsSingleLiveMarket } from '../../dynamo/params';
import { getLiveMatchMarkets } from '../../dynamo/inplayParams';
import forEach from 'lodash.foreach';
import { filter, map } from 'lodash';
import { getFavEvents, getLiveFavEvents } from '../../dynamo/favoriteParams';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import { lSportsConfig } from '../../config';

// Get favorites list
export const getFavorites = () => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        lSportsService
            .getFavorites(language)
            .then((events) => {
                if (events.length > 0) {
                    events[0] = { ...events[0] };
                    // events = [{"fixture_id":29262564,"fixture_status":0},{"fixture_id":27867144,"fixture_status":0},{"fixture_id":27869476,"fixture_status":0},{"fixture_id":27759732,"fixture_status":0},{"fixture_id":27872366,"fixture_status":0},{"fixture_id":27872364,"fixture_status":0}]
                    let preMatches = filter(events, e => e.fixture_status === lSportsConfig.statuses.prematch);
                    let liveMatches = filter(events, e => e.fixture_status !== lSportsConfig.statuses.prematch);
                    dispatch(getEventsData(preMatches, 'pre')); 
                    dispatch(getEventsData(liveMatches, 'live'));
                  
                } else {
                    dispatch(setFavorites([]));
                }
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    dispatch(setFavoritesError());
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// get events data 
export const getEventsData = (events, type) => {
    return (dispatch, getState) => {
        const eventObj = {};
        if (events.length > 0) {
            events.map((event,i) => eventObj[`:evt${i}`] = { fixture_id: `${event.fixture_id}` });
        if (type === 'live') {
            dynamoClient.batchGet(getLiveFavEvents(eventObj), (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let { Responses: { PartialDevent } } = res;
                    if (PartialDevent?.length) {
                        PartialDevent = Util.partialMatchFormatter(PartialDevent);
                        dispatch(getMarketData(PartialDevent, 0, PartialDevent.length, 'live'));
                    }
                }
            });
        }

        if (type === 'pre') {
            dynamoClient.batchGet(getFavEvents(eventObj), (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let { Responses: { PartialDevent } } = res;
                    if (PartialDevent?.length) {
                        PartialDevent = Util.partialMatchFormatter(PartialDevent);
                        dispatch(getMarketData(PartialDevent, 0, PartialDevent.length, 'pre'));
                    }
                }
            });
        }
    } else {
        // if (type === 'live') dispatch(setFavorites([]));
        // else dispatch(setFavoritesLive([]));
    }
    };
};

// Get market data for set of fixture
export const getMarketData = (data, startIndex, count, type) => {
    return (dispatch, getState) => {
        let eventCount = 0;
        let preMarketsArray = [];
        let liveMarketsArray = [];
        if (type === 'pre') {
            if (!data.length) return null;
            const { sport_id: sportId } = data[0];
            const defaultMkt = MARKET_FOR_OUTER_SLIDER_PREMATCH[sportId];
            const defaultMktObj = {};
            defaultMkt.map(mkt => defaultMktObj[`id_${mkt.Id}`] = mkt);
            forEach(data, (event, i) => {
                let markets = {};
                const fixtureId = event.fixture_id;
                dynamoClient.query(paramsMarketDataIndex(`${fixtureId}`), (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (!res.Items.length) count -= 1;
                        else {
                            let Items = res?.Items;
                            if(Items.length) markets = Util.marketFormatter(Items, fixtureId);
                            let livescore = sessionStorage.getItem('liveScore');
                            if (livescore) {
                                livescore = JSON.parse(livescore);
                                sessionStorage.removeItem('liveScore');
                            }
                            preMarketsArray.push({ [fixtureId] : { market: markets, livescore }});
                            eventCount++;
                        }
                    }
                    if(eventCount === count) {
                        let allData  = data;
                        allData = allData.reduce((ac, a) => ({ ...ac, [ a.fixture_id ]: a }), {});
                        preMarketsArray = map(preMarketsArray, (market, idx) => {
                            let values = Object.values(market);
                            let mktData = values[0]?.market || {};
                            let score = values[0]?.livescore || null;                            
                            return {
                                ...allData[Object.keys(market)[0]],
                                market: {
                                    ...mktData
                                },
                                livescore: score,
                            };
                        });
                       dispatch(setFavorites(preMarketsArray));
                    }
                });
            });
        } else if (type === 'live') {
            forEach(data, (event, i) => {
                let markets = {};
                const fixtureId = event.fixture_id;
                dynamoClient.query(getLiveMatchMarkets(`${fixtureId}`), (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (!res.Items.length) count -= 1;
                        else {
                            let Items = res?.Items;
                            if(Items.length) markets = Util.marketFormatter(Items, fixtureId);
                            let livescore = sessionStorage.getItem('liveScore');
                            if (livescore) {
                                livescore = JSON.parse(livescore);
                                sessionStorage.removeItem('liveScore');
                            }
                            liveMarketsArray.push({ [fixtureId] : { market: markets, livescore }});
                            eventCount++;
                        }
                    }
                    if(eventCount === count) {
                        let allData  = data;
                        allData = allData.reduce((ac, a) => ({ ...ac, [ a.fixture_id ]: a }), {});
                        liveMarketsArray = map(liveMarketsArray, (market, idx) => {
                            let values = Object.values(market);
                            let mktData = values[0]?.market || {};
                            let score = values[0]?.livescore || null;                            
                            return {
                                ...allData[Object.keys(market)[0]],
                                market: {
                                    ...mktData
                                },
                                livescore: score,
                                Livescore: score,
                            };
                        });
                       dispatch(setFavoritesLive(liveMarketsArray));
                    }
                });
            });
        }       
    };
};

// Set favorites list
export const setFavorites = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_FAVORITES, events });
    };
};

// Set favorites list for Live
export const setFavoritesLive = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_FAVORITES_LIVE, events });
    };
};

// Set favorites error
export const setFavoritesError = () => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_FAVORITES_ERROR });
    };
};

// Add to favorites
export const addFavorite = (id, fixtureId) => {
    return (dispatch ,getState) => {
         let language = getState().general.language; 
        lSportsService
            .addFavorite(id, fixtureId, language)
            .then((data) => {
               // dispatch({ type: Actions.ADD_FAVORITE, fixtureId });
                dispatch(getFavorites());
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                }
            });
    };
};

// Remove from favorites
export const removeFavorite = (id, fixtureId) => {
    return (dispatch ,getState) => {
        let language = getState().general.language
        lSportsService
            .removeFavorite(id,language)
            .then((data) => {
                dispatch({ type: Actions.REMOVE_FAVORITE, fixtureId });
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                }
            });
    };
};

// WebSocket - update bet (price and status)
export const updateFavoritesEventsMarket = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_FAVORITES_EVENTS_MARKET, events });
    };
};

// WebSocket - update livescore (time and score)
export const updateFavoritesEventsLivescore = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_FAVORITES_EVENTS_LIVESCORE, events });
    };
};

// WebSocket - update event status
export const updateFavoritesEventsStatus = (events) => {
    return (dispatch) => {
        dispatch({ type: Actions.UPDATE_FAVORITES_EVENTS_STATUS, events });
    };
};
