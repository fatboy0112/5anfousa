import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import { addBet, removeBet } from '../../store/actions/betslip.actions';
import { lSportsConfig } from '../../config';

class Bet extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.bet.Price !== this.props.bet.Price) {
            let diffType = +this.props.bet.Price - +prevProps.bet.Price > 0 ? 'increased' : +this.props.bet.Price - +prevProps.bet.Price < 0 ? 'decreased' : '' ;
            
            if (diffType === 'increased') {
                if (document.getElementById('bet-' + this.props.bet.Id)) {
                    document.getElementById('bet-' + this.props.bet.Id).classList.remove('increased');
                    document.getElementById('bet-' + this.props.bet.Id).classList.remove('decreased');
                }
                setTimeout(() => {
                    if (document.getElementById('bet-' + this.props.bet.Id)) {
                        document.getElementById('bet-' + this.props.bet.Id).classList.add('increased');
                    }
                }, 100);
            }

            if (diffType === 'decreased') {
                if (document.getElementById('bet-' + this.props.bet.Id)) {
                    document.getElementById('bet-' + this.props.bet.Id).classList.remove('increased');
                    document.getElementById('bet-' + this.props.bet.Id).classList.remove('decreased');
                }
                setTimeout(() => {
                    if (document.getElementById('bet-' + this.props.bet.Id)) {
                        document.getElementById('bet-' + this.props.bet.Id).classList.add('decreased');
                    }
                }, 100);
            }
        }
    }

    handleToggle = (e) => {
        e.preventDefault();

        let { bet, fixture, market, provider, fixtures, leagueName } = this.props;

        let isActive =
            fixtures.length > 0 &&
            find(fixtures, {
                fixtureId: fixture.fixture_id ? fixture.fixture_id : fixture.FixtureId,
                markets: [{ Id: market.Id, bets: [{ Id: bet.Id }] }],
            });

        if (isActive) {
            this.props.removeBet(fixture, market, bet, provider?.Id);
        } else {
            this.props.addBet(fixture, market, bet, provider?.Id, leagueName);
        }
    };

    render() {
        let { bet, isCentered, fixture, market, fixtures, type, language } = this.props;
        let line = bet.Line ? '(' + bet.Line + ')' : null;
        const lan = `name_${ language }`;
        let isEuropeanHandicap = market.Id === 13;
        let colClass = isCentered ? 'mr-1 pr-1 pl-1  mb-1' : 'pr-1 pl-1 mr-1 mb-1';
        let span1Class = isCentered ? 'text-center py-1 odd__left odd__name' : 'text-center odd__left py-1 odd__name';
        let span2Class = isCentered ? 'text-center py-1 odd__right odd__price' : 'text-center  odd__right py-1 odd__price';

        let span3Class = isEuropeanHandicap ? 'handicap' : '';
        let gridClassName = '';
        if (bet.diff !== undefined && bet.diff !== 0) {

            if (bet.diff > 0) gridClassName = 'decreased';
            if (bet.diff < 0)  gridClassName = 'increased';
        }
        let isActive =
            fixtures.length > 0 &&
            find(fixtures, {
                fixtureId: fixture.fixture_id ? fixture.fixture_id : fixture.FixtureId ,
                markets: [{ Id: market.Id, bets: [{ Id: bet.Id }] }],
            })
                ? 'active'
                : '';
        let betStatus = bet.Status;
        let disableClass = '';

        let oddType = localStorage.getItem('oddType')  ? localStorage.getItem('oddType') : '' ;

        let drawBet =
            betStatus == lSportsConfig.betStatus.active ? (
                <Grid
                    item
                    xs
                    id={'bet-' + bet.Id}
                    className={`${colClass}  ${ type === 'live' ? 'live__background' : 'prematch__background'} ripple-bet anim ${isActive} ${gridClassName} ${disableClass} ${span3Class}`}
                    onClick={ betStatus == lSportsConfig.betStatus.active ? this.handleToggle : null}
                >
                    <span className={span1Class}>
                        { Util.outcomeFormatter(bet[ lan ] || bet.name_en, bet.specifier, bet.Id, lan) }
                    </span>
                    <span className={span2Class}>{Util.toFixedDecimal(bet.Price, oddType)}</span>
                </Grid>
            ) : (betStatus === lSportsConfig.betStatus.suspended || betStatus === lSportsConfig.betStatus.deactivated) ?
                <Grid
                    item
                    xs
                    id={'bet-' + bet.Id}
                    className={`${colClass}  ${ type === 'live' ? 'live__background' : 'prematch__background'} ripple-bet anim justify-content-center ${isActive} ${gridClassName} ${span3Class}`}
                    key={bet.Id}
                >
                    <i className="material-icons fs-16 py-2"> lock </i>
                </Grid>
            : null;

        return drawBet;
    }
}

Bet.propTypes = {
    fixtures: PropTypes.array,
    addBet: PropTypes.func,
    removeBet: PropTypes.func,
    bet: PropTypes.object,
    fixture: PropTypes.object,
    market: PropTypes.object,
    provider: PropTypes.object,
    isCentered: PropTypes.bool,
    count: PropTypes.number,
    // type: PropTypes.string,
    leagueName: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        fixtures: state.betslip.fixtures,
        count: state.betslip.count,
        oddType: state.user.oddType,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeBet: (fixture, market, bet, provider) => dispatch(removeBet(fixture, market, bet, provider)),
        addBet: (fixture, market, bet, provider, leagueName) => dispatch(addBet(fixture, market, bet, provider, leagueName)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Bet);
