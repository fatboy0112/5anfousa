import {toastr} from 'react-redux-toastr';
import Util from '../../helper/Util';
import {isMobileOnly} from 'react-device-detect';
import casinoService from '../../services/casinoService';
import jwtService from '../../services/jwtService';
import * as Actions from './actionTypes';
import {setLoading} from './general.actions';
import {lobby_id} from '../../config/general.config';

let casinoGameTimer;

// Get casino games list
export const getCasinoGames = () => {
    return (dispatch) => {
        casinoService
            .getCasinoGames()
            .then((games) => {
                dispatch(setCasinoGames(games));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};


export const getGGCasinoGames = () => {
    return (dispatch) => {
        casinoService.initGgSlotUser().then((res) => {
            casinoService
                .getAllGgGamesList()
                .then((games) => {
                    dispatch(setCasinoGames(games.data));
                });
        }).catch((error) => {
            console.error(error);
            if (error && error.response && error.response.status && error.response.status === 401) {
                Util.handleRepeatedLogin(error.response);
            } else {
                toastr.error('', 'Something went wrong.');
            }
        });
    };
};
// Set casino games list
export const setCasinoGames = (games) => {
    clearInterval(casinoGameTimer);
    return (dispatch) => {
        dispatch({type: Actions.SET_CASINO_GAMES, games});
    };
};

// Get live casino games list
export const getLiveCasinoGames = () => {
    return (dispatch) => {
        casinoService
            .getLiveCasinoGames()
            .then((games) => {
                dispatch(setLiveCasinoGames(games));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

export const getpCasinoGames = () => {

  return (dispatch,getState) => {
    let language = getState().general.language;

      casinoService
          .getpCasinoGames(language)
          .then((games) => {
              dispatch(setPCasinoGames(games));
          })
          .catch((error) => {
              console.error(error);
              if (error && error.response && error.response.status && error.response.status === 401) {
                  Util.handleRepeatedLogin(error.response);
              } else {
                  toastr.error('', 'Something went wrong.');
              }
          });
  };
};

// Set live casino games list
export const setLiveCasinoGames = (games) => {
    clearInterval(casinoGameTimer);
    return (dispatch) => {
        dispatch({type: Actions.SET_LIVE_CASINO_GAMES, games});
    };
};

export const setPCasinoGames = (games) => {
  clearInterval(casinoGameTimer);
  return (dispatch) => {
      dispatch({ type: Actions.SET_P_CASINO_GAMES, games });
  };
};

// Set casino active category
export const setCasinoActiveCategory = (category) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_CASINO_ACTIVE_CATEGORY, category});
    };
};

// Set live casino active category
export const setLiveCasinoActiveCategory = (category) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_LIVE_CASINO_ACTIVE_CATEGORY, category});
    };
};

export const setPCasinoActiveCategory = (category) => {
  return (dispatch) => {
      dispatch({ type: Actions.SET_P_CASINO_ACTIVE_CATEGORY, category });
  };
};

// Set search started
export const setSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_CASINO_SEARCH_STARTED, value});
    };
};

// Set live search started
export const setLiveSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_LIVE_CASINO_SEARCH_STARTED, value});
    };
};

// Serach game by name
export const searchCasino = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_CASINO_SEARCH, value});
    };
};

// Serach live game by name
export const searchLiveCasino = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_LIVE_CASINO_SEARCH, value});
    };
};

// Serach pcasino game by name
export const searchPCasino = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_PCASINO_SEARCH, value });
    };
};

