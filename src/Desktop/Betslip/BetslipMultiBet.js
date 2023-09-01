import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import { Translate } from '../../localization';
import Grid from '@material-ui/core/Grid';
import { removeBet } from '../../store/actions/betslip.actions';
import { withRouter } from 'react-router-dom';
import filter from 'lodash.filter';
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

    const openOddsModal = (fixture,isLive) => {
        let LiveStreamAvailable = false;
        if (isLive){
            let selectedEvents = filter(props.liveStreamData, (e) =>  e.matchId === fixture.fixture_id );
         LiveStreamAvailable = selectedEvents.length && selectedEvents[0].live === '1' ? true :false;
        }
    
        
        props.setExtraMarkets(fixture.markets);
        props.selectExtraMarket('All');
        isLive ? props.history.push(`/d/live-bettingextra-market/${fixture.sport_id}/${fixture.fixture_id}/${LiveStreamAvailable}`) :
        props.history.push(`/d/extra-market/${fixture.sport_id}/${fixture.fixture_id}`);


    };

    let { bet, fixture, market, leagueName, language } = props;
    let oddType = localStorage.getItem('oddType')  ? localStorage.getItem('oddType') : '' ;

    const lan = `name_${ language }`;
    const participants = [ fixture?.participant_one_full[lan] || fixture?.participant_one_full.name_en, fixture?.participant_two_full[lan] || fixture?.participant_two_full.name_en ];
    let line = bet.Line ? '(' + bet.Line + ')' : null;
    if (market.Id === marketIds.handicap) line = `(${bet.BaseLine})`;
    let canBeCombinedValue = canBeCombined();

    let canNotBeCombined = !canBeCombinedValue ? <div className="betslip__error">{Translate.pickCanNotBeCombined}<span className="material-icons icon mr-2 align-middle text-red"></span>
    </div> : null;

    let betStatus = bet.Status;
    let betStatusMessage = betStatus !== lSportsConfig.betStatus.settled ? `${Translate.betSuspended} (Bet can not be placed)` : `${Translate.betSettled} (Bet can not be placed)`;

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
                <span>
                    {`${results && results.home_score } : ${results && results.away_score }`}
                </span>
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
    let printLive = isLive ? <span className="live-icon px-2 align-middle">{Translate.live}</span> : matchInfo;
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
        <React.Fragment>
            <div className="d-flex align-items-center">
                <a href className="del-slip"><i className="material-icons betslip__table-close pr-2" onClick={handleClose}>close</i></a>
                <div className="w-100 pl-2 border-left">
                    <p className="d-flex justify-content-between align-items-center">
                        <span className="l-name">{leagueName}</span>
                        <span className="l-name"> {printLive} </span>
                    </p>
                    <p className="d-flex justify-content-between align-items-center" onClick={() => openOddsModal(fixture,isLive)}>
                        <span className="team-name">
                            {participantArray[0].name_en}
                            <br />
                            {participantArray[1].name_en}
                        </span>
                        <span>
                            {isLive ? matchInfo : ''}
                        </span>
                        <span className={`betslip__odd ${isLive ? 'live__background' : 'prematch__background'} ${(bet.Status !== lSportsConfig.betStatus.active) ? 'betslip__lock': betClassName}`}>
                            { (bet.Status !== lSportsConfig.betStatus.active) ? <i className="material-icons fs-14 lock-icon"> lock </i> : Util.toFixedDecimal(bet.Price, oddType) }
                        </span>
                    </p>
                    <p className="d-flex justify-content-between align-items-center">
                        <span className="market-name"> {Util.marketNameFormatter(market[lan] || market.name_en, bet?.specifier || {}, participants)}։</span>
                    </p>
                    <p className="d-flex justify-content-between align-items-center">
                        <span className="pick-result">
                            {Translate.tip} { Util.outcomeFormatter(bet[ lan ] || bet.name_en, bet.specifier, bet.Id, lan) }
                            {line}
                        </span>
                    </p>
                    {canNotBeCombined}

                    {betStatusInfo}

                </div>
            </div>
        </React.Fragment>
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
        oddType: state.user.oddType
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeBet: (fixture, market, bet, provider) => dispatch(removeBet(fixture, market, bet, provider)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BetslipMultiBet));
