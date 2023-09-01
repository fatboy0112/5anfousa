import { differenceInMinutes } from 'date-fns';
import { toastr } from 'react-redux-toastr';
import { dynamoClient } from '../../App';
import { JackpotData } from '../../dynamo/params';
import Util from '../../helper/Util';
import jwtService from '../../services/jwtService';
import * as Actions from './actionTypes';
import { getFavorites } from './favorites.actions';

//Register user
export const submitSignUp = (obj) => {
    return (dispatch, getState) => {
        let language = getState().general.language;
        let userData = {
            username: obj.inputUsername,
            phone_number: obj.inputPhoneNo,
            password: obj.inputPassword,
            confirm_password: obj.inputConfirmPassword,
            currency: obj.currencyName,
            bank_acc_name: obj.bankAccountName,
            bank_acc_number: obj.bankAccountNo,
            agent_code: obj.agentCode,
            country_code: obj.code
        }
        jwtService
            .signup(userData,language)
            .then((user) => {
                toastr.success('','Sign Up SuccessFull')
                 dispatch(submitLogin(obj.inputUsername, obj.inputPassword));
            })
            .catch((error) => {
                // if (error.response && error.response.status === 400) {
                //     Object.values(error.response.data).map((err, index) => (
                //         toastr.error('', err[0])
                //     ));
                //     dispatch({ type: Actions.SIGNUP_ERROR, signupError: 'Validation error' });
                //     setTimeout(() => {
                //         dispatch({ type: Actions.SIGNUP_ERROR, signupError: '' });
                //     }, 1000);
                // }
                toastr.error('', error.response.data.message);
                dispatch({ type: Actions.SIGNUP_ERROR, signupError: 'Validation error' });
                setTimeout(() => {
                          dispatch({ type: Actions.SIGNUP_ERROR, signupError: '' });
                    }, 1000);
            });
    };
};

// Login user
export const submitLogin = (username, password ) => {
    return (dispatch,getState) => {
        let language = getState().general.language; 
        jwtService
            .signInWithUsernameAndPassword(username, password ,language)
            .then((user) => {
                localStorage.setItem('user_id', user.pk);
                jwtService.getUser(language).then((user) => {
                    dispatch({ type: Actions.SET_USER, user });
                    dispatch(getFavorites());
                });

                return dispatch({ type: Actions.LOGIN_SUCCESS });
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    dispatch(setLoginError(error.response.data?.non_field_errors && error.response.data?.non_field_errors[0]));
                } else if (error.response && error.response.status === 404) {
                    dispatch(setLoginError(error.response.data.detail));
                }
            });
    };
};

// Set login error
export const setLoginError = (error) => {
    return (dispatch) => {
        dispatch({
            type: Actions.LOGIN_ERROR,
            loginError: error,
        });
    };
};

// Change user password
export const changePassword = (oldPassword, newPassword) => {
    return (dispatch ,getState) => {
         let language = getState().general.language; 
        jwtService
            .changeUserPassword(oldPassword, newPassword ,language)
            .then((response) => {
                dispatch(setChangePasswordSuccess(true));
                toastr.success('', 'Password was changed successfully!');
            })
            .catch((error) => {
                if (error && error.response && error.response.status && error.response.status === 401) {
                    Util.handleRepeatedLogin(error.response);
                } else {
                    dispatch(setChangePasswordError(error.response.data.detail));
                }
            });
    };
};

//Deposit
export const depositAmount = (amount) => {
    return (dispatch) => {
        jwtService
            .deposit(amount)
            .then(({ qrCode: qr_code }) => {
                dispatch({ type: Actions.DEPOSIT_AMOUNT, qr_code, error: null });
            })
            .catch((error) => {
                dispatch({ type: Actions.DEPOSIT_AMOUNT, qr_code: null, error });
            });
    };
};

export const resetDepositAmount = () => {
    return (dispatch) => {
        dispatch({ type: Actions.RESET_DEPOSIT_AMOUNT });
    };
};

// Set change password success
export const setChangePasswordSuccess = (value) => {
    return (dispatch) => {
        dispatch({ type: Actions.CHANGE_PASSWORD_SUCCESS, value });
    };
};

// Set change password error
export const setChangePasswordError = (error) => {
    return (dispatch) => {
        dispatch({ type: Actions.CHANGE_PASSWORD_ERROR, error });
    };
};

// Logout user
export const logoutUser = () => {
    return (dispatch) => {
        jwtService.logout();
        dispatch({ type: Actions.SET_FAVORITES, events: []});
        dispatch({type: Actions.SET_FAVORITES_LIVE, events: []});
        dispatch({ type: Actions.LOGOUT_USER });
    };
};

// Set user object data
export const setUser = (user) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_USER, user });
    };
};

// Get user object data
export const getUser = () => {
    return (dispatch , getState) => {
          let language = getState().general.language; 
        jwtService.getUser(language).then((user) => {
            dispatch(setUser(user));
        });
    };
};

export const getCashbackData = () => {
    return (dispatch) => {
        const userId = localStorage.getItem('user_id');
        jwtService.getCashbackData(userId).then((response) => {
            dispatch(setCashback(response));
        });
    };
};

export const setCashback = (data) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_CASHBACK_DATA , data });
    };
};

export const getCashbackSucess = () => {
    return (dispatch) => {
        const userId = localStorage.getItem('user_id');
        jwtService.setCashback(parseInt(userId)).then((response) => {
            dispatch(setCashbackSucess(response));

        })
        .catch((error) => {
            console.error(error);
        });

    };
};

export const setCashbackSucess = (data) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_CASHBACK_SUCESS , data });
        toastr.success('', data.message);
        dispatch(getUser());
    };
};

export const setOddType = (oddType) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_ODD_TYPE , oddType });
    };
};

export const getJackPot = () => {
    return (dispatch, getState) => {
        setTimeout(()=>{
              dynamoClient.query(JackpotData(), (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(result)
                    let time = result?.Items[0]?.Jackpot_time;
                    let username = result?.Items[0]?.username;
                    let amount = result?.Items[0]?.jackpot_amount;
                    let currentTimeDiff = differenceInMinutes(new Date(), new Date(time));
                    if(time && currentTimeDiff < 40 && username){
                        dispatch({ type: Actions.SET_JACKPOT_ERROR, msg: 'success' ,name:username,amount:amount});
                        dispatch(getUser());
                    } else{
                        dispatch(getUser());
                        toastr.error("",'No jackpot Won');
                        dispatch({ type: Actions.SET_JACKPOT_ERROR, msg: 'No jackpot Won' ,name:'',amount:0});
                    }
                }
          });
         },120000)     //hit after 2 min
    }    
};
