import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { format, differenceInMinutes } from 'date-fns';
import { apiConfig } from '../config';
import EventEmitter from '../helper/EventEmitter';
import Util from '../helper/Util';

const CancelToken = axios.CancelToken;
let cancel;

class jwtService extends EventEmitter {
    init() {
        this.setInterceptors();
        this.handleAuthentication();
    }

    setInterceptors = () => {
        axios.interceptors.response.use(
            (response) => {
                let { access_token } = this.getAccessToken();
                let { refresh_token } = this.getAccessToken();
                if (access_token) {
                    let last_request_date = sessionStorage.getItem('last_request_date');

                    if (last_request_date) {
                        let now = new Date();
                        let old_date = new Date(last_request_date);
                        // Increase the refresh interval from 5 min to 60 min to 24 hrs

                        if (differenceInMinutes(now, old_date) >= 60 * 24) {
                            this.refreshToken(refresh_token);
                        }
                        sessionStorage.setItem('last_request_date', now);
                    } else {
                        let now = new Date();
                        sessionStorage.setItem('last_request_date', now);
                    }
                }

                return response;
            },
            (err) => {
                return new Promise((resolve, reject) => {
                    if (err.response && err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
                        // if you ever get an unauthorized response, logout the user
                        this.emit('onAutoLogout', 'Invalid access_token');
                        this.setSession(null);
                        Util.handleRepeatedLogin(err.response);
                    }
                    throw err;
                });
            },
        );
    };

