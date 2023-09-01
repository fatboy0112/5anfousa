import { filter, uniqBy, map, orderBy, forEach, uniq } from 'lodash';
import {LIVE_CASINO_CATEGORIES, NEW_CASINO_CATEGORIES, VIRTUAL_SPORTS} from '../../config';
import * as Actions from '../actions/actionTypes';
import { Translate } from '../../localization';

const initialState = {
    casinoGames: [],
    casinoCategories: [],
    filteredCasinoGames: [],
    loadingCasinoGames: true,
    activeCategory: 'All',
    currentGameData: {},
    liveCasinoGames: [],
    filteredLiveCasinoGames: [],
    liveCasinoCategories: [],
    loadingLiveCasinoGames: true,
    searchStarted: false,
    noSearchResults: false,
    activeCategoryLive: 'All',
    currentLiveGameData: {},
    virtualSports: [],
    filteredVirtualSports: [],
    virtualSportsCategories: [],
    loadingVirtualSports: true,
    virtualSportsSearchStarted: false,
    noVirtualSearchResult: false,
    virtualSportsActiveCategory: 'All',
    casinoLobbyURL:'',
    setLoadingSlot: false,
    filteredNewCasinoGames: [],
    newCasinoGames: [],
    loadingNewCasinoGames: true,
    activeCategoryNew: 'All'
};

const casinoReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_CASINO_GAMES: {
            let games = action.games;
            games=games.filter(g=>g.imgURL||g.image)
            let categories = uniqBy(map(games, 'category'));
            categories =
                uniqBy(
                    map(categories, (category) => {
                        return { value: category }; /// for GG casino

                        // const splitedCategory = category.split('/');
                        // return { value: splitedCategory[ 1 ] };     // for casino
                    }), 'value');
            forEach(categories, (category) => {
                if(category.value === 'netent'){
                    category.sort = 1;
                }
                else if(category.value === 'amatic'){
                    category.sort = 2;
                }

                else if(category.value === 'novomatic'){
                    category.sort = 3;
                }

                else if(category.value === 'bomba'){
                    category.sort = 4;
                }
                else if(category.value === 'wazdan'){
                    category.sort = 5;
                }
                else if(category.value === 'egt'){
                    category.sort = 6;
                }
                else if(category.value === 'aristocrat'){
                    category.sort = 7;
                }
                else if(category.value === 'racing'){
                    category.sort = 8;
                }

                else{
                    category.value="";
                }
            });
            categories = orderBy(categories, ['sort'], 'asc');
            categories.unshift({ value: Translate.all });

            return {
                ...state,
                casinoGames: games,
                casinoCategories: categories,
                loadingCasinoGames: false,
            };
        }

        case Actions.SET_P_CASINO_GAMES: {
            let games = action.games.filter((game) => !['AlchemyBlast', 'TropicalEscape', 'UnfoldKeno'].includes(game.Name) && (game.Vendor !== 'PariplayRgs2Rgs' || game.Platform === 3));
            let categories=[]
            let bucketName = 'pariplay_images';
            categories.push('All');

            forEach(games, (game) => {
                if (game.Vendor === 'Pragmatic') bucketName = 'pragmatic_img';
                else bucketName = 'pariplay_images';

                if (game.Vendor) {
                  categories.push(game.Vendor)
                }
                let imageName = game.Name;
                imageName = imageName.replace('Desktop', '');
                imageName = imageName.replace('Mobile', '');
                imageName = imageName.replace('10cMin-', '');
                imageName = imageName.replace(/\d+$/, '');
                imageName = imageName.replace('%', '');
                imageName = imageName.toLowerCase();
                game.imgURL = `https://gammabet-banners.s3.us-east-1.amazonaws.com/${bucketName}/${imageName}.png`;
            });                      
            games = orderBy(games, ['Vendor'], 'asc');
            
            let liveCasinoCategories = uniq(categories);
            return {
                ...state,
                liveCasinoGames: games,
                liveCasinoCategories: liveCasinoCategories,
                loadingLiveCasinoGames: false,
            };
        }

        case Actions.SET_LIVE_CASINO_GAMES: {
            let games = action.games;
            games=games.filter(g=>g.imgURL||g.image)
            forEach(games, (game) => {
                if (game.category === 'CASINO/LIVECASINO/ROULETTE') {
                    game.sort = 1;
                } else if (game.category === 'CASINO/LIVECASINO/BLACKJACK') {
                    game.sort = 2;
                } else if (game.category === 'CASINO/LIVECASINO/BACCARAT') {
                    game.sort = 3;
                } else {
                    game.sort = 4;
                }
            });
            games = orderBy(games, ['sort'], 'asc');

            let liveCasinoCategories = LIVE_CASINO_CATEGORIES;
            return {
                ...state,
                liveCasinoGames: games,
                liveCasinoCategories: liveCasinoCategories,
                loadingLiveCasinoGames: false,
            };
        }

        case Actions.SET_CASINO_ACTIVE_CATEGORY: {
            let { casinoGames } = state;

            if (action.category === Translate.all) {
                return {
                    ...state,
                    casinoGames: casinoGames,
                    filteredCasinoGames: [],
                    activeCategory: action.category,
                };
            } else {
                let filteredGames = filter(casinoGames, (game) => {
                    return game.category === action.category;  // GG casino
                    // return game.category.split('/')[ 1 ] === action.category;  // for casino
                });
                return {
                    ...state,
                    filteredCasinoGames: filteredGames,
                    activeCategory: action.category,
                };
            }
        }
        

        case Actions.SET_P_CASINO_ACTIVE_CATEGORY: {
          let { liveCasinoGames } = state;

          if (action.category === Translate.all) {
              return {
                  ...state,
                  liveCasinoGames: liveCasinoGames,
                  filteredLiveCasinoGames: [],
                  activeCategoryLive: action.category,
              };
          } else {
              let filteredGames = filter(liveCasinoGames, (game) => {
                  return game.Vendor === action.category;
              });
              return {
                  ...state,
                  filteredLiveCasinoGames: filteredGames,
                  activeCategoryLive: action.category,
              };
          }
      }

        case Actions.SET_LIVE_CASINO_ACTIVE_CATEGORY: {
            let { liveCasinoGames } = state;

            if (action.category === Translate.all) {
                return {
                    ...state,
                    liveCasinoGames: liveCasinoGames,
                    filteredLiveCasinoGames: [],
                    activeCategoryLive: action.category,
                };
            } else {
                let filteredGames = filter(liveCasinoGames, (game) => {
                    return game.category === action.category;
                });
                return {
                    ...state,
                    filteredLiveCasinoGames: filteredGames,
                    activeCategoryLive: action.category,
                };
            }
        }

        case Actions.SET_CASINO_SEARCH_STARTED: {
            return {
                ...state,
                searchStarted: action.value,
                noSearchResults: false,
                filteredCasinoGames: [],
            };
        }

        case Actions.SET_LIVE_CASINO_SEARCH_STARTED: {
            return {
                ...state,
                searchStarted: action.value,
                filteredLiveCasinoGames: [],
            };
        }

        case Actions.SET_CASINO_SEARCH: {
            let { casinoGames } = state;

            let filteredGames = filter(casinoGames, (game) => {
                let lowercaseGameName = game.name.toLowerCase();
                let lowercaseSearchVal = action.value.toLowerCase();
                return lowercaseGameName.includes(lowercaseSearchVal);
            });

            if (filteredGames.length > 0) {
                return {
                    ...state,
                    filteredCasinoGames: filteredGames,
                    noSearchResults: false,
                };
            } else {
                return {
                    ...state,
                    filteredCasinoGames: [],
                    noSearchResults: true,
                };
            }
        }

        case Actions.SET_LIVE_CASINO_SEARCH: {
            let { liveCasinoGames } = state;

            let filteredGames = filter(liveCasinoGames, (game) => {
                let lowercaseGameName = game.name.toLowerCase();
                let lowercaseSearchVal = action.value.toLowerCase();
                return lowercaseGameName.includes(lowercaseSearchVal);
            });

            if (filteredGames.length > 0) {
                return {
                    ...state,
                    filteredLiveCasinoGames: filteredGames,
                    noSearchResults: false,
                };
            } else {
                return {
                    ...state,
                    filteredLiveCasinoGames: [],
                    noSearchResults: true,
                };
            }
        }

        case Actions.SET_PCASINO_SEARCH: {
            let { liveCasinoGames } = state;

            let filteredGames = filter(liveCasinoGames, (game) => {
                let lowercaseGameName = game?.Name?.toLowerCase();
                let lowercaseSearchVal = action?.value?.toLowerCase();
                return lowercaseGameName.includes(lowercaseSearchVal);
            });

            if (filteredGames.length > 0) {
                return {
                    ...state,
                    filteredLiveCasinoGames: filteredGames,
                    noSearchResults: false,
                };
            } else {
                return {
                    ...state,
                    filteredLiveCasinoGames: [],
                    noSearchResults: true,
                };
            }
        }

        case Actions.SET_GAME_DATA: {
            return {
                ...state,
                currentGameData: action.data,
            };
        }

        case Actions.SET_LIVE_GAME_DATA: {
            return {
                ...state,
                currentLiveGameData: action.data,
            };
        }

        case Actions.CLEAR_CASINO_GAMES: {
            return {
                ...state,
                casinoGames: [],
                casinoCategories: [],
                filteredCasinoGames: [],
                loadingCasinoGames: true,
                searchStarted: false,
                noSearchResults: false,
                activeCategory: 'All',
                currentGameData: {},
            };
        }

        case Actions.CLEAR_LIVE_CASINO_GAMES: {
            return {
                ...state,
                liveCasinoGames: [],
                filteredLiveCasinoGames: [],
                liveCasinoCategories: [],
                loadingLiveCasinoGames: true,
                searchStarted: false,
                noSearchResults: false,
                activeCategoryLive: 'All',
                currentLiveGameData: {},
            };
        }

        case Actions.SET_VIRTUAL_SPORTS: {
            let sports = action.sports;
            sports=sports.filter(g=>g.imgURL||g.image)
            forEach(sports, (sport) => {
                if (sport.category === 'CASINO/LIVECASINO/ROULETTE') {
                    sport.sort = 1;
                } else if (sport.category === 'CASINO/LIVECASINO/BLACKJACK') {
                    sport.sort = 2;
                    // } else if (sport.category === 'CASINO/LIVECASINO/BACCARAT') {
                    //     sport.sort = 3;
                } else {
                    sport.sort = 3;
                }
            });
            sports = orderBy(sports, ['sort'], 'asc');

            let virtualSportsCategories = VIRTUAL_SPORTS;
            return {
                ...state,
                virtualSports: sports,
                virtualSportsCategories: virtualSportsCategories,
                loadingVirtualSports: false,
            };
        }

        case Actions.SET_VIRTUAL_SPORTS_CATEGORY: {
            let { virtualSports } = state;

            if (action.category === Translate.all) {
                return {
                    ...state,
                    filteredVirtualSports: [],
                    virtualSportsActiveCategory: action.category,
                };
            } else {
                let filteredSports = filter(virtualSports, (sport) => {
                    return sport.category.split('/')[ 1 ] === action.category.split('/')[ 1 ];
                });
                return {
                    ...state,
                    filteredVirtualSports: filteredSports,
                    virtualSportsActiveCategory: action.category,
                };
            }
        }

        case Actions.CLEAR_VIRTUAL_SPORTS: {
            return {
                ...state,
                virtualSports: [],
                filteredVirtualSports: [],
                virtualSportsCategories: [],
                loadingVirtualSports: true,
                virtualSportsSearchStarted: false,
                noVirtualSearchResult: false,
                virtualSportsActiveCategory: 'All',
                currentVirtualSports: {},
            };
        }

        case Actions.SET_VIRTUAL_SPORTS_SEARCH: {
            let { virtualSports } = state;

            let filteredSports = filter(virtualSports, (sport) => {
                let lowercaseGameName = sport.name.toLowerCase();
                let lowercaseSearchVal = action.value.toLowerCase();
                return lowercaseGameName.includes(lowercaseSearchVal);
            });

            if (filteredSports.length > 0) {
                return {
                    ...state,
                    filteredVirtualSports: filteredSports,
                    noVirtualSearchResult: false,
                };
            } else {
                return {
                    ...state,
                    filteredVirtualSports: [],
                    noVirtualSearchResult: true,
                };
            }
        }

        case Actions.SET_VIRTUAL_SEARCH_STARTED: {
            return {
                ...state,
                virtualSportsSearchStarted: action.value
            };
        }

        case Actions.SET_CASINO_LOBBY: {
            return {
                ...state,
                casinoLobbyURL: action.url,
            };
        }

        case Actions.SET_LOADING_SLOT: {
            return {
                ...state,
                setLoadingSlot: action.value
            };
        }        case Actions.SET_NEW_CASINO_GAMES: {
            let games = action.games;
            games=games.filter(g=>g.imgURL||g.image)
            forEach(games, (game) => {
                if (game.provider === 'PPC') {
                    game.sort = 1;
                }
                if (game.provider === 'NE') {
                    game.sort = 2;
                } else if (game.provider === 'MAV') {
                    game.sort = 3;
                } else {
                    game.sort = 4;
                }
            });
            games = orderBy(games, ['sort'], 'asc');

            let newCasinoCategories = NEW_CASINO_CATEGORIES;
            return {
                ...state,
                newCasinoGames: games,
                filteredNewCasinoGames: [],
                newCasinoCategories: newCasinoCategories,
                loadingNewCasinoGames: false,
            };
        }

        case Actions.SET_NEW_CASINO_ACTIVE_CATEGORY: {
            let { newCasinoGames } = state;

            if (action.category === Translate.all) {
                return {
                    ...state,
                    newCasinoGames: newCasinoGames,
                    filteredNewCasinoGames: [],
                    activeCategoryNew: action.category,
                };
            } else {
                let filteredGames = filter(newCasinoGames, (game) => {
                    return game.provider === action.category;
                });
                return {
                    ...state,
                    filteredNewCasinoGames: filteredGames,
                    activeCategoryNew: action.category,
                };
            }
        }

        case Actions.SET_NEW_CASINO_SEARCH_STARTED: {
            return {
                ...state,
                searchStarted: action.value,
                filteredNewCasinoGames: [],
            };
        }

        case Actions.SET_NEW_CASINO_SEARCH: {
            let { newCasinoGames } = state;

            let filteredGames = filter(newCasinoGames, (game) => {
                let lowercaseGameName = game.name.toLowerCase();
                let lowercaseSearchVal = action.value.toLowerCase();
                return lowercaseGameName.includes(lowercaseSearchVal);
            });

            if (filteredGames.length > 0) {
                return {
                    ...state,
                    filteredNewCasinoGames: filteredGames,
                    noSearchResults: false,
                    loadingNewCasinoGames: false
                };
            } else {
                return {
                    ...state,
                    filteredNewCasinoGames: [],
                    noSearchResults: true,
                    loadingNewCasinoGames: false
                };
            }
        }

        case Actions.SET_NEW_GAME_DATA: {
            return {
                ...state,
                currentNewGameData: action.data,
            };
        }

        case Actions.CLEAR_NEW_CASINO_GAMES: {
            return {
                ...state,
                newCasinoGames: [],
                filteredNewCasinoGames: [],
                newCasinoCategories: [],
                loadingNewCasinoGames: true,
                searchStarted: false,
                noSearchResults: false,
                activeCategoryNew: 'All',
                currentNewGameData: {},
            };
        }


        default:
            return state;
    }
};

export default casinoReducer;
