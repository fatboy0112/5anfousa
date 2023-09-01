import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { Translate } from '../../localization';
import { Link } from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import ChangePassword from './ChangePassword';
import { getCashbackData, getCashbackSucess, logoutUser } from '../../store/actions/user.actions';
import CashbackModal from './CashbackModal';
import DepositModal from './DepositModal';
import { toastr } from 'react-redux-toastr';

class MyAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showChangePassword: false,
            showCashbackModal: false,
            showDepositModal: false,
            oddType: 'decimal'
        };
    }

    componentDidMount() {
        //this.props.getCashbackData();
        if(this.props.userData?.username && localStorage.getItem('oddType')) {
            this.setState({oddType: localStorage.getItem('oddType')});
        }
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.qr_code !== this.props.qr_code
            || prevProps.depositError !== this.props.depositError) {
            this.handleDepositAmount();
        }
    }
    
    handleDepositAmount = () => {
        const { qr_code, depositError } = this.props;
        if(depositError){
            toastr.error('', depositError);
        }
    }

    logout = () => {
        this.props.logoutUser();
        this.GoToPage('/');
    };

    GoToPage = (path) => {
        this.props.history.push(path);
    };

    showChangePasswordForm = (e) => {
        this.setState({ showChangePassword: true });
    };

    showDepositForm = (e) => {
        this.setState({ showDepositModal: true });
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

    hideDepositForm = () => {
        this.setState({ showDepositModal: false });
    };

    redirectToTermsPage = () => {
        this.GoToPage('/terms-page');
    }

    handelOddsTypeChange = (e) => {
        this.setState({oddType: e.target.value}, () => {
            localStorage.setItem('oddType', e.target.value);
        });
    }

    render() {
        let { userData, cashbackData, getCashbackSucess } = this.props;
        let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';        
        let { showChangePassword, showCashbackModal, showDepositModal, oddType } = this.state;

        let depositAllowedUser = ['player1', 'player2', 'player3'];
       
        return (
            <div className="bg-gradient my-account-section">
                <div className="main-container my-account-detail">
                    <div className="userimg-div">
                        <img src="/images/user.png" className="user-img"/>
                    </div>
                    <Grid container className="my-account__header mx-auto bg-head-gray text-white align-items-center">
                        {/* <Grid item xs={12} className="pl-2 pr-1 text-center ">
                            <span className="my-account__header-icon">
                                <i className="icon-my-account"></i>
                                <img src = "/images/banner_casino 2.png" className="user-img"/>
                            </span>
                        </Grid> */}
                        <Grid item xs={12} className="pr-0 text-left user-name">
                            <span className="my-account__text player-name d-block ellipsis">{userData && userData.username}</span>
                        </Grid>
                        {/* <Grid item xs={5} className="my-account__text text-right">
                            {userData && Util.toFixedDecimal(userData.balance)} {currency}
                        </Grid> */}
                        {/* <div className="user-bg-img">
                            <img src="/images/user-1.png" className="w-100"/>
                        </div> */}
                    </Grid>

                    <Link to="/my-account/transactions" className="d-block">
                        <Grid container className="line-height-40 mx-auto icon-gray py-3 cursor-pointer align-items-center">
                            <Grid item xs={10} md={10} className="pr-0 text-left my-account__text">
                                {Translate.transaction}
                            </Grid> 
                            <Grid item xs={2} className="pl-2 pr-1 text-center my-account__icon d-flex align-items-center justify-content-center">
                                {/* <i className="icon-transaction  color-dark"></i> */}
                                <img src="/images/sports-img.svg" className="color-dark" style={{width: '25px'}}/>
                            </Grid>                           
                        </Grid>
                    </Link>

                    <div className="my-account__divider"></div>

                    <Grid container className="line-height-40 mx-auto icon-gray py-3 cursor-pointer d-flex align-items-center justify-content-center" onClick={this.showChangePasswordForm}>
                        <Grid item xs={10} md={10} className="pr-0 text-left my-account__text">
                            {Translate.changePassword}
                        </Grid>
                        <Grid item xs={2} className="pl-2 pr-1 text-center my-account__icon">
                            {/* <i className="icon-password"></i> */}
                            <img src="/images/lock.svg" className="color-dark" style={{width: '25px'}}/>
                        </Grid>                       
                    </Grid>

                    <div className="my-account__divider"></div>
                    <Grid container className=" line-height-40 mx-auto icon-gray py-3 cursor-pointer align-items-center" >
                        <Grid item xs={7} className="pr-0 text-left my-account__text" > 
                            Odds Type
                        </Grid>

                    
                        <Grid item xs={5} className="pl-2 pr-1 d-flex justify-content-end align-items-center text-center my-account__icon">
                            <Select value={oddType} onChange={this.handelOddsTypeChange}>
                                <MenuItem value="decimal">
                                    <em> Decimal </em>
                                </MenuItem>
                                <MenuItem value="fraction">
                                    <em> Fraction </em>
                                </MenuItem>
                                <MenuItem value="american">
                                    <em> American Odds </em>
                                </MenuItem>
                            </Select>

                        </Grid>

                    </Grid>

                    {
                    userData && depositAllowedUser.includes(userData.username) && (
                        <Grid container className="mx-auto icon-gray py-3 cursor-pointer align-items-center disabled" onClick={this.showDepositForm}>  
                            <Grid item xs={10} md={10} className="pr-0 text-left my-account__text">
                                {Translate.deposit}
                            </Grid>
                            <Grid item xs={2} className="pl-2 pr-1 text-center my-account__icon">
                                <i className="icon-transaction"></i>
                            </Grid>
                        </Grid>
                    )
                }
                

                    <Grid container className={`line-height-40 mx-auto icon-gray py-3 cursor-pointer justify-content-center d-flex align-items-center ${cashbackData?.is_cashback_available? '' : 'disabled'}`} onClick={this.showBonus}>
                        <Grid item xs={10} className="pr-0 text-left my-account__text">
                            {Translate.bonus}
                        </Grid>
                        <Grid item xs={2} className="pl-2 pr-1 d-flex justify-content-center align-items-center text-center my-account__icon">
                            {cashbackData?.is_cashback_available ? <img className="account-icons" alt="bonus icon" src="./images/bonus.svg" style={{width: '25px'}}></img> : 
                            <img  src="/images/bonus-img.svg" style={{width: '30px'}}></img> }
                                
                        </Grid>                       
                    </Grid>
                        
                    <div className="my-account__divider"></div>

                    <Grid container className=" line-height-40 disabled mx-auto icon-gray py-3 cursor-pointer align-items-center" >
                        <Grid item xs={10} className="pr-0 text-left my-account__text" > 
                            {Translate.termsAndConditon}
                        </Grid>

                        <Grid item xs={2} className="pl-2 pr-1 d-flex justify-content-center align-items-center text-center my-account__icon">
                            <img className="account-icons" alt="Terms and Conditions" src="/images/tc.svg" style={{width: '20px'}}></img> 
                        </Grid>
                        {/* TODO: onClick={this.redirectToTermsPage} */}                       
                    </Grid>

                    <div className="my-account__divider"></div>

                    <Grid container className=" line-height-40 mx-auto icon-gray py-3 cursor-pointer align-items-center" onClick={this.logout}>
                        <Grid item xs={10} className="pr-0 text-left my-account__text">
                            {Translate.logout}
                        </Grid>

                        <Grid item xs={2} className="pl-2 pr-1 text-center my-account__icon">
                            <i className="icon-logout color-dark"></i>
                        </Grid>                        
                    </Grid>

                    


                    {/* <div className="my-account__divider"></div> */}

                    {showChangePassword && <ChangePassword hideChangePassword={this.hideChangePassword} />}
                    {showDepositModal && <DepositModal hideDepositForm={this.hideDepositForm} />}
                    {showCashbackModal && <CashbackModal getCashbackSucess={getCashbackSucess} currency={currency} cashbackAmount={cashbackData.cashback_amount} closeModal={this.closeBonus} /> }
                </div>
            </div>
        );
    }
}

MyAccount.propTypes = {
    userData: PropTypes.object,
    logoutUser: PropTypes.func,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        language: state.general.language,
        cashbackData: state.user.cashbackData,
        qr_code: state.user.qr_code,
        depositError: state.user.depositError
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        logoutUser: () => dispatch(logoutUser()),
        getCashbackData: () => dispatch(getCashbackData()),
        getCashbackSucess: () => dispatch(getCashbackSucess()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyAccount);
