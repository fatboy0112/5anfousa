import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import find from 'lodash.find';
import Bets from './Bets';
import { setCashoutData } from '../../store/actions/cashout.actions';

import CashoutModal from './CashoutModal';
import forEach from 'lodash.foreach';
import Util from '../../helper/Util';
import { Translate } from '../../localization';
import { dynamoClient } from '../../App';
import { getSingleLiveMarkets, getSingleMarketOfPreEvent, getSingleMarketOfEvent } from '../../dynamo/inplayParams';
import { paramsMarketDataIndex } from '../../dynamo/params';
import { lSportsConfig } from '../../config';
import { compareAsc } from 'date-fns';
import ReactToPrint from 'react-to-print';
let unSub=[];

class SingleBetslipModal extends Component  {

    constructor(props) {
        super(props);
        this.state={
            cashoutAvailable: false,
            isCashoutAvailableLoading: true,
            isCashoutExpired: false,
            cashoutObject: {},
        };
    }

    componentDidMount() {
        this.checkAllOddsAvailable();
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.showCashoutSuccess !== this.props.showCashoutSuccess) {
            if(this.props.showCashoutSuccess) {
                this.setState({ cashoutAvailable: false, cashoutObject: {}  });
            }
        }
    }

    checkCashoutConditions = () => {  
        if(!this.isAnyLostBet() && this.checkCashoutObject() && this.isNotPastPrematch()) { 
            this.setState({ cashoutAvailable: true });
            if (!this.props.cashoutData.cashout_amount)
            this.props.betslip.status === 'in game' && this.props.openCashoutModal();
        }
        else if (this.isAnyLostBet() || !this.checkCashoutObject()) {
            this.setState({ cashoutAvailable: false });
        }
        if ( this.state.isCashoutAvailableLoading ) {
            this.setState({ isCashoutAvailableLoading: false });
        }
    };

    checkCashoutObject = () => {
        let check = true;
        forEach(this.state.cashoutObject, (element) => {
            if(element === false) {
                check = false;
            }
        });
        return check;
    }

    checkAllOddsAvailable = () => {
        if(this.props.betslip.status === 'in game') {
            let check = false;
            this.props.singleBetslip.bets.forEach((bet) => {
                if(!bet.settlement_status) {
                    check = true;
                //listen to changes
                    if(bet.event_status === lSportsConfig.statuses.inplay ) {
                        let id = `${bet.fixture_id}^${bet.market_id}`;
                        if (bet.specifiers) id = `${id}^${bet.specifiers}`;
                        dynamoClient.query(getSingleMarketOfEvent(`${id}`)).promise().then((e) => {
                            if(e?.Items && e.Items[0]?.outcomes) this.handleOddsUpdate(bet, JSON.parse(e.Items[0].outcomes), e.Items[0].market_status);
                            else this.handleOddsUpdate(bet);
                        });
                    }
                    else {
                        let id = `${bet.fixture_id}^${bet.market_id}`;
                        if (bet.specifiers) id = `${id}^${bet.specifiers}`;
                        dynamoClient.query(getSingleMarketOfPreEvent(id)).promise().then((e) => {
                            if(e?.Items && e.Items[0]?.outcomes) this.handleOddsUpdate(bet, JSON.parse(e.Items[0].outcomes), e.Items[0].market_status);
                            else this.handleOddsUpdate(bet);
                        });
                    }
                }
                if(!check){
                    this.setState({ cashoutAvailable: false });
                }
            });
        }
    };
        
    handleOddsUpdate = (bet, snap, marketStatus) => {
        let { cashoutObject } = this.state;
        if(snap) {
            //now check price and status
            let check = true;
            const { active, settled } = lSportsConfig.marketStatus;
            // custom check for Correct Score and Correct score first period && market should be active/settled
            if([active, settled].indexOf(+marketStatus) === -1 || bet.market_id === 431 || bet.market_id === 481){
                check =false;
            }
            else if(bet.event_status === lSportsConfig.statuses.prematch || bet.event_status === lSportsConfig.statuses.inplay ) {
                // let selectedMarket = snap[`${bet.market_id}`];
                let selectedBet = snap[`${bet.bet_id}`];
                
                if(!selectedBet?.result && (selectedBet?.active != lSportsConfig.betStatus.active || !selectedBet?.odds) ){
                    check =false;
                }
            }
            else check = false;
        
            if(!cashoutObject[bet.fixture_id]) {
                let cashoutObj = cashoutObject;
                cashoutObj[bet.fixture_id] = check;
                this.setState({ cashoutObject : cashoutObj });
            }
            else if(!check && cashoutObject[bet.fixture_id] === true ) {
                let cashoutObj = cashoutObject;
                cashoutObj[bet.fixture_id] = false;
                this.setState({ cashoutObject : cashoutObj });
                this.setState({ cashoutAvailable : false});
            }
            else if(check && cashoutObject[bet.fixture_id] === false) {
                let cashoutObj = cashoutObject;
                cashoutObj[bet.fixture_id] = true;
                this.setState({ cashoutObject : cashoutObj });
                    // this.setState({ cashoutOddsAvailable : true});       
            }
        }
        else {
            let cashoutObj = cashoutObject;
            cashoutObj[bet.fixture_id] = false;
            this.setState({ cashoutObject : cashoutObj });
            // this.setState({ cashoutOddsAvailable : false});
        }
        this.checkCashoutConditions();
    };

    isNotPastPrematch = () => {
        let check = true;
        this.props.singleBetslip.bets.forEach(element => {
            const { start_date: startDate } = element;
            if((element.event_status != lSportsConfig.statuses.inplay && element.event_status != lSportsConfig.statuses.results) && compareAsc(new Date(startDate), new Date()) < 1){
                check= false;
            }
        });
        return check;
    };

    isAnyLostBet = () => {
        let check = false;
        this.props.singleBetslip.bets.forEach(element => {
            if(element.settlement_status === 1){
                check= true;
            }
        });
        return check;
    }

    refreshCashout = () => {
        if(this.state.cashoutAvailable) {
            this.props.openCashoutModal();
            this.setState({ isCashoutExpired: false });
        }
        else {
            this.checkAllOddsAvailable();
        }
    }

    cashoutExpired = () => {
        this.props.resetCashoutData();
        this.setState({ isCashoutExpired: true });
    }

    render() {

        let { cashoutAvailable, isCashoutAvailableLoading, isCashoutExpired } = this.state;
        let { closeModal, singleBetslip, betslip, showCashoutSuccess, cashoutData, openCashoutConfirmationPopup, userData, loadingCashout } = this.props;
        let couponId = singleBetslip.coupon_id ? singleBetslip.coupon_id : '-';

        let betslipList =
             singleBetslip.bets.length > 0 ? <Bets singleBetslip={singleBetslip} betslip={betslip} /> : <div className="no-data fs-15 pt-3 pb-3">No data</div>;
         let headerData =  <div className="d-flex align-items-center flex-wrap">
                        <h3 className="m-0 mr-3 d-flex align-items-center print_color">
                            <i className="material-icons menu-item__betslip-icon mr-2" style={{ marginBottom: '1px' }}>
                                receipt
                            </i>
                            {Translate.coupon} 
                            {/* {print_color is used for print design} */}
                        </h3>
                        <p className="my-0 subtitle print_color">ID: {couponId}&nbsp;&nbsp;&nbsp;</p>
                        </div>
            return (
                <Dialog onClose={closeModal} aria-labelledby="single-betslip-dialog-title" open={true} scroll="paper" PaperProps={{ classes: { root: 'w-50' } }}>
                    <ReactToPrint
                            trigger={() => <Button className="print-button">Print</Button>}
                            content={() => this.betSlipRef}
                            documentTitle={`Africa_gold_${couponId}`}
                            pageStyle="@page { size: auto; margin: 0mm 50mm 0mm 50mm; border-style: solid;  } @media print { body { -webkit-print-color-adjust: exact; padding:40px !important;  background-color: #fff !important;} .mybet__popup-text { font-size: 15px !important;} .text-gray-dark{color: #000 !important;} .print_color{color: #000 !important; font-size:25px !important;} .close-modal{display:none !important;} .cashout-btn-wrap{display:none !important;}}"
                        />
                         <div ref={(el) => (this.betSlipRef = el)}>
                    <DialogTitle id="single-betslip-dialog-title" disableTypography>
                        {headerData}
                        <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                            <i className=" material-icons fs-22"> close </i>
                        </IconButton>
                    </DialogTitle>

                    <DialogContent className="p-0">
                    
                    <>
                    {betslipList}
                    {betslip.status === 'in game' && 
                        <CashoutModal 
                            cashoutData={cashoutData}
                            openCashoutConfirmationPopup={openCashoutConfirmationPopup}
                            isCashoutExpired={isCashoutExpired}
                            cashoutExpired={this.cashoutExpired}
                            refreshCashout={this.refreshCashout}
                            cashoutAvailable = {cashoutAvailable}
                            isCashoutAvailableLoading = {isCashoutAvailableLoading}
                            loadingCashout= {loadingCashout}
                            currency = {userData && userData.currency ? userData.currency : 'EUR'} 
                        />}
                    </>
                    </DialogContent>
                    </div>
                </Dialog>
        );
    }
}

SingleBetslipModal.propTypes = {
    closeModal: PropTypes.func,
    singleBetslip: PropTypes.object,
    betslip: PropTypes.object,
    cashoutData: PropTypes.object,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        singleBetslip: state.bets.singleBetslip,
        loadingCashout: state.bets.loadingCashout,
        cashoutData: state.bets.cashoutData,
        showCashoutSuccess: state.bets.showCashoutSuccess,
        language: state.general.language,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setCashoutData: (betslip_id, total_odds, stake_price) => dispatch(setCashoutData(betslip_id, total_odds, stake_price)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleBetslipModal);
