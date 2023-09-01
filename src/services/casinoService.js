import axios from 'axios';
import { apiConfig, CASINO_GAME_LIST_QTECH } from '../config';
import EventEmitter from '../helper/EventEmitter';
import publicIp from 'react-public-ip';

class casinoService extends EventEmitter {

    getCasinoGames = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getCasinoGames, {
                    params: {
                        game_type: 'slot',
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                    } 
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    };

    initCasinoUser = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.initCasinoUser)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    };

    getLiveCasinoGames = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getLiveCasinoGames, {
                    params: {
                        game_type: 'live-casino',
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    };

    getpCasinoGames = (lang) => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getpCasinoGames, {
                    params: {
                      language: lang,
                      unique_id: process.env.REACT_APP_UNIQUE_ID,
                    },
                })
                .then((response) => {
                  
                    resolve(response.data.Games);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    };

    getIPAddress = async () => {
        let ipAddress=await publicIp.v4()
        return ipAddress;
    };

    getpGameData = (game, language, country, currency,history) => {
      return new Promise((resolve, reject) => {
        let lobbyUrl=window.location.href;
        const  ipAddrees= this.getIPAddress();
        ipAddrees.then((ip) => {
            axios
              .post(apiConfig.routes.pcasinoAPI, {
                game_code: game.GameCode,
                currency_code: currency,
                language:language,
                player_ip:ip,
                country_name_code: country || 'TN',
                casino_lobby_url:lobbyUrl,
                platform_type: game.Vendor === 'PariplayRgs2Rgs' ? game.Platform : null,
              },{ params: {
                  unique_id:  process.env.REACT_APP_UNIQUE_ID,
              }
              })
              .then((response) => {
                  resolve(response.data);
              })
              .catch((error) => {            
                  console.error(error);
                  reject(error);
              });
        });
      });
  };

    getGameData = (name, language, country, currency) => {
        return new Promise((resolve, reject) => {
            axios
                .post(apiConfig.routes.casinoAPI, {
                    // game_id: game.id,
                    game_name:name,
                    lang: 'en',
                    // mode: 'real',
                    // device: 'mobile',
                },{ params: {
                    unique_id:  process.env.REACT_APP_UNIQUE_ID,
                }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {            
                    console.error(error);
                    reject(error);
                });
        });
    };
    
    getLiveCasinoGameData = (game) => {
        return new Promise((resolve, reject) => {
            axios
                .post(apiConfig.routes.getLiveGameData, {
                    game_id: game.id,
                    lang: `en_US`,
                    mode: 'real',
                    device: 'mobile',
                },{ params: {
                    unique_id:  process.env.REACT_APP_UNIQUE_ID,
                }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    };


    getEzugiLobbyURL = () => {
      
      return new Promise((resolve, reject) => {
          axios
              .get(apiConfig.routes.ezugiCasinoLobby, { 
                  params: {
                      unique_id:  process.env.REACT_APP_UNIQUE_ID,
                      language: 'en',
                      open_table:-1,
                  }
              })
              .then((response) => {
                  resolve(response.data);
              })
              .catch((error) => {
                  console.error(error);
                  reject(error);
              });
      });
  };

  getEvoLobbyURL = () => {
    return new Promise((resolve, reject) => {
        axios
            .get(apiConfig.routes.ezugiCasinoLobby, { 
                params: {
                    unique_id:  process.env.REACT_APP_UNIQUE_ID,
                    language: 'en',
                    open_table:1000000,
                }
            })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
};


    getVirtualSports = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getVirtualSports, {
                    params: {
                        game_type: 'virtual',
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    };

    getLobbyURL = (type) => {
      
      if (type === 'ezugi') {
        return this.getEzugiLobbyURL();
    }
    if (type === 'evo') {
      return this.getEvoLobbyURL();
    }
        const isPragmatic = type === 'pragmatic-play';
        const gameType = isPragmatic ? ['SLOT_GAMES'] : CASINO_GAME_LIST_QTECH;
      return new Promise((resolve, reject) => {
              axios
                  .post(apiConfig.routes.lobbyURL, {
                      // "playerId": 9,
                      // "unique_id": "eab42d8e-9feb-4d0e-8d78-4f26fc96e107",
                      // "displayName": "CNY",
                      // "currency": "EUR",
                      // "lang": "en_US",
                        'device': 'mobile',
                      // "mode": "real",
                      // "country": "IN",
                      'gameLaunchTarget': 'SELF',
                      'gameTypes': gameType,                   
                  }, { params: {
                      unique_id:  process.env.REACT_APP_UNIQUE_ID,
                  }
                  })
                  .then((response) => {
                      resolve(response.data);
                  })
                  .catch((error) => {
                      console.error(error);
                      reject(error);
                  });
          });
  };

  initGgSlotUser = () => {
      return new Promise((resolve, reject) => {
            axios
                .post(apiConfig.routes.initGgSlotUser, {
                },{ params: {
                    unique_id:  process.env.REACT_APP_UNIQUE_ID,
                }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
  }

  getAllGgGamesList = () => {
    return new Promise((resolve, reject) => {
          axios
              .post(apiConfig.routes.getGgAllGamesList, {
              },{ params: {
                  unique_id:  process.env.REACT_APP_UNIQUE_ID,
              }
              })
              .then((response) => {
                  resolve(response.data);
              })
              .catch((error) => {
                 
                  reject(error);
              });
      });
}

  ggSlotURL = (lobby_id) => {
      return new Promise((resolve, reject) => {
            axios
                .post(apiConfig.routes.ggSlotURL, {
                   lobby_id:lobby_id,
                },{ params: {
                    unique_id:  process.env.REACT_APP_UNIQUE_ID,
                }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
  }

    getNewCasinoGames = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getNewCasinoGames, {
                    params: {
                        game_type: 'slot',
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                    },
                })
                .then((response) => {
                    resolve(response.data.slot);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    };
    getNewCasinoGameData = (game) => {
        return new Promise((resolve, reject) => {
            axios
                .post(apiConfig.routes.getNewGameData, {
                    game_id: game.id,
                    lang: 'en_US',
                    mode: 'real',
                    device: 'mobile',
                },{ params: {
                        unique_id:  process.env.REACT_APP_UNIQUE_ID,
                    }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    };


}

const instance = new casinoService();

export default instance;
