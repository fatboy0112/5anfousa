const BASE_API = process.env.REACT_APP_API_URL; 
const API_URL = process.env.REACT_APP_API_URL + '/';
const CASINO_URL = process.env.REACT_APP_API_URL ;

export const apiConfig = {
    routes: {
        login: API_URL + 'login',
        signup: API_URL + 'signup',
        getBanner: 'https://admin.igamingbook.com/api/v0/users/banners',
        getMatchBanner: 'https://admin.igamingbook.com/api/v0/users/match-banner-api/',
        changePassword: API_URL + 'change-password',
        user: API_URL + 'players',
        cashback: API_URL + 'cashback',
        deposit: BASE_API + 'payments/qr_code_payment',
        placeBet: API_URL + 'create-betslip',
        getBetslips: API_URL + 'betslip-list',
        getSingleBetslip: API_URL + 'bet-list',
        getLastBetslip: API_URL + 'last-bet-slip',
        getBetLimits: API_URL + 'get-bet-limits',
        getTransactions: API_URL + 'bets/transactions',
        bonusTransactions: API_URL+'bonus-transactions',
        getCasinoTransactions: API_URL + 'casino-transactions',
        getLiveCasinoTransactions: API_URL + 'live-casino-transactions',
        getGgSlotTransactions: API_URL + 'gg-slot-transactions',
        getEvoCasinoTransactions: API_URL + 'evo-casino-transactions',
        getPcasinoTransactions: API_URL + 'pcasino-transactions',

        refreshToken: API_URL + 'refresh',
        tenetCasinoStatus: API_URL+ 'tenant_casino_status',
        getCasinoGames: CASINO_URL + '/game/list_custom',
        initCasinoUser: API_URL + 'casino/initiate-user',
        getGameData: API_URL + 'casino/game',
        hearbeat: API_URL + 'heartbeat',
        // getLiveCasinoGames: CASINO_URL + 'live-casino-game-list/',
        getLiveCasinoGames: CASINO_URL + '/game/list_custom',
        getLiveGameData: CASINO_URL + '/casino/single-game/',
        getpCasinoGames: CASINO_URL + '/pcasino/games_list/',
        placeLiveBet: API_URL + 'place-live-bets',

        getDeviceLocation: 'https://get.geojs.io/v1/ip/country.json',
        
        getCashoutData: API_URL + 'betslip/get_cashout_amount',
        processCashout: API_URL + 'betslip/process_cashout_amount',
        //  casinoAPI: CASINO_URL + '/casino/single-game/',
        casinoAPI: CASINO_URL + '/gg_slot/game',
        pcasinoAPI: CASINO_URL + '/pcasino/launch-game/',
        
        getLiveStreamData: API_URL + 'live-stream-events',

        // Virtual sports
        getVirtualSports: CASINO_URL + '/game/list_custom',

        // to search events at sports page
        searchEvent: API_URL + 'search_events',

        // get stats data
        getStatsScore: 'https://api.statscore.com/v2/booked-events?client_id=549&product=prematchcenter&lang=en&mapped_status=mapped&events_details=no',
        lobbyURL: CASINO_URL + '/game/lobby/',
        initGgSlotUser:CASINO_URL + '/gg_slot/initiate-user',
        getGgAllGamesList:'https://api.gapi.lol/api/v2/games/all',
       
        ggSlotURL : CASINO_URL +'/gg_slot/set_lobby',

        //NEW CASINO
        getNewCasinoGames: CASINO_URL + '/game/list',
        getNewGameData: CASINO_URL + '/casino/single-game/',

        getPrematchCount: process.env.REACT_APP_PREMATCHES_API,
        ezugiCasinoLobby: CASINO_URL + '/ecasino/lobby_launch_url/',

    },
};
