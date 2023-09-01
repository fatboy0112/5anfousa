import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Translate } from '../../localization';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import LoadingIcon from '../../Components/Common/LoadingIcon';
import { submitSignUp } from '../../store/actions/user.actions';
import { validation } from '../../Desktop/SignUp/validation';
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { agentCode } from '../../config';

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputUsername: '',
            inputPassword: '',
            inputPhoneNo: '',
            inputConfirmPassword: '',
            currencyName: 'EUR',
            bankAccountNo: '',
            bankAccountName: 'HANA BANK',
            agentCode: agentCode,
            code: '',
            checked: true,
            checkedError: false,
            usernameError: false,
            passwordError: false,
            confirmPasswordError: false,
            misMatchError: false,
            bankAccountNoError: false,
            agentCodeError: false,
            loading: false,
            phonenoError: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.signupError !== this.props.signupError) {
            this.setState({ ...this.state, loading: false })
        }
        if (prevState.inputUsername !== this.state.inputUsername) {

            if (!this.state.inputUsername) {
                this.setState({ usernameError: true });
            } else if (this.state.inputUsername.length < validation.userName.min_length || this.state.inputUsername.length > validation.userName.max_length) {
                 this.setState({ usernameError: true });
            } else{
                this.setState({ usernameError: false });
            }
        }

        if (prevState.inputPassword !== this.state.inputPassword) {

            if (!this.state.inputPassword) {
                this.setState({ passwordError: true });
            } else if (this.state.inputPassword.length < validation.passWord.min_length || this.state.inputPassword.length>validation.passWord.max_length) {
                this.setState({ passwordError: true });
            } else {
                this.setState({ passwordError: false });
            }
        }

        if (prevState.inputConfirmPassword !== this.state.inputConfirmPassword) {

            if (!this.state.inputConfirmPassword) {
                this.setState({ confirmPasswordError: true });
            } else {
                this.setState({ confirmPasswordError: false });
            }
        }
        if (prevState.inputConfirmPassword !== this.state.inputConfirmPassword) {

            if (this.state.inputPassword !== this.state.inputConfirmPassword) {
                this.setState({ misMatchError: true });
            } else {
                this.setState({ misMatchError: false });
            }
        }
        //  if (prevState.inputPhoneNo !== this.state.inputPhoneNo) {

        //     if (this.state.inputPhoneNo !== this.state.inputPhoneNo) {
        //         this.setState({ phonenoError: true });
        //     } else  if (this.state.inputPhoneNo.length != validation.PhoneNo.length) {
        //         this.setState({ phonenoError: true });
        //     } else {
        //           this.setState({ phonenoError: false });
        //     }
        // }
        if (prevState.bankAccountNo !== this.state.bankAccountNo) {

            if (!this.state.bankAccountNo) {
                this.setState({ bankAccountNoError: true });
            } else {
                this.setState({ bankAccountNoError: false });
            }
        }
        if (prevState.agentCode !== this.state.agentCode) {

            if (!this.state.agentCode) {
                this.setState({ agentCodeError: true });
            } else {
                this.setState({ agentCodeError: false });
            }
        }
        if (prevState.checked !== this.state.checked) {

            if (!this.state.checked) {
                this.setState({ checkedError: true });
            } else {
                this.setState({ checkedError: false });
            }
        }

   }
   
    handleSubmit = () => {
        const { inputUsername, inputPassword, inputConfirmPassword, inputPhoneNo, bankAccountNo ,  agentCode,currencyName,bankAccountName,code} = this.state 
        let check = true;
        if(inputUsername.length < validation.userName.min_length || inputUsername.length > validation.userName.max_length ) {
            check = false;
            this.setState({
                     usernameError: true,
                 });
        } 
          
         if(inputPassword.length < validation.passWord.min_length || inputPassword.length > validation.passWord.max_length) {
             check = false;
             this.setState({
                   passwordError : true,
                 });
        }  
         if(inputConfirmPassword.length < validation.passWord.min_length || inputConfirmPassword.length > validation.passWord.max_length) {
             check = false;
             this.setState({
                   confirmPasswordError : true,
                 });
        }  
         if (inputPassword !== inputConfirmPassword) {
             check = false;
                 this.setState({
                     misMatchError: true,
                 });
        }    
        // if(bankAccountNo.length === 0) {
        //     check = false;
        //     this.setState({
        //         bankAccountNoError: true,
        //     })
        // }  
        
        if(!this.state.checked){
            check = false;
            this.setState({checkedError: true})
        }
         if (check)
             {
               this.setState({ ...this.state, loading: true }); 
               const obj = {inputUsername, inputPhoneNo, inputPassword, inputConfirmPassword, currencyName, bankAccountNo,bankAccountName,code, agentCode}
                this.props.submitSignUp(obj)
             } 
    
    };

    handleChange = (e) => {
        this.setState({
            ...this.state,
            [e.target.id]: e.target.value,
            loading: false,
        });
    };

    handlePhone = (value , data) => {
     this.setState({inputPhoneNo:value.slice(data.dialCode.length)});
     this.setState({code:data.dialCode})
    }

    handleToggle = (e) => {
       if(this.state.checked){
           this.setState({checked:false})
       }else{
           this.setState({checked:true})
       }
    }
    render() {
        let { userData } = this.props;
        let show = userData === null;
        
        let { usernameError, passwordError, confirmPasswordError, misMatchError, loading, phonenoError, checkedError, checked} = this.state;
        return (
            <Dialog onClose={this.props.hideSignUp} aria-labelledby="login-dialog-title" open={show} className="auth__modal login-modal desktop-signup" scroll="body">
                <DialogTitle id="login-dialog-title" disableTypography>
                    <div className="dialog-logo-wrap">
                        <img src="/images/logo.png" alt="Logo" />
                    </div>
                    <IconButton aria-label="close" className="close-modal" onClick={this.props.hideSignUp}>
                        <i className=" material-icons fs-22"> close </i>
                    </IconButton>
                </DialogTitle>
                <DialogContent style = {{overflowX:"hidden"}}className="pt-0">
                    <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            this.handleSubmit();
                        }}
                    >
                        <div className={`mt-1 ${usernameError ? 'auth__error-field' : ''}`}>
                            <input
                                type="text"
                                autoFocus
                                className="auth__input"
                                placeholder={Translate.username}
                                id="inputUsername"
                                onChange={this.handleChange}
                                autoComplete="username"
                            />
                            {usernameError && <p className="auth__error sm">Name  Should be between 4 to 26 character</p>}
                        </div>
                        <div className={`mt-2 ${phonenoError ? 'auth__error-field' : ''}`}>
                            <PhoneInput
                                 inputProps={{
                                 name: "inputPhoneNo",
                                 required: true,
                                 }}
                                 country={'us'}
                                 inputStyle = {{color:'white', backgroundColor:'#423934', width:'100%',borderStyle:"none" ,height: "2.6vh"}}
                                 buttonClass = "button_class"
                                 containerClass = "auth__input"
                                 enableSearch
                                 onChange={(value , code) => this.handlePhone(value , code)}
                             />
                        </div>
                        <div className={`mt-2 ${passwordError ? 'auth__error-field' : ''}`}>
                            <input
                                type="password"
                                className="auth__input"
                                placeholder={Translate.password}
                                id="inputPassword"
                                onChange={this.handleChange}
                                autoComplete="current-password"
                            />
                            {passwordError && <p className="auth__error sm">Password  should be between 6 to 14 character</p>}
                        </div>
                        <div className={`mt-2 ${confirmPasswordError ? 'auth__error-field' : ''}`}>
                            <input
                                type="password"
                                className="auth__input"
                                placeholder={Translate.passwordAgain}
                                id="inputConfirmPassword"
                                onChange={this.handleChange}
                                autoComplete="current-password"
                            />
                            {confirmPasswordError ? <p className="auth__error sm">This field is required</p>
                            : misMatchError ? <p className="auth__error sm">Password did not match.</p> : null}
                        </div>
                        {/*<div className = 'mt-2'>
                             <select value = {currencyName} onChange={this.handleChange} id="currencyName" className="auth__input">
                               {currencyList}
                             </select>
                        </div>
                         <div className={`mt-2 ${bankAccountNoError ? 'auth__error-field' : ''}`}>
                            <input
                                type="text"
                                className="auth__input"
                                placeholder="Bank Account No"
                                id="bankAccountNo"
                                onChange={this.handleChange}
                               // onKeyPress={(e)=>isNaN(e.key)  ? e.preventDefault() : e.key}
                                autoComplete="bank-account-no"
                            />
                             {bankAccountNoError ? <p className="auth__error sm">This field is required</p> : null}
                        </div>
                        <div className = 'mt-2'>
                             <select value = {bankAccountName} onChange={this.handleChange} id="bankAccountName" className="auth__input">
                               {bankList}
                             </select>
                         </div> */}
                         <div className={`mt-2 ${checkedError ? 'auth__error-field' : ''}`}>
                             <input
                                type="checkbox"
                                checked = {checked}
                                onChange={this.handleToggle}
                            /> <label style = {{color:"white"}}>Please read all the <Link to ="" className = "terms_condition"> terms and condition</Link></label>
                            {checkedError ? <p className="auth__error sm">Please accept the terms and condition</p> :null}
                         </div>
                        <div className="auth__btn-wrap">
                            <Button
                                variant="contained"
                                className="auth__btn d-flex justify-content-center align-items-center"
                                type="submit"
                                disabled={loading}
                            >
                                { loading ? <LoadingIcon />:Translate.signup}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        );
    }
}

SignUp.propTypes = {
    userData: PropTypes.object,
    signupError: PropTypes.string,
    submitSignUp: PropTypes.func,
    hideSignUp: PropTypes.func,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        signupError: state.user.signupError,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        submitSignUp: (obj) => dispatch(submitSignUp(obj)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
