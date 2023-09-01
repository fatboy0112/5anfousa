import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash.groupby';
import filter from 'lodash.filter';
import orderBy from 'lodash.orderby';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import Bet from './Bet';
import { useSelector } from 'react-redux';
import { lSportsConfig } from '../../config';
import { dynamicMarkets, handicapMarkets, OnlyActiveBets, showScore, SortBySecondary, stableMarketOnExtraMarket, TwoColumnMarketIds, UnderOverPairMarketIds } from '../../config/markets';
import { map } from 'lodash';

const Market = React.memo((props) => {
    let { Market, column, fixture, type, leagueName } = props;
    // if (Market.status !== lSportsConfig.marketStatus.active) return null;
    const lan = `name_${ useSelector((state) => state.general.language) }`;
    const participants = [ fixture?.participants[0][lan] || '', fixture?.participants[1][lan] || '' ];
    let Bets = Market ? Market.Bets : null;
    const isLive = fixture.fixture_status === lSportsConfig.statuses.inplay;
    
    Bets = Util.sortBet(Bets, Market.Id, lan);
    const activeBet = lSportsConfig.betStatus.active;

    let isShowScore = showScore.indexOf(Market.Id) > -1;
    let score = null;
    if (isLive && stableMarketOnExtraMarket.indexOf(+Market.Id) > -1) {
        Bets = Bets.filter((bet) => bet.isFavorite);
    }
    Bets = filter(Bets, (bet) => bet.Status !== lSportsConfig.betStatus.settled);

    if (isShowScore && Bets.length > 0 && Bets[0].specifier && Bets[0].specifier?.score) {
        const activeOutcomes = Bets.filter(bet => bet.Status === lSportsConfig.betStatus.active);
        if(activeOutcomes.length > 0) score = activeOutcomes[0].specifier.score;
        else score = Bets[Bets.length - 1].specifier.score;
    }

    let slicedBets = null;

    //This market id should be included in lSportsConfig sort
    if (SortBySecondary.indexOf(Market.Id) > -1) {
        Bets = orderBy(Bets, ['secondarySort', 'outcome_id'], 'asc');
    }
    
    // showing outcomes in 2 columns
    if (TwoColumnMarketIds.indexOf(Market.Id) > -1) {
        column = 2;
    }

    slicedBets = new Array(Math.ceil(Bets.length / column)).fill('').map(function () {
        return this.splice(0, column);
    }, Bets.slice());

    // Only Active bets
    if (OnlyActiveBets.indexOf(Market.Id) > -1) {
        slicedBets = filter(slicedBets, (flex) => {
            return flex.some((bet) => bet.Status === activeBet);
        });
    }

    // Temp fix for remaining match & next goal markets 
    if ([7,8,61,62].indexOf(Market.Id) > -1) {
        let groupedBets = groupBy(slicedBets, 'BaseLine');
        slicedBets = filter(Object.values(groupedBets)[0], (flex) => {
            return flex.every((bet) => bet.Status === activeBet);
        });
    }

    // under over name sorting.
    if (UnderOverPairMarketIds.indexOf(Market.Id) > -1) {
        slicedBets = map(slicedBets, (betArray) => (
            orderBy(betArray, (bet) => (
                bet.name_en
            ), 'desc')
        ));
    }
    let count = 0;
    const isHandicap = handicapMarkets.indexOf( Market.Id ) > -1 ? true : false;
    
    
    const drawBets = slicedBets
        ? slicedBets.map((flex) => {
            count++;
            const isHandicapVisible = !isHandicap || (isHandicap && flex.every((b) => b.Status === activeBet)) ? true : false;
            return (
                <React.Fragment>
                    <Grid container className={`mx-0 justify-content-end ${isHandicap && 'handicap'} `} key={count}>
                        {
                            isHandicap && flex.every((b) => b.Status === activeBet) && <Grid item xs className={'ripple-bet anim handicap small-width'} >
                                {`(${flex[0].BaseLine})`}
                            </Grid> 
                        }
                        {isHandicapVisible && flex.map((item) => {
                            return (
                                <Bet
                                    fixture={fixture}
                                    market={Market}
                                    bet={item}
                                    provider={Market}
                                    isCentered={flex.length < 3}
                                    type={type}
                                    leagueName={leagueName}
                                    key={item.Id}
                                />
                            );
                        })}
                    </Grid>
                </React.Fragment>

            );
          })
        : null;

    let line = Market.Line ? <span>{Market.Line}</span> : null;

    let marketSpecifier = Bets[Bets.length - 1]?.specifier || {};

    if (dynamicMarkets.indexOf(+Market.Id) > -1) {
        const activeOutcomes = Bets.filter(bet => bet.Status === lSportsConfig.betStatus.active);
        if (activeOutcomes.length) marketSpecifier = activeOutcomes[0]?.specifier;
    }
    return (
        slicedBets &&
        slicedBets.length > 0 && (
            <div className="mx-auto five_e-mkt pt-2">
                <ul>
                    <li >
                        { Util.marketNameFormatter(Market[lan] || Market.name_en, marketSpecifier || {}, participants)} {line} { isShowScore && `(${score})` }
                    </li>
                </ul>
                <Grid container>
                    {drawBets}
                </Grid>
            </div>
        )
    );
});

Market.propTypes = {
    column: PropTypes.number,
    fixture: PropTypes.object,
    type: PropTypes.string,
    leagueName: PropTypes.string,
};

export default Market;
