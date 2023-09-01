import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Translate } from '../../localization';
import LoadingIcon from '../../Components/Common/LoadingIcon';
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
            usernameError: null,
            passwordError: null,
        });
    };

    render() {
        let { loginError } = this.props;
        let { usernameError, passwordError, loginLoading } = this.state;

        return (
            <React.Fragment>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        this.handleSubmit();
                    }}
                    className='d-flex'                  
                >
                <div className='input-group'>
                    {usernameError && !passwordError && <p className="auth__error sm mx-2 mt-2">Username is required.</p>}
                    {passwordError && !usernameError && <p className="auth__error sm mx-2 mt-2">Password is required.</p>}
                    {usernameError && passwordError && <p className="auth__error sm mx-2 mt-2">Fields are required.</p> }                   
                    <input
                        type="text"
                        placeholder={Translate.username}
                        id="inputUsername"
                        onChange={this.handleChange}
                        autoComplete="username"
                    />
                    <input
                        type="password"
                        placeholder={Translate.password}
                        id="inputPassword"
                        onChange={this.handleChange}
                        autoComplete="current-password"
                    />
                    {loginError && (
                        <div className='login-err-msg'>
                        <p className="auth__error sm mx-2 mt-2">{loginError}</p>
                        </div>
                    )}
                </div>
                <div className="btn-group">
                    <button
                        onClick={(e) => {
                          e.preventDefault();
                          this.handleSubmit();
                      }}
                    >
                        {loginLoading && !loginError ? <LoadingIcon /> : Translate.login}
                    </button>
                </div>
                </form>

            </React.Fragment>
        );
    }
}

Login.propTypes = {
    userData: PropTypes.object,
    setLoginError: PropTypes.func,
    loginError: PropTypes.string,
    submitLogin: PropTypes.func,
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
