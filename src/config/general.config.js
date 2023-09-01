import { Translate } from "../localization";

export const getTransactionTypes = () => {
    return [
        {
            label: Translate.all,
            value: 'all',
        },
        {
            label: Translate.deposit,
            value: 'deposit',
        },
        {
            label: Translate.withdraw,
            value: 'withdraw',
        },
        {
            label: Translate.credit,
            value: 'credet',
        },
        {
            label: Translate.debit,
            value: 'debet',
        }
    ];
} 

export const getMyBetFilterTypes = () => {
    return [
        {
            label: Translate.all,
            value: 'all',
        },
        {
            label: `${Translate['in game']}`,
            value: 'in game',
        },
        {
            label: Translate.won,
            value: 'won',
        },
        {
            label: Translate.lost,
            value: 'lost',
        },
        {
            label: 'Refund',
            value: 'refund',
        },
        {
            label: 'Cashout',
            value: 'cashout',
        },
    ]
} 

export const CASINO_TYPES = [
    {
        label: Translate.all,
        value: 'all',
    },
    {
        label: 'Credit',
        value: 'credet',
    },
    {
        label: 'Debit',
        value: 'debet',
    }
];

export const GG_SLOT_CASINO_TYPES = [
  {
      label: Translate.all,
      value: 'all',
  },
  {
      label: 'Credit',
      value: 'credet',
  },
  {
      label: 'Debit',
      value: 'debet',
  }
];

export const EVO_CASINO_TYPES = [
  {
      label: Translate.all,
      value: 'all',
  },
  {
      label: 'Credit',
      value: 'credet',
  },
  {
      label: 'Debit',
      value: 'debet',
  }
];
export const LIVE_CASINO_TYPES = [
    {
        label: Translate.all,
        value: 'all',
    },
    {
        label: 'Credit',
        value: 'credet',
    },
    {
        label: 'Debit',
        value: 'debet',
    }
];

export const P_CASINO_TYPES = [
  {
      label: Translate.all,
      value: 'all',
  },
  {
      label: 'Credit',
      value: 'credet',
  },
  {
      label: 'Debit',
      value: 'debet',
  }
];

export const CASINO_CATEGORIES = [
    {
        id: 1,
        label: Translate.all,
        value: 'all',
    },
    {
        id: 2,
        label: 'Netent',
        value: 'netent',
    },
    {
        id: 3,
        label: 'Novomatic',
        value: 'novomatic',
    },
    {
        id: 4,
        label: 'One Touch',
        value: 'one-touch',
    },
    {
        id: 5,
        label: 'Pragmaticplay',
        value: 'pragmaticplay',
    },
    {
        id: 6,
        label: 'Amatic',
        value: 'amatic',
    },
    {
        id: 7,
        label: 'Betsoft',
        value: 'betsoft',
    },
    {
        id: 8,
        label: 'Netgame',
        value: 'netgame',
    },
    {
        id: 9,
        label: 'Egaming',
        value: 'egaming',
    },
    {
        id: 10,
        label: 'Wazdan',
        value: 'wazdan',
    },
    {
        id: 11,
        label: 'Boongo Games',
        value: 'boongo-games',
    },
    {
        id: 12,
        label: 'Spinomenal',
        value: 'spinomenal',
    },
    {
        id: 13,
        label: 'Virtual Generation',
        value: 'virtual-generation',
    },
    {
        id: 14,
        label: 'PGSoft',
        value: 'pgsoft',
    },
    {
        id: 15,
        label: 'Woohoo',
        value: 'woohoo',
    },
];

export const CASINO_TOP_GAMES = [1159335, 1002, 529, 1005, 507, 561, 1001, 570, 594, 137];

