const API_URL = process.env.REACT_APP_API_URL + '/';

export const lSportsConfig = {
    routes: {
        getSports: API_URL + 'pulls/get-sports',
        getEvents: API_URL + 'events/',
        getExtraMarkets: API_URL + 'pulls/get-market',
        getLocations: API_URL + 'events-location/',
        getPrematchLocations: API_URL + 'pulls/get-prematch-locations',
        getPrematchLeagues: API_URL + 'pulls/get-prematch-leagues',
        getHomeLeagues: API_URL + 'pulls/get-home-leagues',
        getFavorites: API_URL + 'get-favorite',
        addFavorite: API_URL + 'create-favorite',
        removeFavorite: API_URL + 'delete-favorite',
        getTodayEvents: API_URL + 'today-events/',
        getTodayLocations: API_URL + 'today-events-location/',
        getStatistics: API_URL + 'pulls/get-event-statistics',
        getResults: API_URL + 'results/',
        getResultsLocations: API_URL + 'results-location/',
        resetLiveMatch: API_URL + 'pulls/reset_live_events',
    },
    statuses: {
        prematch: 0,
        inplay: 1,
        suspended: 2,
        results: 3,
        closed: 4,
        cancelled: 5,
        delayed: 6,
        interrupted: 7,
        postponed: 8,
        abandoned: 9,
        lastMinute: 10,
    },
    betStatus: {
        active: 1,
        deactivated: 0,
        suspended: -1,
        cancelled: -4,
        settled: -3,
    },
    marketStatus: {
        active: 1,
        deactivated: 0,
        suspended: -1,
        settled: -3,
        cancelled: -4,
    },
    betslip: {
        bonusPersentage: 10, // 10% bonus
        bonusMinValue: 8, // add bonus if total odds are >= 8
    },
    account: {
        statscore_live_id: 1222,
        statscore_prematch_id: 926,
        default_provider: 145,
    },
    inplay: {
        selectedSport: 1,
    },
    prematch: {
        selectedSport: 1,
    },
    lastMinute: {
        selectedSport: 1,
    },
    results: {
        selectedSport: 1,
    },
    today: {
        selectedSport: 1,
    },
    tomorrow: {
        selectedSport: 1,
    },
    sports: {
        football: { id: 1 },
        basketball: { id: 3 },
        iceHockey: { id: 4 },
        tennis: { id: 5 },
        volleyball: { id: 23 },
        boxing: { id: 10 },
        americanFootball :{id:131506},
        baseball :{id: 154914},
        hockey: {id: 530129},
        tableTennis: {id: 265917},
        badminton: {id: 1149093},
        cricket: {id: 452674},
        futsal: {id: 687887},
        golf: {id: 687889},
        handball: {id: 35709},
        rugbyLeagues: {id: 274792},
        beachVolleyball: {id: 621569},
        rugbyUnion: {id: 274791},
        darts: {id: 154923},
        australianRules: {id: 389537},
        floorball: {id: 35706},
        snooker: {id: 262622},





    },
    defaultNumberOfPage: 20,
    
    // Sorting of outcomes NOTE: value should be start with 1 not with 0
    sort: {
        35: { //1x2 & both teams to score
            78 : 1,
            82 : 2,
            86 : 3,
            80 : 4,
            84 : 5,
            88 : 6,
        },
        36: { // Total & both teams to score
            92 : 1,
            96 : 2,
            90 : 3,
            94 : 4,
        },
        37: { // 1X2 & Total
            794 : 1,
            798 : 2,
            802 : 3,
            796 : 4,
            800 : 5,
            804 : 6,
        },
        78: { // 1st half - 1x2 & both teams to score
            78 : 1,
            82 : 2,
            86 : 3,
            80 : 4,
            84 : 5,
            88 : 6,
        },
        79: { // 1st half - 1x2 & total
            794 : 1,
            798 : 2,
            802 : 3,
            796 : 4,
            800 : 5,
            804 : 6,
        },
        543: { // 2nd half - 1x2 & both teams to score
            78 : 1,
            82 : 2,
            86 : 3,
            80 : 4,
            84 : 5,
            88 : 6,
        },
        544: { // 2nd half - 1x2 & total
            794 : 1,
            798 : 2,
            802 : 3,
            796 : 4,
            800 : 5,
            804 : 6,
        },
    },

    // Default expanded pre match outcomes
    preMatchExtraMarketPreOpenMarkets: [ 1, 60, 10, 18, 29, 35, 37, 14, 11, 19, 20, 45, 47, 546, 547 ],

    // Default expanded live match outcomes
    liveExtraMarketPreOpenMarkets: [1, 60, 83, 7, 61, 8, 62, 10, 29, 35, 18, 14, 11, 68, 69, 70, 90 ],

    cashoutTimer: 10, // after 10 seconds cashOut will expire 
    oddsCalculatorTimer: 7, //Popper removed after 7 seconds
    livePagination: 20,
    agentCode: '69217',
};
