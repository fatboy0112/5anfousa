import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import LoadingIcon from '../../Components/Common/NewLoading';
import { changePassword, setChangePasswordError } from '../../store/actions/user.actions';
import { Translate } from '../../localization';

class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputOldPassword: '',
            inputNewPassword: '',
            inputConfirmPassword: '',
            oldPasswordError: false,
            newPasswordError: false,
            confirmPasswordError: false,
            passwordMatchError: false,
            changePasswordLoading: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.changePasswordSuccess !== this.props.changePasswordSuccess) {
            this.setState({
                changePasswordLoading: false,
            });
            // this.props.setChangePasswordError('');
        }

        if (prevState.inputOldPassword !== this.state.inputOldPassword) {
            this.props.setChangePasswordError('');

            if (!this.state.inputOldPassword) {
                this.setState({ oldPasswordError: true });
            } else {
                this.setState({ oldPasswordError: false });
            }
        }

        if (prevState.inputNewPassword !== this.state.inputNewPassword) {
            this.props.setChangePasswordError('');
            this.setState({ passwordMatchError: false });

            if (!this.state.inputNewPassword) {
                this.setState({ newPasswordError: true });
            } else {
                this.setState({ newPasswordError: false });
            }
        }

        if (prevState.inputConfirmPassword !== this.state.inputConfirmPassword) {
            this.props.setChangePasswordError('');
            this.setState({ passwordMatchError: false });

            if (!this.state.inputConfirmPassword) {
                this.setState({ confirmPasswordError: true });
            } else {
                this.setState({ confirmPasswordError: false });
            }
        }
    }

    componentWillUnmount() {
        this.props.setChangePasswordError('');
        // this.props.hideChangePassword();
    }

    handleSubmit = (e) => {
        if (!this.state.oldPasswordError && !this.state.newPasswordError && !this.state.confirmPasswordError) {
            if (this.state.inputOldPassword.length > 0 && this.state.inputNewPassword.length > 0 && this.state.inputConfirmPassword.length > 0) {
                if (this.state.inputNewPassword === this.state.inputConfirmPassword) {
                    this.setState({
                        changePasswordLoading: true,
                        passwordMatchError: false,
                    });
                    this.props.changePassword(this.state.inputOldPassword, this.state.inputNewPassword);
                } else {
                    this.setState({ passwordMatchError: true });
                }
            } else {
                if (this.state.inputOldPassword.length === 0) {
                    this.setState({
                        oldPasswordError: true,
                    });
                }
                if (this.state.inputNewPassword.length === 0) {
                    this.setState({
                        newPasswordError: true,
                    });
                }
                if (this.state.inputConfirmPassword.length === 0) {
                    this.setState({
                        confirmPasswordError: true,
                    });
                }
            }
        }
    };

    handleChange = (e) => {
        this.setState({
            ...this.state,
            [e.target.id]: e.target.value,
            changePasswordLoading: false,
        });
    };

    render() {
        let { changePasswordError } = this.props;
        let { oldPasswordError, newPasswordError, confirmPasswordError, changePasswordLoading, passwordMatchError } = this.state;

        return (
            <div className="changes-pass">
                <div className='div-1'>
                    <span className={`mt-1 ${oldPasswordError ? 'auth__error-field' : ''}`}>
                        <input
                            type="password"
                            className="auth__input"
                            placeholder={Translate.oldPassword}
                            id="inputOldPassword"
                            onChange={this.handleChange}
                            autoComplete="old-password"
                        />
                        {oldPasswordError && <p className="auth__error sm">This field is required</p>}
                    </span>
                    <span className={`mt-2 ${newPasswordError ? 'auth__error-field' : ''}`}>
                        <input
                            type="password"
                            className="auth__input"
                            placeholder={ Translate.newPassword}
                            id="inputNewPassword"
                            onChange={this.handleChange}
                            autoComplete="new-password"
                        />
                        {newPasswordError && <p className="auth__error sm">This field is required</p>}
                    </span>
                    <span className={`mt-2 ${confirmPasswordError ? 'auth__error-field' : ''}`}>
                        <input
                            type="password"
                            className="auth__input"
                            placeholder={ Translate.confirmPassword}
                            id="inputConfirmPassword"
                            onChange={this.handleChange}
                            autoComplete="confirm-password"
                        />
                        {confirmPasswordError && <p className="auth__error sm">This field is required</p>}
                    </span>
                    <span className="auth__btn-wrap">
                        {changePasswordError && (
                        <p className="auth__error auth__error_with-icon md ">
                            <span className="material-icons icon mr-2 align-middle fs-22">error_outline</span>
                            <span className="d-inline-block align-middle">{changePasswordError}</span>
                        </p>
                                    )}

                        {passwordMatchError && (
                        <p className="auth__error auth__error_with-icon md ">
                            <span className="material-icons icon mr-2 align-middle fs-22">error_outline</span>
                            <span className="d-inline-block align-middle">New and Confirmed password must match</span>
                        </p>
                                    )}

                        <Button
                            variant="contained"
                            className="auth__btn d-flex justify-content-center align-items-center"
                            onClick={ () => this.handleSubmit() }
                            disabled={changePasswordLoading && !changePasswordError}
                        >
                            {changePasswordLoading && !changePasswordError ? <LoadingIcon customClass='changepass-loader'/> : Translate.change }
                        </Button>
                    </span>
                </div>
            </div>
        );
    }
}

ChangePassword.propTypes = {
    hideChangePassword: PropTypes.func,
    changePassword: PropTypes.func,
    setChangePasswordError: PropTypes.func,
    changePasswordSuccess: PropTypes.bool,
    changePasswordError: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        changePasswordSuccess: state.user.changePasswordSuccess,
        changePasswordError: state.user.changePasswordError,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changePassword: (oldPassword, newPassword) => dispatch(changePassword(oldPassword, newPassword)),
        setChangePasswordError: (error) => dispatch(setChangePasswordError(error)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