export const LIVE_CASINO_CATEGORIES = [
    {
        name: 'All',
        value: Translate.all,
        icon: 'icon-all',
    },
    {
        name: 'Roulette',
        value: 'CASINO/LIVECASINO/ROULETTE',
        icon: 'icon-roulette',
    },
    {
        name: 'Blackjack',
        value: 'CASINO/LIVECASINO/BLACKJACK',
        icon: 'icon-blackjack',
    },
    {
        name: 'Baccarat',
        value: 'CASINO/LIVECASINO/BACCARAT',
        icon: 'icon-baccarat',
    },
    {
        name: 'Dragon Tiger',
        value: 'CASINO/LIVECASINO/BACCARAT_DRAGON_TIGER',
        icon: 'icon-dragon-tiger',
    },
    {
        name: 'Poker',
        value: 'CASINO/LIVECASINO/POKER',
        icon: 'icon-poker',
    }, 
    {
        name: 'Lottery',
        value: 'CASINO/LIVECASINO/LOTTERY',
        icon: 'icon-bet-on-numbers',
    },
    {
        name: 'Holdem',
        value: 'CASINO/LIVECASINO/CASINO_HOLDEM',
        icon: '',
    },
    {
        name: 'Other',
        value: 'CASINO/LIVECASINO/OTHER',
        icon: '',
    },
    {
        name: 'Andar Bahar',
        value: 'CASINO/LIVECASINO/ANDAR_BAHAR',
        icon: '',
    },
    {
        name: 'Game Show',
        value: 'CASINO/LIVECASINO/GAME_SHOW',
        icon: '',
    },
    {
        name: 'Lucky 7',
        value: 'CASINO/LIVECASINO/LUCKY7',
        icon: '',
    }
];

export const P_CASINO_CATEGORIES = [
  {
      name: 'All',
      value: Translate.all,
      icon: 'icon-all',
  },
  {
    name: 'PariplayRgs2Rgs',
    value: "PariplayRgs2Rgs",
    icon: 'icon-all',
  }
  
 
]

export const VIRTUAL_SPORTS = [
    {
        name: 'All',
        value: Translate.all,
        icon: 'icon-all',
    },
    {
        name: 'Virtual Sports',
        value: 'CASINO/VIRTUAL_SPORTS/VIRTUAL_HORSES',
        icon: '',
    },
    {
        name: 'Virtual Games',
        value: 'CASINO/VIRTUALGAME/LOTTERY',
        icon: '',
    },
]

