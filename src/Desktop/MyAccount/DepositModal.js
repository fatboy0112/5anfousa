import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import LoadingIcon from '../../Components/Common/LoadingIcon';
import { depositAmount, getUser } from '../../store/actions/user.actions';
import { Translate } from '../../localization';
import QRCode from 'react-qr-code'

class DepositModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: 0,
            error: null,
            loading: false,
        };
    }

    componentDidUpdate(prevProps){
        if(prevProps.qr_code !== this.props.qr_code
            || prevProps.depositError !== this.props.depositError){
                this.setState({ ...this.state, loading: false })
            }
    }

    handleSubmit = (e) => {
        const { amount } = this.state
        if (amount <= 0) {
            this.setState({
                ...this.state,
                error: 'Amount should be greater than zero'
            })
        } else {
            this.props.depositAmount(amount)
            this.setState({ ...this.state, loading: true })
        }
    }
    handleChange = (e) => {
        this.setState({
            ...this.state,
            amount: e.target.value
        })
    }
    render() {
        return (
            <div className="changes-pass">
                <div className='deposit'>
                    { this.props.qr_code
                        ? (
                            <div className='qr_code'>
                                <QRCode size={ 400 } value={ this.props.qr_code } />
                                <h3>{ Translate.qrScan }</h3>
                            </div>
                        )
                        : (<form
                            onSubmit={(e) => {
                                e.preventDefault();
                                this.handleSubmit();
                            }}
                        >
                            <div className={`mt-1`}>
                                <input
                                    type="number"
                                    autoFocus
                                    className="auth__input"
                                    placeholder={Translate.enterAmount}
                                    onChange={this.handleChange}
                                />
                                {
                                    !!this.props.depositError ? <p className="auth__error sm">{ this.props.depositError }</p>
                                        : this.state.error && <p className="auth__error sm">{ this.state.error }</p>
                                }
                            </div>
                            <div className="auth__btn-wrap desktop_deposit_button">
                                <Button
                                    variant="contained"
                                    className="auth__btn d-flex justify-content-center align-items-center"
                                    type="submit"
                                    disabled={ this.state.loading }
                                >
                                    {this.state.loading ? <LoadingIcon /> : Translate.continue }
                                </Button>
                            </div>
                        </form>)
                    }
                    </div>
                </div>
        );
    }
}

DepositModal.propTypes = {
    hideDepositForm: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        // data: state.user.data,
        qr_code: state.user.qr_code,
        depositError: state.user.depositError,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        depositAmount: (amount) => dispatch(depositAmount(amount)),
        getUser: () => dispatch(getUser()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DepositModal);