    refreshToken = (refresh_token) => {
        return new Promise((resolve, reject) => {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + refresh_token;
            axios
                .post(apiConfig.routes.refreshToken)
                .then((response) => {
                    let token = response.data && response.data.access_token;
                    if (token) {
                        if (localStorage.getItem('jwt_access_token')) {
                            localStorage.setItem('jwt_access_token', token);
                        } else {
                            sessionStorage.setItem('jwt_access_token', token);
                        }
                        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                        resolve();
                    } else {
                        reject(response.data.error);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    handleAuthentication = () => {
        let { access_token } = this.getAccessToken();
        if (!access_token) {
            this.emit('onNoAccessToken');
            return;
        }

        if (this.isAuthTokenValid(access_token)) {
            this.setSession(access_token);
            this.emit('onAutoLogin', true);
        } else {
            this.setSession(null);
            this.emit('onAutoLogout', 'access_token expired');
        }
    };


    postHeartBeat = () => {
        return new Promise((resolve, reject) => {
              axios
                  .post(apiConfig.routes.hearbeat, {
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
 
    signup = (userData,language) => {
        let {
            username, phone_number, password, confirm_password,
            agent_code, country_code
        } = userData;
        return new Promise((resolve, reject) => {
            axios
                .post(apiConfig.routes.signup, {
                    unique_id: process.env.REACT_APP_UNIQUE_ID,
                    username,
                    phone_number,
                    password,
                    confirm_password,
                    // currency,
                    // bank_acc_number,
                    // bank_acc_name,
                    agent_code,
                    country_code,
                    language
                })
                .then((response) => {
                    let user = response.data;
                    if (user) {
                        resolve(user);
                    } else {
                        reject(response.data.error);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };


    signInWithUsernameAndPassword = (username, password, language) => {
        return new Promise((resolve, reject) => {
            axios
                .post(apiConfig.routes.login, {
                    username,
                    password,
                    unique_id: process.env.REACT_APP_UNIQUE_ID,
                    language
                })
                .then((response) => {
                    let user = response.data;
                    if (user) {
                        this.setSession(user.access_token, user.refresh_token);
                        resolve(user);
                    } else {
                        reject(response.data.error);
                    }
                })
                .catch((error) => {
                    this.logout();
                    reject(error);
                });
        });
    };

    changeUserPassword = (oldPassword, newPassword, language) => {
        return new Promise((resolve, reject) => {
            axios
                .put(apiConfig.routes.changePassword, {
                    old_password: oldPassword,
                    new_password: newPassword,
                    language
                },{params:{unique_id: process.env.REACT_APP_UNIQUE_ID}})
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    deposit = (amount) => {
        return new Promise((resolve, reject) => {
            axios
                .post(`${apiConfig.routes.deposit}`, { amount })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    
    getUser = (language) => {
        return new Promise((resolve, reject) => {
            axios
                .get(`${apiConfig.routes.user}`, {
                    params: {
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                        timestamp: new Date().getTime(),
                        language
                    },
                })
                .then((response) => {
                    let user = response.data;

                    if (user) {
                        resolve(user);
                    } else {
                        reject(response.data.error);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getBanners = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(`${apiConfig.routes.getBanner}`, {
                    params: {
                        project_id: process.env.REACT_APP_UNIQUE_ID,
                    },
                })
                .then((response) => {
                    let banners = response.data;

                    if (banners) {
                        resolve(banners);
                    } else {
                        reject(response.data.error);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getMatchBanners = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(`${apiConfig.routes.getMatchBanner}`, {
                    params: {
                        project_id: process.env.REACT_APP_UNIQUE_ID,
                    },
                })
                .then((response) => {
                    let banners = response.data;

                    if (banners) {
                        resolve(banners);
                    } else {
                        reject(response.data.error);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    setSession = (access_token, refresh_token, rememberMe) => {
        if (access_token) {
            if (rememberMe) {
                localStorage.setItem('refresh_token',refresh_token);
                localStorage.setItem('jwt_access_token', access_token);
            } else {
                sessionStorage.setItem('refresh_token',refresh_token);
                sessionStorage.setItem('jwt_access_token', access_token);
            }
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
        } else {
            localStorage.removeItem('jwt_access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('jwt_access_token');
            sessionStorage.removeItem('refresh_token');
            sessionStorage.removeItem('last_request_date');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    logout = () => {
        this.setSession(null);
    };

    isAuthTokenValid = (access_token) => {
        if (!access_token) {
            return false;
        }
        const decoded = jwtDecode(access_token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.warn('access token expired');
            return false;
        } else {
            return true;
        }
    };

    getAccessToken = () => {
        let access_token = window.localStorage.getItem('jwt_access_token')
            ? window.localStorage.getItem('jwt_access_token')
            : window.sessionStorage.getItem('jwt_access_token');

        let refresh_token = window.localStorage.getItem('refresh_token')
            ? window.localStorage.getItem('refresh_token')
            : window.sessionStorage.getItem('refresh_token');

        let rememberMeChecked = window.localStorage.getItem('jwt_access_token') ? true : false;

        return { refresh_token, access_token, rememberMeChecked };
    };

    getPrematches = (sportId) => {
        const url = `${ apiConfig.routes.getPrematchCount }/${ sportId }`;
        return new Promise((resolve, reject) => {
            axios
                .get(url, {
                    headers: {
                        'X-Api-Key': process.env.REACT_APP_PREMATCHES_API_KEY,
                    },
                })
                .then((response) => {
                    resolve(response.data.body);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    placeBet = (data, language) => {
        return new Promise((resolve, reject) => {
            axios
                .post(apiConfig.routes.placeBet, data, {params:{unique_id: process.env.REACT_APP_UNIQUE_ID,language}})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    placeLiveBet = (data, language) => {
        return new Promise((resolve, reject) => {
            axios
                .put(apiConfig.routes.placeLiveBet, data, {params:{unique_id: process.env.REACT_APP_UNIQUE_ID,language}})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    getBetLimits = (language) => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getBetLimits, {
                    params:{
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                        language
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

    getBetslips = (betslip_status, page, params,language) => {
        cancel && cancel('canceled'); // if request is already pending cancel the earlier 
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getBetslips, {
                    params: {
                        bet_slip_status: betslip_status, 
                        page: page,
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                        params,
                        language
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

    getSingleBetslip = (betslip_id, language) => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getSingleBetslip, {
                    params: {
                        betslip_id: betslip_id,
                        language: language,
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
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

    getLastBetslip = (betslip_id, language) => {
        return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.getLastBetslip, {
                    params: {
                        betslip_id: betslip_id,
                        language: language,
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
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

    getTransactions = (tab, params, page, language) => {
        let from_date = params.dateFrom !== null ? format(params.dateFrom, 'yyyy-MM-dd') : '';
        let to_date = params.dateTo !== null ? format(params.dateTo, 'yyyy-MM-dd') : '';
        let base_url = '';
        let timezone_offset;
        if (from_date) {
            timezone_offset = params.dateFrom.getTimezoneOffset() / (-60);
        }
        if(tab === 'sports book') {
            base_url = apiConfig.routes.getTransactions;
        } 
        else if(tab === 'casino') {
            base_url = apiConfig.routes.getCasinoTransactions;
        }
        else if(tab === 'live casino') {
            base_url = apiConfig.routes.getLiveCasinoTransactions;
        }
        else if(tab === 'GG-Slot casino') {
          base_url = apiConfig.routes.getGgSlotTransactions;
      }
      else if(tab === 'evo casino') {
        base_url = apiConfig.routes.getEvoCasinoTransactions;
      }
      else if(tab === 'bonus') {
        base_url = apiConfig.routes.bonusTransactions;
      }
        else if(tab === 'pcasino') {
            base_url = apiConfig.routes.getPcasinoTransactions;
        }
        
        return new Promise((resolve, reject) => {
            axios
                .get(base_url, {
                    params: {
                        from_date: from_date,
                        to_date: to_date,
                        activity_type: params.activityType === 'all' ? '' : params.activityType,
                        page: page,
                        timezone_offset,
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                        language
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

    getCashoutData = ( betslip_id, total_odds, stake_price) => {
        return new Promise((resolve, reject) => {
            axios
                .post(
                    apiConfig.routes.getCashoutData,
                    {
                        betslip_id: `${betslip_id}`,
                        stake_price: stake_price,
                    },
                    { params: { unique_id: process.env.REACT_APP_UNIQUE_ID } },
                )
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    processCashout = ( betslip_id, cashout_amount) => {
        return new Promise((resolve, reject) => {
            axios
                .post(
                    apiConfig.routes.processCashout,
                    {
                        betslip_id: betslip_id,
                        cashout_amount: cashout_amount,
                    },
                    {
                        params: {
                            unique_id: process.env.REACT_APP_UNIQUE_ID,
                        },
                    },
                )
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getLiveStreamData = () => {
        return new Promise((resolve, reject) => {
            axios.get(apiConfig.routes.getLiveStreamData)
            .then(response => {
                //console.log(response);
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
    
    getCashbackData = (userId) => {
        return new Promise((resolve, reject) => {
            axios.get(apiConfig.routes.cashback, {
                params: {
                    user_id: userId
                }    
            })
            .then(response => {
                // console.log(response);
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    setCashback = (userId) => {
        return new Promise((resolve, reject) => {
            axios.post(apiConfig.routes.cashback, {
                    user_id: userId
            })
            .then(response => {
                //console.log(response);
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
 }


const instance = new jwtService();

export default instance;