// Get game data
export const getSlotGameData = (game, history) => {
    ;
    return (dispatch, getState) => {

        let language = getState().general.language;
        let country = getState().general.country;
        let userData = getState().user.data;
        let gameName= game.menu_title;
        let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'R$' : userData.currency : 'R$';
        casinoService
            .getGameData(gameName, language, country, currency)
            .then((data) => {
                // sessionStorage.setItem('casino_url', data.url);
                // window.location.href = data.url;
                let  game_url = `${data.GAME_URL}?game=${data.game}&hash=${data.hash}&api_id=${data.api_id}&lang=en&exit=${data.exiturl}>`;
                sessionStorage.setItem('casino_url',game_url);

                window.location.href = game_url;
                dispatch(setLoading(false));
                dispatch(setSlotGameData(data));

            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};


// Set game data
export const setSlotGameData = (data) => {
    // If user is playing a game in casion, refresh token every 30 minutes
    let time = 30 * 60 * 24 * 1000;
    if (!casinoGameTimer) {
        casinoGameTimer = setInterval(() => {
            let {access_token} = jwtService.getAccessToken();
            jwtService.refreshToken(access_token);
            let now = new Date();
            sessionStorage.setItem('last_request_date', now);
        }, time);
    }

    return (dispatch) => {
        dispatch({type: Actions.SET_GAME_DATA, data});
    };
};

// Get live game data
export const getLiveGameData = (game, history) => {
    return (dispatch, getState) => {
        dispatch(setLoading(true));
        casinoService
            .getLiveCasinoGameData(game)
            .then((data) => {
                dispatch(setLiveGameData(data));
                sessionStorage.setItem('casino_url', data.url);
                window.location.href = data.url;
                dispatch(setLoading(false));
            })

            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else if (error.response.status && error.response.status === 403) {
                    if (history.location.pathname !== 'live-casino') {
                        if (isMobileOnly) history.push('/live-casino');
                        else history.push('/d/live-casino');
                    }
                    toastr.error('', 'The casino is disabled for you. Please contact your agent!');
                } else if (error.response.status && error.response.status === 503) {
                    toastr.error('', 'Server Timed out.');
                } else {
                    toastr.error('', 'Something went wrong.');
                }
                dispatch(setLoading(false));
            });
    };
};

// Get live game data
export const getpCasinoGameData = (game, history) => {
  return (dispatch, getState) => {
     let language = getState().general.language;
     let country = getState().general.country;
     let userData = getState().user.data;
     let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';
      dispatch(setLoading(true));
      casinoService
          .getpGameData(game, language, country, currency,history)
          .then((data) => {
            
              dispatch(setLiveGameData(data));
              sessionStorage.setItem('casino_url', data.url);
              window.location.href = data.url;
              dispatch(setLoading(false));
          })
          .catch((error) => {
              console.error(error);
              if (error && error.response && error.response.status && error.response.status === 401) {
                  Util.handleRepeatedLogin(error.response);
              } else if (error.response.status && error.response.status === 403) {
                  if (history.location.pathname !== 'p-casino') {
                      if (isMobileOnly) history.push('/p-casino');
                      else history.push('/d/p-casino');
                  }
                  toastr.error('', 'The casino is disabled for you. Please contact your agent!');
              } else if (error.response.status && error.response.status === 503) {
                  toastr.error('', 'Server Timed out.');
              } else {
                  toastr.error('', 'Something went wrong.');
              }
              dispatch(setLoading(false));
          });
  };
};


// export const geSlotGameData = (id, history) => {
//   debugger;
//     return (dispatch, getState) => {
//         let hash = getState().user.data.user_hash;
//         dispatch(setLoading(true));
//         casinoService
//             .getLiveGameData(id, hash)
//             .then((data) => {
//                 dispatch(setLiveGameData(data));
//                 sessionStorage.setItem('casino_url', data.url);
//                 window.location.href = data.url;
//                 dispatch(setLoading(false));
//             })
//             .catch((error) => {
//                 console.error(error);
//                 if (error && error.response && error.response.status && error.response.status === 401) {
//                     Util.handleRepeatedLogin(error.response);
//                 } else if (error.response.status && error.response.status === 403) {
//                     if (history.location.pathname !== '/casino') {
//                         history.push('/casino');
//                     }
//                     toastr.error('', 'The casino is disabled for you. Please contact your agent!');
//                 } else if (error.response.status && error.response.status === 503) {
//                     toastr.error('', 'Server Timed out.');
//                 } else {
//                     toastr.error('', 'Something went wrong.');
//                 }
//                 dispatch(setLoading(false));
//             });
//     };
// };

// Set live game data
export const setLiveGameData = (data) => {
    // If user is playing a game in casion, refresh token every 30 minutes
    let time = 30 * 60 * 1000;
    if (!casinoGameTimer) {
        casinoGameTimer = setInterval(() => {
            let {access_token} = jwtService.getAccessToken();
            jwtService.refreshToken(access_token);
            let now = new Date();
            sessionStorage.setItem('last_request_date', now);
        }, time);
    }

    return (dispatch) => {
        dispatch({type: Actions.SET_LIVE_GAME_DATA, data});
    };
};

// Clear casino games
export const clearCasinoGames = () => {
    return (dispatch) => {
        dispatch({type: Actions.CLEAR_CASINO_GAMES});
    };
};

// Clear live casino games
export const clearLiveCasinoGames = () => {
    return (dispatch) => {
        dispatch({type: Actions.CLEAR_LIVE_CASINO_GAMES});
    };
};


//Getting Virtual sports
export const getVirtualSports = () => {
    return (dispatch) => {
        casinoService
            .getVirtualSports()
            .then((sports) => {
                dispatch(setVirtualSports(sports));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

export const postHeartBeat = () => {
    return (dispatch) => {
        jwtService
            .postHeartBeat()
            .then(() => {
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// Get live game data
export const getVirtualSportsData = (game, history) => {
    return (dispatch, getState) => {
        dispatch(setLoading(true));
        casinoService
            .getLiveCasinoGameData(game)
            .then((data) => {
                dispatch(setLiveGameData(data));
                sessionStorage.setItem('casino_url', data.url);
                window.location.href = data.url;
                dispatch(setLoading(false));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else if (error.response.status && error.response.status === 403) {
                    if (history.location.pathname !== 'virtual-sports') {
                        if (isMobileOnly) history.push('/virtual-sports');
                        else history.push('/d/virtual-sports');
                    }
                    toastr.error('', 'The virtual sport is disabled for you. Please contact your agent!');
                } else if (error.response.status && error.response.status === 503) {
                    toastr.error('', 'Server Timed out.');
                } else {
                    toastr.error('', 'Something went wrong.');
                }
                dispatch(setLoading(false));
            });
    };
};

// Set virtual sports list
export const setVirtualSports = (sports) => {
    // clearInterval(casinoGameTimer);
    return (dispatch) => {
        dispatch({type: Actions.SET_VIRTUAL_SPORTS, sports});
    };
};

//CLEAR VIRTUAL SPORTS
export const clearVirtualSports = () => {
    return (dispatch) => {
        dispatch({type: Actions.CLEAR_VIRTUAL_SPORTS});
    };
};

// Set virtual search started
export const setVirtualSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_VIRTUAL_SEARCH_STARTED, value});
    };
};

// Serach virtual sport by name
export const searchVirtualSports = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_VIRTUAL_SPORTS_SEARCH, value});
    };
};

// Set virtual sports active category
export const setVirtualSportsCategory = (category) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_VIRTUAL_SPORTS_CATEGORY, category});
    };
};


