import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import { Translate } from '../../localization';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button'
import BetslipMultiBet from './BetslipMultiBet';
import Calculator from './Calculator';
import MiniCalculator from './MiniCalculator';
import LoadingIcon from '../../Components/Common/LoadingIcon';
import { setMultiStake, setPlaceBetError } from '../../store/actions/betslip.actions';

class BetslipList extends Component {
    constructor(props) {
        super(props);
        this.keypadRef = React.createRef();
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.state = {
            isShow: false,
            isBtnDisabled: false,
        };
    }

    componentDidMount() {
        this.props.setPlaceBetError(null);
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        this.props.setMultiStake(0);
        document.addEventListener('mousedown', this.handleClickOutside);
    }
    
    handleClickOutside(event) {
        if (this.keypadRef && !this.keypadRef.current?.contains(event.target)) {
            this.setState({isShow:false});
        }
    }

    openCalculator = (show) => {
        this.setState(prev => ({ isShow: !prev.isShow }));
    };

    closeModal = () => {
        this.setState({ isShow: false });
    };

    setMultiStake = (value) => {
        this.props.setMultiStake(value);
    };

    placeBetCheck = () => {
        if (!this.state.isBtnDisabled) {
            this.setState({ isBtnDisabled: true });
            this.props.placeBetCheck('multiple');

            setTimeout(() => {
                this.setState({ isBtnDisabled: false });
            }, 500);
        }
    };

    render() {
        let { isShow, isBtnDisabled } = this.state;
        let { fixtures, totalMultiOdds, multiStake, placeBetError, switchBetslipType, openExtraOddsModal, showCountdown, placeBetDisabled, placeBetDisableFromAdmin, setExtraMarkets, selectExtraMarket } = this.props;
        let isDisabled = isBtnDisabled || placeBetDisabled;
        let index = 0; // numbering in the list of bets

        let drawBets = map(fixtures, (fixture) => {
            return map(fixture.markets, (market) => {
                return map(market.bets, (bet) => {
                    index++;
                    let  leagueName = fixture.leagueName ? fixture.leagueName : fixture.fixture.league.name_en;
                    return (
                        <li>
                            <BetslipMultiBet
                                setExtraMarkets={setExtraMarkets}
                                selectExtraMarket={selectExtraMarket}
                                switchBetslipType={switchBetslipType}
                                fixture={fixture.fixture}
                                market={market.market}
                                index={index}
                                bet={bet}
                                leagueName={leagueName}
                                openExtraOddsModal={openExtraOddsModal}
                                key={bet.Id}
                            />
                        </li>
                    );
                });
            });
        });

        let possibleWin = Util.toFixedDecimal(parseFloat(multiStake || 0) * totalMultiOdds + 0.00001);
        let showBonus = totalMultiOdds >= lSportsConfig.betslip.bonusMinValue ? true : false;
        let bonusAmount = showBonus ? Util.toFixedDecimal(possibleWin * (lSportsConfig.betslip.bonusPersentage / 100)) : 0;
        let totalPossibleWin = Util.toFixedDecimal(parseFloat(possibleWin) + parseFloat(bonusAmount));

        let drawCalculator = isShow ? (
            <Calculator startValue={multiStake} possibleWin={possibleWin} onSetValue={this.setMultiStake} onCloseModal={this.closeModal} />
        ) : null;

        let error = placeBetError ? (
            <Grid container className="mx-auto fs-15">
                <Grid item xs={12} className="p-1 text-center error-bg">
                    {/* <img src="./images/error-icon.png" className="align-middle error-icon"></img> */}
                    <span className="material-icons icon mr-2 align-middle text-red">error</span>
                    <span className="error">{placeBetError}</span>
                </Grid>
            </Grid>
        ) : null;

        let bootomContainer =
            fixtures.length > 0 ? (
                <div className="foot-bet mt-auto">
                    {error}
                    <div className="bet-amount" ref={this.keypadRef}>
                        {drawCalculator}
                        <MiniCalculator openCalculator={this.openCalculator} closeModal={this.closeModal} type="multiple" />
                    </div>
                    <Grid container className="mx-auto betslip__panel pt-1 text-color">
                        <Grid item xs={7} className="px-2">
                            {Translate.totalOdds}
                        </Grid>
                        <Grid item xs={5} className="text-right px-2">
                            {parseFloat(totalMultiOdds).toFixed(2)}
                        </Grid>
                    </Grid>

                    <Grid container className="mx-auto betslip__panel text-color">
                        <Grid item xs={7} className="px-2">
                            {Translate.possibleWin}
                        </Grid>
                        <Grid item xs={5} className="text-right px-2">
                            {possibleWin}
                        </Grid>
                    </Grid>

                    {showBonus && (
                        <Grid container className="mx-auto betslip__panel highlighted py-1 text-color">
                            <Grid className="px-2" item xs={7}>
                                {`+${lSportsConfig.betslip.bonusPersentage}% Bonus`}
                            </Grid>
                            <Grid item xs={5} className="text-right px-2 bonus-win-amount">
                                {totalPossibleWin}
                            </Grid>
                        </Grid>
                    )}

                    <Grid container className="mx-auto btn-cont">
                        {showCountdown ? (
                            <Grid item xs={12} className="p-0 text-color">
                                <Button variant="contained" className="place-btn" type="button">
                                    <LoadingIcon theme="my-1 centered" />
                                </Button>
                            </Grid>
                        ) : (
                            <Grid item xs={12} className="p-0">

                                <Button
                                    type="button"
                                    variant="contained"
                                    className={`place-btn ${isDisabled ? 'place-btn_disabled' : ''}`}
                                    onClick={this.placeBetCheck}
                                    disabled={placeBetDisableFromAdmin || isDisabled}
                                >
                                    {Translate.placeBet}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </div>
            ) : null;

        return (
            fixtures &&
            fixtures.length > 0 && (
                <div className="betslip-inner-main">
                    <div className="bet-slip mb-120 mt-1">
                        <ul>
                            {drawBets}
                        </ul>
                    </div>
                    {bootomContainer}
                </div>
            )
        );
    }
}

BetslipList.propTypes = {
    fixtures: PropTypes.array,
    placeBetError: PropTypes.string,
    loading: PropTypes.bool,
    multiStake: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalMultiOdds: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setPlaceBetError: PropTypes.func,
    setMultiStake: PropTypes.func,
    placeBetCheck: PropTypes.func,
    switchBetslipType: PropTypes.func,
    openExtraOddsModal: PropTypes.func,
    language: PropTypes.string,
    showCountdown: PropTypes.bool,
    placeBetDisabled: PropTypes.bool,
};

const mapStateToProps = (state) => {
    return {
        fixtures: state.betslip.fixtures,
        placeBetError: state.betslip.placeBetError,
        placeBetDisabled: state.betslip.placeBetDisabled,
        loading: state.general.loading,
        multiStake: state.betslip.multiStake,
        totalMultiOdds: state.betslip.totalMultiOdds,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setPlaceBetError: (error) => dispatch(setPlaceBetError(error)),
        setMultiStake: (value) => dispatch(setMultiStake(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BetslipList);
