import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Translate } from '../../localization';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import LoadingIcon from '../Common/LoadingIcon';
import { setLoginError, submitLogin } from '../../store/actions/user.actions';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputUsername: '',
            inputPassword: '',
            checked: true,
            usernameError: false,
            passwordError: false,
            loginLoading: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.userData !== null) {
            this.props.hideLogin();
            this.props.setLoginError('');
        }

        if (prevState.inputUsername !== this.state.inputUsername) {
            this.props.setLoginError('');

            if (!this.state.inputUsername) {
                this.setState({ usernameError: true });
            } else {
                this.setState({ usernameError: false });
            }
        }

        if (prevState.inputPassword !== this.state.inputPassword) {
            this.props.setLoginError('');

            if (!this.state.inputPassword) {
                this.setState({ passwordError: true });
            } else {
                this.setState({ passwordError: false });
            }
        }
    }

    componentWillUnmount() {
        this.props.setLoginError('');
    }

    stayLoggedIn = (e) => {
        this.setState({ checked: e.target.checked });
    };

    handleSubmit = (e) => {
        if (!this.state.usernameError && !this.state.passwordError) {
            if (this.state.inputUsername.length > 0 && this.state.inputPassword.length > 0) {
                this.setState({ loginLoading: true });
                this.props.submitLogin(this.state.inputUsername, this.state.inputPassword, this.state.checked);
            } else {
                if (this.state.inputUsername.length === 0) {
                    this.setState({
                        usernameError: true,
                    });
                }
                if (this.state.inputPassword.length === 0) {
                    this.setState({
                        passwordError: true,
                    });
                }
            }
        }
    };

    handleChange = (e) => {
        this.setState({
            ...this.state,
            [e.target.id]: e.target.value,
            loginLoading: false,
        });
    };

    render() {
        let { loginError, userData } = this.props;
        let show = userData === null;
        let { checked, usernameError, passwordError, loginLoading } = this.state;

        return (
            <Dialog onClose={this.props.hideLogin} aria-labelledby="login-dialog-title" open={show} className="auth__modal login-modal" scroll="body">
                <DialogTitle id="login-dialog-title" disableTypography>
                    <div className="dialog-logo-wrap">
                        <img src="/images/logo.png" alt="Logo" />
                    </div>
                    <IconButton aria-label="close" className="close-modal" onClick={this.props.hideLogin}>
                        <i className="material-icons text-white fs-22"> close </i>
                    </IconButton>
                </DialogTitle>
                <DialogContent className="pt-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            this.handleSubmit();
                        }}
                    >
                        <div className={`mt-1 dd ${usernameError ? 'auth__error-field' : ''}`}>
                            <input
                                type="text"
                                autoFocus
                                className="auth__input"
                                placeholder={Translate.username}
                                id="inputUsername"
                                onChange={this.handleChange}
                                autoComplete="username"
                            />
                            {usernameError && <p className="auth__error sm">This field is required</p>}
                        </div>
                        <div className={`mt-2 dd ${passwordError ? 'auth__error-field' : ''}`}>
                            <input
                                type="password"
                                className="auth__input"
                                placeholder={Translate.password}
                                id="inputPassword"
                                onChange={this.handleChange}
                                autoComplete="current-password"
                            />
                            {passwordError && <p className="auth__error sm">This field is required</p>}
                        </div>
                        <div className="fs-13 pt-2">
                            <label className="stay-login">
                                <input type="checkbox" checked={checked} name="remember" onChange={this.stayLoggedIn} /> {Translate.stayLoggedIn}
                            </label>
                        </div>
                        <div className="auth__btn-wrap">
                            {loginError && (
                                <p className="auth__error auth__error_with-icon md">
                                    <span className="material-icons icon mr-2 align-middle fs-22">error_outline</span>
                                    <span className="d-inline-block align-middle">{loginError}</span>
                                </p>
                            )}

                            <Button
                                variant="contained"
                                className="auth__btn d-flex justify-content-center align-items-center"
                                type="submit"
                                disabled={loginLoading && !loginError}
                            >
                                {Translate.login}
                                {loginLoading && !loginError && <LoadingIcon />}
                            </Button>
                            {/* <Button variant="contained" className="auth__btn sm d-flex justify-content-center align-items-center mt-2" type="button">
                                {Translate.signup}
                            </Button> */}
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        );
    }
}

Login.propTypes = {
    userData: PropTypes.object,
    setLoginError: PropTypes.func,
    loginError: PropTypes.string,
    submitLogin: PropTypes.func,
    hideLogin: PropTypes.func,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        loginError: state.user.loginError,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setLoginError: (error) => dispatch(setLoginError(error)),
        submitLogin: (username, password, rememberMe) => dispatch(submitLogin(username, password, rememberMe)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
