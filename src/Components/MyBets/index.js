import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { Translate } from '../../localization';
import Grid from '@material-ui/core/Grid';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from '../Common/NewLoading';
import LoadingIcon from '../Common/LoadingIcon';
import SingleBetslipModal from './SingleBetslipModal.js';
import Betslip from './Betslip';
import { getBetslips, selectBetslip, getSingleBetslip, removeMyBetsFilters} from '../../store/actions/bets.actions';
import { setCashoutData, processCashout, setCashoutLoading, resetCashoutData, showCashoutSuccess,showCashoutError } from '../../store/actions/cashout.actions';
import CashoutConfirmationPopup from './CashoutConfirmationPopup';
import find from 'lodash.find';
import Filter from './Filter';

class MyBets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: 'all',
            showSingleBetslipModal: false,
            singleBetslipLoading: false,
            currentBetslip: {},
            showCashoutConfirmationPopup: false,
            closeCashoutSuccess: false 
        };
    }

    componentDidMount() {
        let { isActive } = this.state;
        let activeTab = isActive === 'all' ? '' : isActive;
        this.props.selectBetslip(activeTab);
    }

    componentDidUpdate(prevProps) {
        let { isActive } = this.state;
        if (prevProps.singleBetslip !== this.props.singleBetslip) {
            this.setState({ singleBetslipLoading: false });
        }
        
        if(prevProps.isCashoutSuccess && !this.props.isCashoutSuccess) {
            this.setState({ showSingleBetslipModal: false});
            if( this.props.cashoutData.cashout_amount ) {
                this.props.resetCashoutData();
            }
        }

        if (prevProps.language !== this.props.language) {
            this.setActiveTab(isActive);
        }

        // Code for auto load the next data
        // if (this.props.hasNextPage && this.props.betslips.length !== this.props.totalBetslipCount) {
        //     this.props.getBetslips(activeTab);
        // }
    }

    componentWillUnmount() {
        this.props.removeMyBetsFilters();
    }

    setActiveTab = (tab) => {
        this.setState({ isActive: tab });
        let activeTab = tab === 'all' ? '' : tab;
        this.props.selectBetslip(activeTab);
    };

    openSingleBetslipModal = (betslip) => {
        this.setState({
            showSingleBetslipModal: true,
            singleBetslipLoading: true,
            currentBetslip: betslip,
            closeCashoutSuccessModal: false,
        }) ;
        this.props.getSingleBetslip(betslip.id);
    };

    closeSingleBetslipModal = () => {
        this.setState({ showSingleBetslipModal: false }, () => {
            this.props.resetCashoutData()
        });
    };

    openCashoutModal = () => {
        const betslipId = this.getBetslipId();
        this.props.setCashoutLoading(true);
        this.props.setCashoutData(betslipId, this.props.singleBetslip.multi_price, this.props.singleBetslip.amount);
    }

    getBetslipId = () => {
        const betslip = find( this.props.betslips, (bet) => bet.coupon_id === this.props.singleBetslip.coupon_id);
        return betslip.id;
    } 

    closeCashoutModal = () => {
        this.setState({ showSingleBetslipModal: false }, () => {
            this.props.resetCashoutData()
        });
    }

    openCashoutConfirmationPopup = () => {
        this.setState({
            showCashoutConfirmationPopup: true,
        });
    }

    closeCashoutConfirmationPopup = () => {
        this.setState({
            showCashoutConfirmationPopup: false,
        }
        );
    }
        

    fetchMoreData = () => {
        let { isActive } = this.state;
        let activeTab = isActive === 'all' ? '' : isActive;
        let { countBets, totalResultCount, fetchMore} = this.props;
        if(countBets < totalResultCount && fetchMore)
        {
            this.props.getBetslips(activeTab);
        }
        // if (this.props.hasNextPage) {
        //     this.props.getBetslips(activeTab);
        // }
    };

    closeCashoutSuccessModal = () => {
        this.setState({closeCashoutSuccess : true});
    }

    render() {
        let { isActive, showSingleBetslipModal, singleBetslipLoading, currentBetslip, showCashoutConfirmationPopup, closeCashoutSuccess} = this.state;
        let { betslips, loadingBetslip, cashoutData, processCashout, showCashoutSuccess, resetCashoutData, isCashoutSuccess, countBets, totalResultCount, fetchMore  } = this.props;
        let betslipsList =
            betslips && betslips.length > 0
                ? map(betslips, (betslip) => {
                      return <Betslip betslip={betslip} key={betslip.id} openBetslipModal={this.openSingleBetslipModal} />;
                  })
                : [];

                let runAgain ;
                if(countBets < totalResultCount )
                {
                    runAgain = true;
                }
                if(!fetchMore)
                {
                    runAgain = false;
                }

        let drawBetslips = loadingBetslip || singleBetslipLoading ? (
            <Loading />
        ) : betslipsList.length > 0 ? (
            <>
                <InfiniteScroll dataLength={betslipsList.length} next={this.fetchMoreData} hasMore={runAgain} loader={<LoadingIcon theme="dark centered" />}>
                    {isActive === 'all' && <Filter />}
                    <table className="mybet__table">
                        <thead>
                            <tr className="mybet__table-head">
                                <th>{Translate.date}</th>
                                <th>{Translate.amount}</th>
                                <th>{Translate.possibleWin}</th>
                                <th>{Translate.winAmount}</th>
                                <th>{Translate.status}</th>
                            </tr>
                        </thead>
                        <tbody>{betslipsList}</tbody>
                    </table>
                </InfiniteScroll>

                <div className="pb-4" />

                {showSingleBetslipModal &&
                    (singleBetslipLoading ? (
                        <Loading/>
                    ) : (
                        <SingleBetslipModal
                            openCashoutModal={this.openCashoutModal}
                            resetCashoutData={resetCashoutData}
                            closeModal={this.closeSingleBetslipModal}
                            betslip={currentBetslip}
                            openCashoutConfirmationPopup={this.openCashoutConfirmationPopup}
                        />
                    ))}

                {(showCashoutConfirmationPopup || isCashoutSuccess) && (
                    <CashoutConfirmationPopup
                        getBetslipId={this.getBetslipId}
                        cashoutData={cashoutData}
                        closeModal={this.closeCashoutConfirmationPopup}
                        closeCashoutModal={this.closeCashoutModal}
                        processCashout={processCashout}
                        showCashoutSuccess={showCashoutSuccess}
                        showCashoutError={showCashoutError}
                        isCashoutSuccess={isCashoutSuccess}
                        closeCashoutSuccess={closeCashoutSuccess} 
                        cashoutSuccessVisible ={isCashoutSuccess && !closeCashoutSuccess}
                        closeSuccessModal={this.closeCashoutSuccessModal}
                    />
                )}
            </>
        ) : (
            <>
                {isActive === 'all' && <Filter />}
                <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
            </>
        );

        return (
            <div className="main-container mybet" id="mybets">
                <Grid container className="mybet__result">
                    <Grid item xs={3} className={`${isActive === 'all' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('all')}>
                        {Translate.all}
                    </Grid>
                    <Grid item xs={3} className={`${isActive === 'in game' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('in game')}>
                        {Translate['in game']}
                    </Grid>
                    <Grid item xs={3} className={`${isActive === 'won' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('won')}>
                        {Translate.won}
                    </Grid>
                    <Grid item xs={3} className={`${isActive === 'lost' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('lost')}>
                        {Translate.lost}
                    </Grid>
                </Grid>

                {drawBetslips}
            </div>
        );
    }
}

MyBets.propTypes = {
    betslips: PropTypes.array,
    //hasNextPage: PropTypes.bool,
    loadingBetslip: PropTypes.bool,
    singleBetslip: PropTypes.object,
    getBetslips: PropTypes.func,
    selectBetslip: PropTypes.func,
    getSingleBetslip: PropTypes.func,
    language: PropTypes.string,
    cashoutData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        betslips: state.bets.betslips,
        mybetsFilterParams: state.bets.mybetsFilterParams,
        //hasNextPage: state.bets.hasNextPage,
        countBets : state.bets.countBets,
        totalResultCount : state.bets.totalResultCount,
        fetchMore : state.bets.fetchMore,
        loadingBetslip: state.bets.loadingBetslip,
        singleBetslip: state.bets.singleBetslip,
        totalBetslipCount: state.bets.totalBetslipCount,
        language: state.general.language,
        cashoutData: state.bets.cashoutData,
        loadingCashout: state.bets.loadingCashout,
        isCashoutSuccess: state.bets.showCashoutSuccess,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getBetslips: (data) => dispatch(getBetslips(data)),
        selectBetslip: (value) => dispatch(selectBetslip(value)),
        getSingleBetslip: (betslip_id) => dispatch(getSingleBetslip(betslip_id)),
        setCashoutData: (betslip_id, total_odds, stake_price) => dispatch(setCashoutData(betslip_id, total_odds, stake_price)),
        processCashout: (betslip_id, cashout_amount) => dispatch(processCashout(betslip_id, cashout_amount)),
        setCashoutLoading: (value) => dispatch(setCashoutLoading(value)),
        resetCashoutData: () => dispatch(resetCashoutData()),
        showCashoutSuccess: (value) => dispatch(showCashoutSuccess(value)),
        removeMyBetsFilters: () => dispatch(removeMyBetsFilters()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyBets);
