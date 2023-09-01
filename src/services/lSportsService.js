import axios from 'axios';
import { format } from 'date-fns';
import { lSportsConfig } from '../config';
import EventEmitter from '../helper/EventEmitter';

const CancelToken = axios.CancelToken;
let cancel;
let locationCancel;
let preMatchSearchCancel;

class lSportsService extends EventEmitter {
    resetLiveMatches = (liveEvents) => {
        return new Promise((resolve, reject) => {
            axios
                .post(`${lSportsConfig.routes.resetLiveMatch}`, {
                    fixtures: liveEvents,
                    event_type: 2,
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getSports = (language, isLastMinute) => {
        return new Promise((resolve, reject) => {
            axios
                .get(`${lSportsConfig.routes.getSports}/${language}`, {
                    params: {
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                        is_only_lastmin: isLastMinute
                    }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getPrematchLocations = (sportId, language, dateFilter) => {
        return new Promise((resolve, reject) => {
            axios
                .get(`${lSportsConfig.routes.getPrematchLocations}/${sportId}/${language}/${dateFilter}`, {
                    params: {
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                    }
                }) 
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getPrematchLeaguesForLocation = (locationId, selectedSport, language, dateFilter) => {
        return new Promise((resolve, reject) => {
            axios
                .get(`${lSportsConfig.routes.getPrematchLeagues}/${locationId}/${language}/${dateFilter}`, {
                    params: {
                        sport_id: selectedSport,
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                    }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getPrematchLeagueEvents = (leagueId, language, page, dateFilter) => {
        let today = format(new Date(), 'yyyy-MM-dd');
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getEvents, {
                    params: {
                        fixture_status: lSportsConfig.statuses.prematch,
                        language: language,
                        league_id: leagueId,
                        page: page,
                        date_filter: dateFilter === today ? '' : dateFilter,
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    inplayGetSportEvents = (sportId, locations, language, page) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getEvents, {
                    params: {
                        fixture_status: lSportsConfig.statuses.inplay,
                        language: language,
                        sport_id: sportId,
                        location_id: locations ? locations : '',
                        page: page,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    inplayGetLocationEvents = (sportId, locations, language, page) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getEvents, {
                    params: {
                        fixture_status: lSportsConfig.statuses.inplay,
                        language: language,
                        sport_id: sportId,
                        location_id: locations,
                        page: page,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getLocations = (status, language, sportId) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getResultsLocations, {
                    params: {
                        fixture_status: status,
                        language: language,
                        sport_id: sportId,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    lastMinuteGetSportEvents = (sportId, language, page) => {
        cancel && cancel("canceled"); // if request is already pending cancel the earlier 
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getEvents, {
                    params: {
                        fixture_status: lSportsConfig.statuses.lastMinute,
                        language: language,
                        sport_id: sportId,
                        page: page,
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                    },
                    cancelToken: new CancelToken(function executor(c){
                        cancel = c;
                    })
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    prematchSearchEvents = (searchValue, status, language, page, sportId) => {
        preMatchSearchCancel && preMatchSearchCancel("canceled"); // if request is already pending cancel the earlier 
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getEvents, {
                    params: {
                        fixture_status: status,
                        participant: searchValue,
                        language: language,
                        page: page,
                        sport_id: sportId,
                    },
                    cancelToken: new CancelToken(function executor(c){
                        preMatchSearchCancel = c;
                    })
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    inplaySearchEvents = (searchValue, locations, language, page) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getEvents, {
                    params: {
                        fixture_status: lSportsConfig.statuses.inplay,
                        location_id: locations,
                        participant: searchValue,
                        language: language,
                        page: page,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getExtraMarkets = (eventId, language) => {
        return new Promise((resolve, reject) => {
            axios
                .get(`${lSportsConfig.routes.getExtraMarkets}/${eventId}/${language}`)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getHomeLeagues = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getHomeLeagues)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getHomeActiveLeagueEvents = (leagueId, language, page) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getEvents, {
                    params: {
                        fixture_status: lSportsConfig.statuses.prematch,
                        language: language,
                        league_id: leagueId,
                        page: page,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getResultsLocationEvents = (sportId, locationId, language, page) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getResults, {
                    params: {
                        fixture_status: lSportsConfig.statuses.results,
                        language: language,
                        location_id: locationId,
                        sport_id: sportId,
                        page: page,
                        page_size: lSportsConfig.defaultNumberOfPage,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    resultsSearchEvents = (searchValue, language, page) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getEvents, {
                    params: {
                        fixture_status: lSportsConfig.statuses.results,
                        participant: searchValue,
                        language: language,
                        page: page,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getFavorites = (language) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getFavorites, {
                    params: {
                        language: language,
                        unique_id: process.env.REACT_APP_UNIQUE_ID
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    addFavorite = (id, fixtureId, language) => {
        let isLive = false;
        if (id === null) {
            isLive = true;
            id = fixtureId;
        }
        return new Promise((resolve, reject) => {
            axios
                .post(lSportsConfig.routes.addFavorite, {
                    events: [fixtureId],
                    isLive: isLive,
                    language
                },{params:{unique_id: process.env.REACT_APP_UNIQUE_ID}})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    removeFavorite = (id ,language) => {
        return new Promise((resolve, reject) => {
            axios
                .delete(`${lSportsConfig.routes.removeFavorite}/${id}`,{params:{unique_id: process.env.REACT_APP_UNIQUE_ID,language}})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    todayGetSportEvents = (sportId, locations, language, page) => {
        cancel && cancel("canceled"); // if request is already pending cancel the earlier 
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getTodayEvents, {
                    params: {
                        language: language,
                        sport_id: sportId,
                        location_id: locations ? locations : '',
                        page: page,
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                    },
                    cancelToken: new CancelToken(function executor(c){
                        cancel = c;
                    })
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    todayGetLocationEvents = (sportId, location, language, page) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getTodayEvents, {
                    params: {
                        language: language,
                        sport_id: sportId,
                        location_id: location,
                        page: page,
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    todaySearchEvents = (searchValue, locations, language, page) => {
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getTodayEvents, {
                    params: {
                        location_id: locations,
                        participant: searchValue,
                        language: language,
                        page: page,
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getTodayLocations = (language, sportId) => {
        locationCancel && locationCancel("canceled"); // if request is already pending cancel the earlier 
        return new Promise((resolve, reject) => {
            axios
                .get(lSportsConfig.routes.getTodayLocations, {
                    params: {
                        language: language,
                        sport_id: sportId,
                        timezone_offset: - (new Date().getTimezoneOffset()/ 60 ),
                    },
                    cancelToken: new CancelToken(function executor(c){
                        locationCancel = c;
                    })
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getStatistics = (eventId, language) => {
        return new Promise((resolve, reject) => {
            axios
                .get(`${lSportsConfig.routes.getStatistics}/${eventId}/${language}`)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };
}

const instance = new lSportsService();

export default instance;
