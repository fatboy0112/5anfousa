import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import { Translate } from '../../localization';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button'
import BetslipSingleBet from './BetslipSingleBet';
import Calculator from './Calculator';
import MiniCalculator from './MiniCalculator';
import LoadingIcon from '../../Components/Common/LoadingIcon';
import { setBetStake, setPlaceBetError } from '../../store/actions/betslip.actions';

class BetslipSingle extends Component {
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
        document.removeEventListener('mousedown', this.handleClickOutside);
        this.props.setBetStake(0);
    }
    handleClickOutside(event) {
        if (this.keypadRef && !this.keypadRef.current?.contains(event.target)) {
            this.setState({isShow:false});
        }
    }

    openCalculator = (show) => {
        this.setState(prev => ({ isShow: !prev.isShow }));
    };

    closeModal = (show) => {
        this.setState({ isShow: show });
    };

    setSingleStake = (value) => {
        this.props.setBetStake(value);
    };

    placeBetCheck = () => {
        if (!this.state.isBtnDisabled) {
            this.setState({ isBtnDisabled: true });
            this.props.placeBetCheck('single');

            setTimeout(() => {
                this.setState({ isBtnDisabled: false });
            }, 500);
        }
    };

    render() {
        let { isShow, isBtnDisabled } = this.state;
        let { fixtures, totalOdds, singleStake, placeBetError, openExtraOddsModal, showCountdown, placeBetDisabled, placeBetDisableFromAdmin, selectExtraMarket, setExtraMarkets } = this.props;
        let index = 0; // numbering in the list of bets
        let isDisabled = isBtnDisabled || placeBetDisabled;

        let drawBets = map(fixtures, (fixture) => {
            return map(fixture.markets, (market) => {
                return map(market.bets, (bet) => {
                    let  leagueName = fixture.leagueName ? fixture.leagueName : fixture.fixture.league.name_en;
                    index++;
                    return (
                        <li>
                            <BetslipSingleBet
                                fixture={fixture.fixture}
                                market={market.market}
                                index={index}
                                bet={bet}
                                leagueName={leagueName}
                                openExtraOddsModal={openExtraOddsModal}
                                key={bet.Id}
                                selectExtraMarket = {selectExtraMarket}
                                setExtraMarkets = {setExtraMarkets}
                            />
                        </li>
                    );
                });
            });
        });

        let possibleWin = Util.toFixedDecimal(parseFloat(singleStake || 0) * totalOdds + 0.00001);
        let showBonus = totalOdds >= lSportsConfig.betslip.bonusMinValue ? true : false;
        let bonusAmount = showBonus ? Util.toFixedDecimal(possibleWin * (lSportsConfig.betslip.bonusPersentage / 100)) : 0;
        let totalPossibleWin = Util.toFixedDecimal(parseFloat(possibleWin) + parseFloat(bonusAmount));

        let drawCalculator = isShow ? (
            <Calculator startValue={singleStake} possibleWin={possibleWin} onSetValue={this.setSingleStake} onCloseModal={this.closeModal} />
        ) : null;
        let error = placeBetError ? (
            <Grid container className="mx-auto fs-15">
                <Grid item xs={12} className="p-1 text-center error-bg">
                    {/* <img src="./images/error-icon.png" className="align-middle error-icon"></img> */}
                    <span className="material-icons icon mr-2 align-middle text-red">error</span>
                    <span>{placeBetError}</span>
                </Grid>
            </Grid>
        ) : null;

        let bootomContainer =
            fixtures.length > 0 ? (
                <div className="foot-bet mt-auto">
                    {error}
                    <div className="bet-amount" ref={this.keypadRef}>
                        {drawCalculator}
                        <MiniCalculator openCalculator={this.openCalculator} closeModal= {this.closeModal} type="single" />
                    </div>
                    <Grid container className="mx-auto betslip__panel pt-1 text-color">
                        <Grid item xs={7} className="px-2">
                            {Translate.totalOdds}
                        </Grid>
                        <Grid item xs={5} className="text-right px-2">
                            {parseFloat(totalOdds).toFixed(2)}
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
                <div className='betslip-inner-main'>
                    <div className="bet-slip mb-120 mt-1 pr-2">
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

BetslipSingle.propTypes = {
    fixtures: PropTypes.array,
    singleStake: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    placeBetError: PropTypes.string,
    loading: PropTypes.bool,
    totalOdds: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setPlaceBetError: PropTypes.func,
    setBetStake: PropTypes.func,
    placeBetCheck: PropTypes.func,
    openExtraOddsModal: PropTypes.func,
    language: PropTypes.string,
    showCountdown: PropTypes.bool,
    placeBetDisabled: PropTypes.bool,
};

const mapStateToProps = (state) => {
    return {
        fixtures: state.betslip.fixtures,
        singleStake: state.betslip.singleStake,
        placeBetError: state.betslip.placeBetError,
        placeBetDisabled: state.betslip.placeBetDisabled,
        loading: state.general.loading,
        totalOdds: state.betslip.totalOdds,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setPlaceBetError: (error) => dispatch(setPlaceBetError(error)),
        setBetStake: (value) => dispatch(setBetStake(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BetslipSingle);