export const getLobbyURL = (type) => {
  return (dispatch) => {
      casinoService
          .getLobbyURL(type)
          .then((data) => {
            const lobbyUrl = type === 'ezugi' || type === 'evo'? data : data.url;

              dispatch(setCasinoLobby(lobbyUrl));
          })
          .catch((error) => {
              console.error(error);
              if (error && error.response && error.response.status && error.response.status === 401) {
                  Util.handleRepeatedLogin(error.response);
              } else {
                  toastr.error('', 'Something went wrong.');
              }
          });
  };
};


export const setCasinoLobby = (url) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_CASINO_LOBBY, url});
    };
};

export const initGgSlotUser = () => {
    return (dispatch) => {
        dispatch(setLoadingGgSlot(true));
        casinoService.initGgSlotUser().then((res) => {
            casinoService.ggSlotURL(lobby_id).then((data) => {
                dispatch(setLoadingGgSlot(false));
                //  window.location.href = data;
            });
        }).catch((error) => {
            console.error(error);
            if (error && error.response && error.response.status && error.response.status === 401) {
                Util.handleRepeatedLogin(error.response);
            } else {
                toastr.error('', 'Something went wrong.');
            }
        });

    };
};

export const setLoadingGgSlot = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_LOADING_SLOT, value});
    };
};

// Get live casino games list
export const getNewCasinoGames = () => {
    return (dispatch) => {
        casinoService
            .getNewCasinoGames()
            .then((games) => {
                dispatch(setNewCasinoGames(games));
            })
            .catch((error) => {
                console.error('error');
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    toastr.error('', 'Something went wrong.');
                }
            });
    };
};

// Set new casino games list
export const setNewCasinoGames = (games) => {
    clearInterval(casinoGameTimer);
    console.log(games);
    return (dispatch) => {
        dispatch({type: Actions.SET_NEW_CASINO_GAMES, games});
    };
};

// Set live casino active category
export const setNewCasinoActiveCategory = (category) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_NEW_CASINO_ACTIVE_CATEGORY, category});
    };
};

// Set live search started
export const setNewSearchStarted = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_NEW_CASINO_SEARCH_STARTED, value});
    };
};

// Serach live game by name
export const searchNewCasino = (value) => {
    return (dispatch) => {
        dispatch({type: Actions.SET_NEW_CASINO_SEARCH, value});
    };
};

// Get live game data
export const getNewGameData = (game, history) => {
    return (dispatch, getState) => {
        dispatch(setLoading(true));
        casinoService
            .getNewCasinoGameData(game)
            .then((data) => {
                dispatch(setNewGameData(data));
                sessionStorage.setItem('casino_url', data.url);
                window.location.href = data.url;
                dispatch(setLoading(false));
            })
            .catch((error) => {
                console.error(error);
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else if (error.response.status && error.response.status === 403) {
                    if (history.location.pathname !== 'live-casino') {
                        if (isMobileOnly) history.push('/live-casino');
                        else history.push('/d/live-casino');
                    }
                    toastr.error('', 'The casino is disabled for you. Please contact your agent!');
                } else if (error.response.status && error.response.status === 503) {
                    toastr.error('', 'Server Timed out.');
                } else {
                    toastr.error('', 'Something went wrong.');
                }
                dispatch(setLoading(false));
            });
    };
};

// Set live game data
export const setNewGameData = (data) => {
    // If user is playing a game in casion, refresh token every 30 minutes
    let time = 30 * 60 * 1000;
    if (!casinoGameTimer) {
        casinoGameTimer = setInterval(() => {
            let {access_token} = jwtService.getAccessToken();
            jwtService.refreshToken(access_token);
            let now = new Date();
            sessionStorage.setItem('last_request_date', now);
        }, time);
    }

    return (dispatch) => {
        dispatch({type: Actions.SET_NEW_GAME_DATA, data});
    };
};

// Clear live casino games
export const clearNewCasinoGames = () => {
    return (dispatch) => {
        dispatch({type: Actions.CLEAR_NEW_CASINO_GAMES});
    };
};
