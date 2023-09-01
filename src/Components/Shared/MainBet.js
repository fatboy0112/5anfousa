import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import { addBet, removeBet } from '../../store/actions/betslip.actions';
import { lSportsConfig } from '../../config';

class MainBet extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.bet.Price !== this.props.bet.Price) {
            let diffType = +this.props.bet.Price - +prevProps.bet.Price > 0 ? 'increased' : +this.props.bet.Price - +prevProps.bet.Price < 0 ? 'decreased' : '' ;
            if (diffType === 'increased') {
                if (document.getElementById('mainbet-' + this.props.bet.Id)) {
                    document.getElementById('mainbet-' + this.props.bet.Id).classList.remove('increased');
                    document.getElementById('mainbet-' + this.props.bet.Id).classList.remove('decreased');
                }
                setTimeout(() => {
                    if (document.getElementById('mainbet-' + this.props.bet.Id)) {
                        document.getElementById('mainbet-' + this.props.bet.Id).classList.add('increased');
                    }
                }, 100);
            }

            if (diffType === 'decreased') {
                if (document.getElementById('mainbet-' + this.props.bet.Id)) {
                    document.getElementById('mainbet-' + this.props.bet.Id).classList.remove('increased');
                    document.getElementById('mainbet-' + this.props.bet.Id).classList.remove('decreased');
                }
                setTimeout(() => {
                    if (document.getElementById('mainbet-' + this.props.bet.Id)) {
                        document.getElementById('mainbet-' + this.props.bet.Id).classList.add('decreased');
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
                fixtureId: fixture.FixtureId ? fixture.FixtureId : fixture.fixture_id,
                markets: [{ Id: market.Id, bets: [{ Id: bet.Id }] }],
            });

        if (isActive) {
            this.props.removeBet(fixture, market, bet, provider?.Id);
        } else {
            this.props.addBet(fixture, market, bet, provider?.Id, leagueName);
        }
    };

    render() {
        let { bet, fixture, market, fixtures, type, userData, language } = this.props;
        const lan = `name_${ language.toLowerCase() }`;
        let oddType = userData?.username && localStorage.getItem('oddType') ? localStorage.getItem('oddType') : '' ;
        // remove the line for markets remaining match and Next goal
        // if ([59, 238, 247, 338].indexOf(market.Id) !== -1) { 
        //     line = null;
        // }
        let isActive =
            fixtures.length > 0 &&
            find(fixtures, {
                fixtureId: fixture.FixtureId ? fixture.FixtureId : fixture.fixture_id,
                markets: [{ Id: market.Id, bets: [{ Id: bet.Id }] }],
            })
                ? 'active'
                : '';

        let gridClassName = '';
        if (bet.diff !== undefined && bet.diff !== 0) {
            if (bet.diff > 0) gridClassName = 'decreased';
            if (bet.diff < 0)  gridClassName = 'increased';
        }

        let betStatus = bet.Status;
        let disableClass = betStatus === lSportsConfig.betStatus.active ? '' : 'disabled';

        let drawBet =
            betStatus === lSportsConfig.marketStatus.settled ? ( // FIX: need to fix with actual status
                null
                // <Grid item xs className={'mx-xs border text-center ripple-bet d-flex align-items-center justify-content-center'}>
                //     <i className=" material-icons"> remove </i>
                // </Grid>
            ) : betStatus !== lSportsConfig.betStatus.active ? (
                <Grid
                    item
                    xs
                    id={'mainbet-' + bet.Id}
                    className={`p-1 pl-2 pr-2 mx-xs border ${ type === 'live' ? 'live__background' : 'prematch__background'} text-center ripple-bet d-flex align-items-center justify-content-center ${isActive}`}
                    key={bet.Id}
                >
                    <i className="material-icons"> lock </i>
                </Grid>
            ) :(
                <Grid
                    item
                    xs
                    id={`mainbet-${bet.Id}`}
                    className={`p-1 pl-2 pr-2 mx-xs border ${ type === 'live' ? 'live__background' : 'prematch__background'} ripple-bet anim  MuiGrid-item ${gridClassName} ${isActive} ${disableClass}`}
                    onClick={ betStatus === lSportsConfig.betStatus.active ? this.handleToggle : null}
                    key={bet.Id}
                >
                    <span className="odd__left odd__name">
                        { Util.outcomeFormatter(bet[ lan ] || bet.name_en, bet.specifier, bet.Id, lan) }
                        {/* {line} */}
                    </span>
                    <span className="odd__right odd__price">
                        {bet.Price ? Util.toFixedDecimal(bet.Price, oddType) : ''}
                    </span>
                </Grid>
            );

        return drawBet;
    }
}

MainBet.propTypes = {
    bet: PropTypes.object,
    fixture: PropTypes.object,
    market: PropTypes.object,
    provider: PropTypes.object,
    fixtures: PropTypes.array,
    addBet: PropTypes.func,
    removeBet: PropTypes.func,
    count: PropTypes.number,
    // type: PropTypes.string,
    leagueName: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        fixtures: state.betslip.fixtures,
        count: state.betslip.count,
        userData: state.user.data,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeBet: (fixture, market, bet, provider) => dispatch(removeBet(fixture, market, bet, provider)),
        addBet: (fixture, market, bet, provider, leagueName) => dispatch(addBet(fixture, market, bet, provider, leagueName)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainBet);
