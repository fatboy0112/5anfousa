import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import { addBet, removeBet } from '../../store/actions/betslip.actions';
import { lSportsConfig } from '../../config';

class CustomBet extends Component {

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
        let { bet, isCentered, fixture, market, fixtures, type, column, userData } = this.props;
        const { active, suspended } = lSportsConfig.betStatus;
        let colClass = isCentered ? 'mb-1 border pr-1 pl-1  ' : 'pr-1 pl-1 mr-1 mb-1 border';
        let span2Class = isCentered ? 'odd__right odd__price' : 'text-center  odd__right py-1 odd__price';
        let oddType = userData?.username && localStorage.getItem('oddType') ? localStorage.getItem('oddType') : '' ;

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
        let drawBet =
            betStatus === active ? (
                <Grid
                    item
                    xs
                    id={'bet-' + bet.Id}
                    className={`${colClass}  ${ type === 'live' ? 'live__background' : 'prematch__background'} ripple-bet anim justify-content-center ${isActive} ${gridClassName} ${disableClass} `}
                    onClick={ betStatus === active ? this.handleToggle : null}
                    key={bet.Id}
                    style={{ minWidth: `calc((100% - 12px) / ${column})`}}
                >
                    <span className={span2Class}>{Util.toFixedDecimal(bet.Price, oddType)}</span>
                </Grid>
            ) 
            : betStatus === suspended ? (
                <Grid
                    item
                    xs
                    id={'bet-' + bet.Id}
                    className={`${colClass} ripple-bet anim ${isActive} ${gridClassName} ${disableClass}`}
                    onClick={ betStatus === active ? this.handleToggle : null}
                    key={bet.Id}
                    style={{ minWidth: `calc((100% - 12px) / ${column})`, background: 'unset' } }
                >
                   <span className={`suspended-odd`}>{Util.toFixedDecimal(bet.Price, oddType)}</span>
                </Grid> )
               : null;

        return drawBet;
    }
}

CustomBet.propTypes = {
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
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeBet: (fixture, market, bet, provider) => dispatch(removeBet(fixture, market, bet, provider)),
        addBet: (fixture, market, bet, provider, leagueName) => dispatch(addBet(fixture, market, bet, provider, leagueName)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CustomBet));
