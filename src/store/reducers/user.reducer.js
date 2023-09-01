import * as Actions from '../actions/actionTypes';

const initialState = {
    data: null,
    loginError: '',
    signupError: '',
    changePasswordSuccess: false,
    changePasswordError: '',
    cashbackData: null,
    qr_code: null,
    depositError: null,
    oddType: 'decimal',
     jackPotError:'',
    jackpotUserName:'',
    jackpotAmount:0
};

const userReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.LOGIN_SUCCESS: {
            return {
                ...state,
                loginError: '',
            };
        }

        case Actions.LOGIN_ERROR: {
            return {
                ...state,
                loginError: action.loginError,
            };
        }

        case Actions.SIGNUP_ERROR: {
            return {
                ...state,
                signupError: action.signupError,
            };
        }

        case Actions.CHANGE_PASSWORD_SUCCESS: {
            return {
                ...state,
                changePasswordError: '',
                changePasswordSuccess: action.value,
            };
        }

        case Actions.CHANGE_PASSWORD_ERROR: {
            return {
                ...state,
                changePasswordSuccess: false,
                changePasswordError: action.error,
            };
        }

        case Actions.DEPOSIT_AMOUNT: {
            return {
                ...state,
                qr_code: action.qr_code,
                depositError: action.error,
            };
        }

        case Actions.RESET_DEPOSIT_AMOUNT: {
            return {
                ...state,
                qr_code: null,
                depositError: null,
            };
        }

        case Actions.SET_USER: {
            return {
                ...state,
                data: action.user,
            };
        }

        case Actions.LOGOUT_USER: {
            return {
                ...state,
                data: initialState.data,
            };
        }

        case Actions.SET_CASHBACK_DATA: {
            return {
                ...state,
                cashbackData: action.data,
            };
        }

        case Actions.SET_CASHBACK_SUCESS: {
            return {
                ...state,
                cashbackData: null,
            };
        }

        case Actions.SET_ODD_TYPE: {
            return {
                ...state,
                oddType: action.oddType,
            };
        }

         case Actions.SET_JACKPOT_ERROR: {
            return {
                ...state,
                jackPotError: action.msg,
                jackpotUserName:action.name,
                jackpotAmount:action.amount
            };
        }
        
        default:
            return state;
    }
};

export default userReducer;
