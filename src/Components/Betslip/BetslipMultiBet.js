import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import { Translate } from '../../localization';
import Grid from '@material-ui/core/Grid';
import { removeBet } from '../../store/actions/betslip.actions';
import { marketIds } from '../../config/markets';

function BetslipMultiBet(props) {
    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let { bet, fixture, market, switchBetslipType, count } = props;
        props.removeBet(fixture, market, bet, bet.provider);
        if (count < 3) {
            switchBetslipType('1');
        }
    };

    const canBeCombined = () => {
        let { fixture, fixtures } = props;
        let currentFixture = find(fixtures, { fixtureId: fixture.fixture_id ? fixture.fixture_id : fixture.FixtureId  });
        let currentFixtureMarkets = currentFixture.markets ? currentFixture.markets : currentFixture.Markets;
        return currentFixture && !(currentFixtureMarkets.length > 1 || currentFixtureMarkets[0].bets.length > 1);
    };

    const openOddsModal = (fixture) => {
        props.setExtraMarkets(fixture.markets);
        props.selectExtraMarket('All');
        props.openExtraOddsModal(fixture);
    };

    let { bet, fixture, market, index, leagueName, userData, language } = props;
    const lan = `name_${ language }`;
    const participants = [ fixture?.participant_one_full[lan] || fixture?.participant_one_full.name_en, fixture?.participant_two_full[lan] || fixture?.participant_two_full.name_en ];
    let line = bet.Line ? '(' + bet.Line + ')' : null;
    if (market.Id == marketIds.handicap) line = `(${bet.BaseLine})`;
    let canBeCombinedValue = canBeCombined();
    let oddType = userData?.username && localStorage.getItem('oddType') ?  localStorage.getItem('oddType') : '';

    let canNotBeCombined = !canBeCombinedValue ? <div className="betslip__error">{Translate.pickCanNotBeCombined}<span className="material-icons icon mr-2 align-middle text-red"></span>
    </div> : null;


    let betStatus = bet.Status;
    let betStatusMessage = betStatus === lSportsConfig.betStatus.suspended ? `${Translate.betSuspended} (Bet can not be placed)` : `${Translate.betSettled} (Bet can not be placed)`;

    let betStatusInfo = canBeCombinedValue && betStatus !== lSportsConfig.betStatus.active ? <div className="betslip__error">{betStatusMessage}</div> : null;

    let isLive = (fixture.fixture_status !== undefined ? fixture.fixture_status : fixture.Livescore.Scoreboard.Status ) === lSportsConfig.statuses.inplay;
    let fixtureStatus = (fixture.fixture_status !== undefined ? fixture.fixture_status : fixture.Livescore.Scoreboard.Status);
    let matchInfo;
    if (isLive && fixtureStatus !== lSportsConfig.statuses.inplay) props.removeBet(fixture, market, bet, bet.provider);
    let participantArray = fixture.fixture_status !== undefined ? [fixture.participant_one_full, fixture.participant_two_full] :  fixture.Fixture.Participants;
    if (isLive) {
        let results;
       if (fixture.fixture_status !== undefined && !fixture.Livescore) results = fixture.livescore ? fixture.livescore : null;
        else results = fixture.Livescore ? fixture.Livescore : null;
        if (results) {
            matchInfo = (
                <>
                    <li className="betslip__table-text">{results ? results.home_score : '' }</li>
                    <li className="betslip__table-text">{results ? results.away_score : '' }</li>
                </>
            );
        }
    } else {
        let currentDate = Util.convertToLocalTimezone(fixture.start_date ? fixture.start_date : fixture.Fixture.StartDate);
        let dateString = currentDate.dateString;
        let timeString = currentDate.timeString;
        
        matchInfo = (        
            <span className="betslip__table-text-sm text-black"><span>{dateString}</span><span> {timeString}</span></span>        
        );
    }
    let printLive = isLive ? <span className="live-icon sm align-middle">{Translate.live}</span> : matchInfo;
    let betClassName = '';
        if (bet.diff !== undefined && bet.diff !== 0) {

            if (bet.diff > 0) betClassName = 'decreased';
            if (bet.diff < 0)  betClassName = 'increased';
        }
    let drawBet = bet.isPlaced ? (
        <div className="mx-auto sectionhead pb-2">
            <Grid container className="mx-auto betslip__placed">
                <Grid item xs={12} className="bg-light p-4 mt-2 text-center ">
                    <span className="color-green">Bet Placed</span>
                    <span className="material-icons icon ml-2 mb-2 betslip__placed-icon align-middle color-green">check</span>
                </Grid>
            </Grid>
        </div>
    ) : (
        <div className="mx-auto sectionhead py-1 px-1 no-border" onClick={() => openOddsModal(fixture)}>
            <div className="box-shadow-sm pl-2 pr-2 pt-2 pb-2 betslip__info">
                <table className="w-100 betslip__table">
                    <thead className="betslip__table-content">
                        <tr>
                            <th className="text-gray-dark ">{index}.</th>
                            <th className="text-gray-dark text-left ellipsis">{leagueName}</th>
                            <th className="text-center">{printLive}</th>
                            <th className="text-right close_sign_color">
                                <i className="material-icons betslip__table-close" onClick={handleClose}>
                                    close
                                </i>

                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td />
                            <td className="width-50">
                                <ul className="list__unstyled text-gray-darker">
                                    <li className="betslip__table-text ellipsis">{participantArray[0].name_en}</li>
                                    <li className="betslip__table-text ellipsis">{participantArray[1].name_en}</li>
                                </ul>
                            </td>
                            <td className="text-green text-center">
                                <ul className="list__unstyled">{isLive ? matchInfo : ''}</ul>
                            </td>
                            <td className="text-right betslip__table-text font-weight-bold">
                                <span className={`betslip__odd ${isLive ? 'live__background' : 'prematch__background'} ${(bet.Status !== lSportsConfig.betStatus.active) ? 'betslip__lock' : betClassName}`}>{bet.Status !== lSportsConfig.betStatus.active  ? <i className="material-icons fs-14"> lock </i> : Util.toFixedDecimal(bet.Price, oddType)}</span>
                            </td>
                        </tr>
                        <tr>
                            <td />
                            <td className="text-black betslip__table-content font-weight-semibold" colSpan={3}>
                                <p className="m-0 pt-1 betslipselect-odds">
                                    <span> {Util.marketNameFormatter(market[lan] || market.name_en, bet?.specifier || {}, participants)}։</span>
                                    {/* <span> {Translate.markets[market.Id] || Util.marketNameFormatter(market[lan] || market.name_en, market.Bets[0].specifier)}։</span> */}
                                    <span className="ml-3">
                                        {Translate.tip} { Util.outcomeFormatter(bet[ lan ] || bet.name_en, bet.specifier, bet.Id, lan) }
                                        {line}
                                    </span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {canNotBeCombined}
                {betStatusInfo}
            </div>
        </div>
    );

    return drawBet;
}

BetslipMultiBet.propTypes = {
    switchBetslipType: PropTypes.func,
    fixture: PropTypes.object,
    market: PropTypes.object,
    index: PropTypes.number,
    bet: PropTypes.object,
    count: PropTypes.number,
    fixtures: PropTypes.array,
    removeBet: PropTypes.func,
    leagueName: PropTypes.string,
    language: PropTypes.string,
    openExtraOddsModal: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        count: state.betslip.count,
        fixtures: state.betslip.fixtures,
        language: state.general.language,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeBet: (fixture, market, bet, provider) => dispatch(removeBet(fixture, market, bet, provider)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BetslipMultiBet);
