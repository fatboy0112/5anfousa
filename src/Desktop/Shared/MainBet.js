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
        let { bet, fixture, market, fixtures, type } = this.props;
        let line = bet.Line ? `(${bet.Line})` : null;
        const { active, suspended, settled, deactivated } = lSportsConfig.betStatus;
        // remove the line for markets remaining match and Next goal
        // TODO: to update as betradar
        if ([59, 238, 247, 338].indexOf(market.Id) !== -1) { 
            line = null;
        }
        let isActive =
            fixtures.length > 0 &&
            find(fixtures, {
                fixtureId: fixture.FixtureId ? fixture.FixtureId : fixture.fixture_id,
                markets: [{ Id: market.Id, bets: [{ Id: bet.Id }] }],
            })
                ? 'odd-active'
                : '';

        let gridClassName = '';
        if (bet.diff !== undefined && bet.diff !== 0) {
            if (bet.diff > 0) gridClassName = 'decreased';
            if (bet.diff < 0)  gridClassName = 'increased';
        }

        let oddType = localStorage.getItem('oddType')  ? localStorage.getItem('oddType') : '' ;

        let betStatus = bet.Status;
        let disableClass = betStatus === active ? '' : 'disabled';

        let drawBet =
        betStatus === undefined ? (
            <li
                item
                xs
                id={'mainbet-' + bet.Id}
                className={`pl-2 pr-2 mx-xs ml-1 text-center ripple-bet d-flex align-items-center justify-content-center ${isActive}`}
                key={bet.Id}
            >
                <i className="material-icons"> lock </i>
            </li>
           ) : betStatus === settled ? (
                <li
                    item
                    xs
                    id={'mainbet-' + bet.Id}
                    className={`pl-2 pr-2 mx-xs text-center ripple-bet d-flex align-items-center justify-content-center ${isActive}`}
                    key={bet.Id}
                >
                    <i className="material-icons"> lock </i>
                </li>
                // null
                // <Grid item xs className={'mx-xs border text-center ripple-bet d-flex align-items-center justify-content-center'}>
                //     <i className=" material-icons"> remove </i>
                // </Grid>
            ) : betStatus === suspended || betStatus === deactivated ? (
                <li
                    item
                    xs
                    id={'mainbet-' + bet.Id}
                    className={`pl-2 pr-2 mx-xs ml-1 text-center ripple-bet d-flex align-items-center justify-content-center ${isActive}`}
                    key={bet.Id}
                >
                    <i className="material-icons"> lock </i>
                </li>
            ) :(
                <li
                    item
                    xs
                    id={`mainbet-${bet.Id}`}
                    className={`pl-2 pr-2 mx-xs ml-1 ripple-bet anim  MuiGrid-item ${gridClassName} ${isActive} ${disableClass}`}
                    onClick={ betStatus === active ? this.handleToggle : null}
                    key={bet.Id}
                >
                    {/* <span className="odd__left odd__name">
                        {bet.Name}
                        {line}
                    </span> */}
                    {/* <span className="odd__right odd__price"> */}
                    {Util.toFixedDecimal(bet.Price, oddType)}
                    {/* </span> */}
                </li>
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
        oddType: state.user.oddType
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeBet: (fixture, market, bet, provider) => dispatch(removeBet(fixture, market, bet, provider)),
        addBet: (fixture, market, bet, provider, leagueName) => dispatch(addBet(fixture, market, bet, provider, leagueName)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainBet);