export const LIVE_CASINO_EVOLUTION_GAMES = [
    {
        category: 'Baccarat',
        company: 'New Evolution',
        name: 'First Person Baccarat',
        id: '1179673',
        logo: './images/live-casino/baccarat/Baccarat_first_person.jpg',
        sort: 4,
    },
    {
        category: 'Baccarat',
        company: 'New Evolution',
        name: 'Speed Baccarat G',
        id: '1179673',
        logo: './images/live-casino/baccarat/speed_baccarat.jpg',
        sort: 4,
    },
    {
        category: 'Blackjack',
        company: 'New Evolution',
        name: 'First Person Blackjack',
        id: '1179673',
        logo: './images/live-casino/blackjack/Black_jack_first_person.jpg',
        sort: 2,
    },
    {
        category: 'Blackjack',
        company: 'New Evolution',
        name: 'Blackjack Lobby',
        id: '1179673',
        logo: './images/live-casino/blackjack/Infonate_BlackJack.jpg',
        sort: 2,
    },
    {
        category: 'Blackjack',
        company: 'New Evolution',
        name: 'Blackjack Platinum VIP',
        id: '1179673',
        logo: './images/live-casino/blackjack/vip_black_jack.jpg',
        sort: 2,
    },
    {
        category: 'Dragon Tiger',
        company: 'New Evolution',
        name: 'Dragon Tiger',
        id: '1179673',
        logo: './images/live-casino/dragon-tiger/Dragon_Tiger.jpg',
        sort: 5,
    },
    {
        category: 'Football',
        company: 'New Evolution',
        name: 'Football studio',
        id: '1179673',
        logo: './images/live-casino/football-studio/Football_Studio.jpg',
        sort: 7,
    },
    {
        category: 'Holdem',
        company: 'New Evolution',
        name: 'Casino Holdem Lobby',
        id: '1179673',
        logo: './images/live-casino/holdem/Holdem.jpg',
        sort: 3,
    },
    {
        category: 'Holdem',
        company: 'New Evolution',
        name: 'Side Bet City',
        id: '1179673',
        logo: './images/live-casino/holdem/Side_Bet_city.jpg',
        sort: 3,
    },
    {
        category: 'Money Wheel',
        company: 'New Evolution',
        name: 'Dream Catcher',
        id: '1179673',
        logo: './images/live-casino/money-wheel/Dream_Catcher_Money_Wheel.jpg',
        sort: 8,
    },
    {
        category: 'Money Wheel',
        company: 'New Evolution',
        name: 'Dream Catcher',
        id: '1179673',
        logo: './images/live-casino/money-wheel/Money_Wheel_2.jpg',
        sort: 8,
    },
    {
        category: 'Roulette',
        company: 'New Evolution',
        name: 'American Roulette',
        id: '1179673',
        logo: './images/live-casino/roulette/AMERICAN_ROULETTE.jpg',
        sort: 1,
    },
    {
        category: 'Roulette',
        company: 'New Evolution',
        name: 'Auto-Roulette VIP',
        id: '1179673',
        logo: './images/live-casino/roulette/Auto_Roulette.jpg',
        sort: 1,
    },
    {
        category: 'Roulette',
        company: 'New Evolution',
        name: 'Immersive Roulette',
        id: '1179673',
        logo: './images/live-casino/roulette/Immersive_Roulette.jpg',
        sort: 1,
    },
    {
        category: 'Roulette',
        company: 'New Evolution',
        name: 'RNG Lightning Roulette',
        id: '1179673',
        logo: './images/live-casino/roulette/Lightning_Roulette.jpg',
        sort: 1,
    },
    {
        category: 'Roulette',
        company: 'New Evolution',
        name: 'Roulette',
        id: '1179673',
        logo: './images/live-casino/roulette/SPEED_ROULETTE.jpg',
        sort: 1,
    },
    {
        category: 'Roulette',
        company: 'New Evolution',
        name: 'Roulette',
        id: '1179673',
        logo: './images/live-casino/roulette/VIP_ROULETTE.jpg',
        sort: 1,
    },
    {
        category: 'Sick Bo',
        company: 'New Evolution',
        name: 'Super Sic Bo',
        id: '1179673',
        logo: './images/live-casino/sick-bo/Sick_Bo.jpg',
        sort: 9,
    },
    {
        category: 'Bet On Numbers',
        company: 'New Evolution',
        name: 'RNG First Person Mega Ball',
        id: '1179673',
        logo: './images/live-casino/megaball/Mega_Ball.jpg',
        sort: 6,
    },
];

export const intervalTime = 180000;

export const CASINO_PER_PAGE = 50;

export const sessionTimer = 5; 

export const totalSegments = 40;

export const resultTotalSegments = 20;

export const prematchEventBatchSize = 100;

export const prematchMarketSize = 20;

export const agentCode = '69217';
export const maxWebsocketRetryCount = 5;

export const internationalLocationIds = [
    4, // International
    392, // International Youths
    393 // International Clubs
];
export const lobby_id = 4;

export const CASINO_GAME_LIST_QTECH = [
    'TABLE_GAMES',
    'INSTANT_WIN',
    'BINGO_GAMES',
    'SCRATCH_CARDS',
    'SHOOTING_GAMES',
    'CASUAL_GAMES',
    'VIRTUAL_SPORTS',
    'VIRTUAL_GAMES',
    'LIVE_CASINO',
    'ESPORTS',
];



