import * as Actions from '../actions/actionTypes';
import forEach from 'lodash.foreach';
import jwtService from '../../services/jwtService';
import { pick } from 'lodash';
import genralServices from '../../services/genralServices';
import { dynamoClient } from '../../App';
import { getFavEvents } from '../../dynamo/favoriteParams';

// Show loading overlay
let statsData = [];
let statsLoading = false;
export const setLoading = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_LOADING, value });
    };
};

// Set language
export const setLanguage = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_LANGUAGE, value });
    };
};

// Get user object data
export const getBanners = () => {
    return (dispatch) => {
        jwtService.getBanners().then((data) => {
            let banners = [];
            if (data.banners) {
                banners = data.banners;
                // data.img_urls.forEach(url => banners.push({ image_url: url }));
                dispatch({ type: Actions.SET_BANNERS, data: banners});
            }
        });
        jwtService.getMatchBanners().then((data) => {
            let banners = [];
            if (data.data) {
                banners = data.data;
                let eventObj = {};
                if (banners.length > 0) {
                    banners.map((event,i) => eventObj[`:evt${i}`] = { fixture_id: `${event.fixture_id}` });
                }
                dynamoClient.batchGet(getFavEvents(eventObj), (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let { Responses: { PartialDevent } } = res;
                        if (PartialDevent?.length) {
                            PartialDevent = PartialDevent.map(match => {
                                // match.fixture_id = +match.fixture_id;
                                match.league = JSON.parse(match.league);
                                if(match.location) {
                                    match.location = JSON.parse(match.location);
                                }
                                eventObj[match.fixture_id] = match;
                                return match;
                            });
                            let updatedBanner = [];
                            banners = banners.map(evt => {
                                const match = eventObj?.[evt.fixture_id];
                                if (match) {
                                    updatedBanner.push({
                                        ...evt,
                                        sport_id: match.sport_id,
                                        redirection: `d/extra-market/${match.sport_id}/${ match.fixture_id }`
                                        // redirection: '/d/sports'
                                    });
                                } return null;
                            });
                            // banners = banners.filter(banner => banner);
                            return dispatch({ type: Actions.SET_BANNERS, data: updatedBanner, isMatchBanner: true });
                        }
                    }
                });
                dispatch({ type: Actions.SET_BANNERS, data: banners, isMatchBanner: true });
                // data.img_urls.forEach(url => banners.push({ image_url: url }));
            }
        });
    };
};

export const getDeviceLocation = () =>  {
    return (dispatch) => {
        genralServices.getDeviceLocation().then(data => dispatch({
            type: Actions.SET_COUNTRY_CODE, countryCode: data.country
        }));
    };
};


export const getStatsData = (url) => {
    if (true) return (dispatch, getState) => {}; 
    return (dispatch) => {
        statsLoading = true;
        genralServices.getStatsStatus(url).then(res => {
            if(res?.api) {
                const { data, method } = res.api;
                const { booked_events } = data;
                if (booked_events) statsData = [ ...statsData, ...booked_events];
                if (method.next_page) {
                    dispatch(getStatsData(method.next_page));
                } else {
                    let evtWithData = {};
                    forEach(statsData, (evt) => {
                        const { client_event_id } = evt;
                        const event = pick(evt, ['id', 'name', 'start_date', 'client_event_id', 'status_type' ]);
                        evtWithData[client_event_id] = event;
                        // if (['live', 'scheduled'].includes(evt['status_type'])) {
                        // }
                    });
                    statsLoading = false;
                    dispatch({type: Actions.SET_STATS_DATA, data: evtWithData });
                    sessionStorage.setItem('stats_data', JSON.stringify({ date: new Date(), data: evtWithData }));
                    return null;
                }
            }
        });
    };
}

export const getTenentStatus = () => {
      return (dispatch) => {
          genralServices.tenetCasinoStatus().then((res)=>{
            dispatch({type:Actions.SET_TENET_STATUS, isShowCasino: res})
          })
          .catch((err)=>{
              console.log(err)
          })
      }
}
