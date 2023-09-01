import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Util from '../../helper/Util';
import { Translate } from '../../localization';
import ChangePassword from './ChangePassword';
import { getCashbackData, getCashbackSucess, logoutUser, resetDepositAmount, getUser } from '../../store/actions/user.actions';
import CashbackModal from './CashbackModal';
import Transactions from '../Transactions';
import MyBets from '../MyBets';
import { toastr } from 'react-redux-toastr';
import DepositModal from './DepositModal';

class MyAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: 'transaction',
            isGetUserNeeded: false,
            showChangePassword: false,
            showCashbackModal: false,
        };
    }

    componentDidMount() {
        //this.props.getCashbackData();
        const { enableMyBets } = this.props;
        if (enableMyBets) this.setState({currentTab: 'mybets' });
    }

    logout = () => {
        this.setState({ isGetUserNeeded: false });
        const { props: { logoutUser, onClose } } = this;
        logoutUser();
        setTimeout(() => {
            onClose();
        }, 200);
        this.GoToPage('/');
    };

    GoToPage = (path) => {
        this.props.history.push(path);
    };

    showChangePasswordForm = (e) => {
        this.setState({ showChangePassword: true });
    };
    
    showBonus = () => {
        this.setState({ showCashbackModal: true});
    }

    closeBonus = () => {
        this.setState({ showCashbackModal: false});
    } 

    hideChangePassword = () => {
        this.setState({ showChangePassword: false });
    };

    redirectToTermsPage = () => {
        this.GoToPage('/terms-page');
    }
     
    handleDepositAmount = () => {
        const { qr_code, depositError } = this.props;
        if(depositError){
            toastr.error('', depositError);
        }
    }

    handleCurrentTab = (value) => {
        if (value === 'deposit' && !this.state.isGetUserNeeded) { this.setState({ isGetUserNeeded: true }); }
        this.props.resetDepositAmount();
        this.setState({currentTab: value});
    }
    componentWillUnmount() {
        if (this.state.isGetUserNeeded && this.props.userData) {
            this.props.getUser();
        }
    }

    render() {
        let { userData, cashbackData, getCashbackSucess, onClose } = this.props;
        let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';        
        let { currentTab ,showCashbackModal } = this.state;
        let depositAllowedUser = ['player1', 'player2', 'player3'];
        return (
            <>
                <div className="inner-links modal-backdrop fade show" />
                <div className="modal account-popup fade show d-block" role="dialog" >
                    <div className="modal-dialog extra-mkt modal-lg modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header d-flex">
                                <ul className="nav nav-tabs">
                                    <li onClick={ () => this.handleCurrentTab('transaction') }><a className={ `${ currentTab === 'transaction' && 'active'}` } href>{Translate.transaction}</a></li>
                                    <li onClick={ () => this.handleCurrentTab('mybets') }><a className={ `${ currentTab === 'mybets' && 'active'}` } href>{ Translate.myBets }</a></li>
                                    <li onClick={ () => this.handleCurrentTab('changepass') }><a className={ `${ currentTab === 'changepass' && 'active'}` } href>{Translate.changePassword}</a></li>
                                    { userData && depositAllowedUser.includes(userData.username) && (
                                        <li className="disabled" onClick={ () => this.handleCurrentTab('deposit') }><a className={ `${ currentTab === 'deposit' && 'active'} ` } href>{ Translate.deposit }</a></li>
                                    )}
                                    <li onClick={this.logout}><a href>{Translate.logout}</a></li>
                                </ul>
                                <div className="head-right-account d-flex">
                                    <div className="user-detail">
                                        <div className="d-flex align-items-center">
                                            <div className="user-p">
                                                <span><i className="icon-my-account"></i></span>
                                            </div>
                                            <p> {userData && userData.username} <span> {userData && Util.toFixedDecimal(userData.balance)} {currency}</span></p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={ onClose }className="close" data-dismiss="modal" aria-label="Close">
                                        <i className="material-icons betslip__table-close close_sign_color">close</i>
                                    </button>
                                </div>
                            </div>
                            <div className="modal-body tab-content my-account">
                                <div className={`tab-pane ${ currentTab === 'transaction' && 'active'}`}>
                                    { currentTab === 'transaction' && <Transactions /> }
                                </div>
                                <div className={`tab-pane ${ currentTab === 'mybets' && 'active'}`}>
                                    { currentTab === 'mybets' && <MyBets /> }
                                </div>
                                <div className={`tab-pane password-chnag ${ currentTab === 'changepass' && 'active'}`}>
                                    { currentTab === 'changepass' && <ChangePassword /> }
                                </div>
                                <div className={`tab-pane password-chnag ${ currentTab === 'deposit' && 'active'}`}>
                                    { currentTab === 'deposit' && <DepositModal /> }
                                </div>
                            </div>

                            {showCashbackModal && <CashbackModal getCashbackSucess={getCashbackSucess} currency={currency} cashbackAmount={cashbackData.cashback_amount} closeModal={this.closeBonus} /> }
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

MyAccount.propTypes = {
    userData: PropTypes.object,
    logoutUser: PropTypes.func,
    language: PropTypes.string,
    onClose: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        language: state.general.language,
        cashbackData: state.user.cashbackData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        logoutUser: () => dispatch(logoutUser()),
        getCashbackData: () => dispatch(getCashbackData()),
        getCashbackSucess: () => dispatch(getCashbackSucess()),
        resetDepositAmount: () => dispatch(resetDepositAmount()),
        getUser: () => dispatch(getUser()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MyAccount));