export const NEW_CASINO_CATEGORIES = [
    {
        name: 'All',
        value: Translate.all,
        icon: 'icon-all',
    },
    {
        name: 'Pragmatic Play Casino',
        value : 'PPC',
        icon: '',
    },
    // {
    //     name: 'Evoplay',
    //     value : 'EVP',
    //     icon: '',
    // },
    // {
    //     name: '1x2 Gaming',
    //     value : '1x2',
    //     icon: '',
    // },
    // {
    //     name: 'August Gaming',
    //     value : 'AUG',
    //     icon: '',
    // },
    // {
    //     name: 'BB Gaming',
    //     value : 'BBG',
    //     icon: '',
    // },
    // {
    //     name: 'Blueprint Gaming',
    //     value : 'BPG',
    //     icon: '',
    // },
    // {
    //     name: 'Booongo',
    //     value : 'BNG',
    //     icon: '',
    // },
    // {
    //     name: 'Dragoon Soft',
    //     value : 'DS',
    //     icon: '',
    // },

    // {
    //     name: 'Fantasma Games',
    //     value : 'FNG',
    //     icon: '',
    // },
    // {
    //     name: 'GameArt',
    //     value : 'GA',
    //     icon: '',
    // },
    // {
    //     name: 'Gamefish Global',
    //     value : 'GFG',
    //     icon: '',
    // },
    // {
    //     name: 'Habanero',
    //     value : 'HAB',
    //     icon: '',
    // },
    // {
    //     name: 'Hacksaw Gaming',
    //     value : 'HAK',
    //     icon: '',
    // },
    // {
    //     name: 'Iron Dog Studio',
    //     value : 'IDS',
    //     icon: '',
    // },
    // {
    //     name: 'Kalamba Games',
    //     value : 'KGL',
    //     icon: '',
    // },
    // {
    //     name: 'Lady Luck',
    //     value : 'LL',
    //     icon: '',
    // },
    // {
    //     name: 'Maverick',
    //     value : 'MAV',
    //     icon: '',
    // },
    // {
    //     name: 'Mobilots',
    //     value : 'MOB',
    //     icon: '',
    // },
    // {
    //     name: 'NetEnt',
    //     value : 'NE',
    //     icon: '',
    // },
    // {
    //     name: 'NetGame',
    //     value : 'NGE',
    //     icon: '',
    // },
    // {
    //     name: 'Nolimit City',
    //     value : 'NLC',
    //     icon: '',
    // },
    // {
    //     name: 'OMI Gaming',
    //     value : 'OMI',
    //     icon: '',
    // },
    // {
    //     name: 'OneTouch',
    //     value : 'OT',
    //     icon: '',
    // },
    // {
    //     name: 'PlayPearls',
    //     value : 'PP',
    //     icon: '',
    // },

    // {
    //     name: 'Push Gaming',
    //     value : 'PUG',
    //     icon: '',
    // },
    // {
    //     name: 'Revolver Gaming',
    //     value : 'RG',
    //     icon: '',
    // },
    // {
    //     name: 'Slotmill',
    //     value : 'SM',
    //     icon: '',
    // },
    // {
    //     name: 'Spearhead Studios',
    //     value : 'SHS',
    //     icon: '',
    // },
    // {
    //     name: 'Splitrock',
    //     value : 'SPR',
    //     icon: '',
    // },
    // {
    //     name: 'Thunderkick',
    //     value : 'TK',
    //     icon: '',
    // },
    // {
    //     name: 'Yggdrasil',
    //     value : 'YGG',
    //     icon: '',
    // },
];

export const CASINO_TRANSACTION_OPTIONS = [
    {
        id: 'casino',
        label: Translate.casino,
    },
    {
        id: 'GG-Slot casino',
        label: 'Amatic',
    },
    {
      id: 'pcasino',
      label: 'P-casino',
    }
];

export const LIVE_CASINO_TRANSACTION_OPTIONS = [
    {
        id: 'live casino',
        label: Translate.liveCasino,
    },
    {
        id: 'evo casino',
        label: 'Evo Casino',
    },
];

export const MAX_BET_COUNT = 20;