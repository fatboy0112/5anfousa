import React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash.map';
import filter from 'lodash.filter';
import take from 'lodash.take';
import orderBy from 'lodash.orderby';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import MainBet from './MainBet';
import { lSportsConfig } from '../../config';
import { marketIds } from '../../config/markets';
import { useSelector } from 'react-redux';
import groupBy from 'lodash.groupby';

function MainMarket(props) {
    let { market, fixture, type, leagueName, areBetsAllSettled } = props;
    const lan = `name_${ useSelector((state) => state.general.language) }`;
    // let orderedProviders = market.Providers ? Util.orderProviders(market.Providers) : [];
    // let selectedProvider = orderedProviders.length > 0 ? orderedProviders[0] : [];
    let bets = market.Bets;
    // bets = filter(bets, (bet) => bet)
    let orderedBets = Util.sortBet(bets, market.Id, lan);
    // let orderedBets = orderBy(bets, ['BaseLine', 'Sort'], 'asc');
    const { settled, suspended } = lSportsConfig.betStatus;
    orderedBets = filter(orderedBets, (bet) => bet.Status !== settled);
    // if (stableMarketsOnMainPage.indexOf(+market.Id) > -1) {
    //     orderedBets = orderedBets.filter((bet) => bet.isFavorite);
    //     areBetsAllSettled = true;
    // }
    let countOfBets = 0;

    // market Under/Over - show started form line 2.5
    if (market.Id == marketIds.total) {
        orderedBets = filter(orderedBets, (bet) => +bet?.specifier?.total > 2.25);
    }

    // fix to show only active lines for remaining match & next goal market
    if ([7, 8, 61, 62].indexOf(market.Id) > -1 && orderedBets.length) {
        let groupedBets = groupBy(orderedBets, 'BaseLine');
        let filteredBets = filter(Object.values(groupedBets), (flex) => {
            return flex.every((bet) => bet.Status == lSportsConfig.betStatus.active);
        });
        if (filteredBets.length) orderedBets = filteredBets[0];
    }

    // FIXME: Temp fix for remaining match market.
    if (market.Id == marketIds.teamWinRest || market.Id == marketIds.handicap || market.Id == marketIds.firstHalfTeamWinRest) {
        orderedBets = orderBy(orderedBets, ['Status', 'BaseLine', 'Sort'], 'asc');
        if(orderedBets.length > 0) {
            const [firstBet, secondBet, thirdBet, ...remainingBets] = orderedBets;
            const mainBets = orderBy([firstBet, secondBet, thirdBet], ['Sort'], 'asc');
            if( mainBets.length > 0 && remainingBets.length > 0 ){
                orderedBets = [...mainBets, ...remainingBets];
            }
            else if(mainBets.length > 0) {
                orderedBets = mainBets;
            }
        }
    } else 
    if (market.Id == marketIds.total || market.Id == marketIds.firstHalfTotal || market.Id == marketIds.underOverInclOvertime) {
        if(orderedBets.length > 0) {
            const [firstBet, secondBet, ...remainingBets] = orderedBets;
            let mainBets = orderBy([firstBet, secondBet], ['name_en'], 'desc');
            if( mainBets.length > 0 && remainingBets.length > 0 ){
                orderedBets = [...mainBets, ...remainingBets];
            }
            else if(mainBets.length > 0) {
                orderedBets = mainBets;
            }
        }
    }

    let betsCount = market.Id == marketIds.total || market.Id == marketIds.firstHalfTotal || market.Id == marketIds.exactGoal || market.Id == marketIds.underOverInclOvertime ? 2 : 3; // For any market with Under/Over we only want 2 fields
    let drawBets =
        orderedBets.length > 0 ? (
            map(take(orderedBets, betsCount), (bet) => {
                if (!bet) {
                    return;
                }
                if (bet.Status !== settled) {
                    countOfBets++;
                }
                if (countOfBets === suspended && bet.Status === settled) {
                    return;
                }

                return <MainBet fixture={fixture} market={market} bet={bet} key={bet.Id} type={type} leagueName={leagueName} />;
            })
        ) : areBetsAllSettled && type === 'live' ? (
            <Grid
                item
                xs
                className={`p-1 pl-2 pr-2 mx-xs border ${
                    type === 'live' ? 'live__background' : 'prematch__background'
                } text-center ripple-bet d-flex align-items-center justify-content-center `}
            >
                <i className="material-icons"> lock </i>
            </Grid>
        ) : type !== 'sports' ? null : (
            <Grid
                item
                xs
                className={`p-1 pl-2 pr-2 mx-xs border ${
                    type === 'live' ? 'live__background' : 'prematch__background'
                } text-center ripple-bet d-flex align-items-center justify-content-center `}
            >
                <i className="material-icons"> lock </i>
            </Grid>
        );

    return (
        <Grid container className="pl-xs mx-auto match__bets main-market__odds">
            <div className="pb-1 d-flex align-items-center w-100">{drawBets}</div>
        </Grid>
    );
}

MainMarket.propTypes = {
    market: PropTypes.object,
    fixture: PropTypes.object,
    type: PropTypes.string,
    leagueName: PropTypes.string,
};

export default MainMarket;
