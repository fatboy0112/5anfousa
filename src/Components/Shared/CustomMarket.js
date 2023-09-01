import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash.groupby';
import filter from 'lodash.filter';
import orderBy from 'lodash.orderby';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import Bet from './Bet';
import { find } from 'lodash';
import { lSportsConfig } from '../../config';
import { useSelector } from 'react-redux';
import map from 'lodash.map';
import { OnlyActiveBets, SortBySecondary, TwoColumnMarketIds, UnderOverPairMarketIds, handicapMarkets, showScore, dynamicMarkets, stableMarketOnExtraMarket } from '../../config/markets';

// const BetBody = (props) => {
//     let { Market, fixture, type, leagueName, flex, count } = props;
//     let columns = 3;
//     if ([59, 338, 238, 247, 13, 339].indexOf(Market.Id) > -1) columns = 4;
//     if (Market.Id === 427) columns = 5;
//     if ([128,134 ,145 ,146 ,147 ,148 ,149 ,150, 163].indexOf(Market.Id) > -1) {
//         columns = Market.Bets.length;
//     }

//     let filterItems = (arr, query) => {
//         return arr.filter(el => {
//             return el.Name.indexOf(query) !== -1;
//         });
//     }
//     //if (Market.Id === 415) columns = 6;
//     // Separate structure for Market 1X2 and Under Over
//     if (Market.Id === 427) {
//         let newFlexObj = {};
//         newFlexObj['Under'] = filterItems(flex, 'Under');
//         newFlexObj['Over'] = filterItems(flex, 'Over');
//         let get427Bets = () => {
//             return (
//                 <>
//                     <div >
//                     <Grid className="match__bets_baseline" style={{ minWidth: `calc((100% - 12px) / ${columns})` }}>
//                         <span>Under</span>
//                     </Grid>
//                     <Grid className="match__bets_baseline" style={{ minWidth: `calc((100% - 12px) / ${columns})` }}>
//                         <span>Over</span>
//                     </Grid>
//                     </div>
//                     <div>
//                         <div className="d-flex">
//                     {newFlexObj['Under'].map((item) => {
//                         return (
//                             <CustomBet
//                                 fixture={fixture}
//                                 market={Market}
//                                 bet={item}
//                                 provider={Market}
//                                 isCentered={flex.length < 3}
//                                 type={type}
//                                 leagueName={leagueName}
//                                 key={item.Id}
//                                 column={columns}
//                             />
//                         );
//                     })}
//                     </div>
//                     <div className="d-flex">
//                     {newFlexObj['Over'].map((item) => {
//                         return (
//                             <CustomBet
//                                 fixture={fixture}
//                                 market={Market}
//                                 bet={item}
//                                 provider={Market}
//                                 isCentered={flex.length < 3}
//                                 type={type}
//                                 leagueName={leagueName}
//                                 key={item.Id}
//                                 column={columns}
//                             />
//                         );
//                     })}
//                     </div>
//                     </div>
//                 </>
//             );
//         };
//         return (
//             <>
//                 {flex[0].BaseLine && (
//                     <Grid className="match__bets_baseline" style={{ minWidth: `calc((100% - 12px) / ${columns})` }}>
//                         <span>{flex[0].BaseLine}</span>
//                     </Grid>
//                 )}
//                 {get427Bets()}
//             </>
//         );
//     } else if (Market.Id === 415) {
//         // Separate logic for Market 1X2 and Both Team To Score
//         let newFlexObj = {};
//         newFlexObj['Yes'] = filterItems(flex, 'Both Teams To Score');
//         newFlexObj['No'] = flex.filter( item => item.Name.indexOf("To Nil") !== -1 || item.Name.indexOf("Not To Score") !== -1);
//         let getMarket415Bets = () => {
//             return (
//                 <>
//                     <div>
//                     <Grid className="match__bets_baseline" style={{ minWidth: `calc((100% - 12px) / ${4})` }}>
//                         <span>Yes</span>
//                     </Grid>
//                     <Grid className="match__bets_baseline" style={{ minWidth: `calc((100% - 12px) / ${4})` }}>
//                         <span>No</span>
//                     </Grid>
//                     </div>
//                     <div>
//                         <div className="d-flex">
//                     {newFlexObj['Yes'].map((item) => {
//                         return (
//                             <CustomBet
//                                 fixture={fixture}
//                                 market={Market}
//                                 bet={item}
//                                 provider={Market}
//                                 isCentered={flex.length < 3}
//                                 type={type}
//                                 leagueName={leagueName}
//                                 key={item.Id}
//                                 column={columns}
//                             />
//                         );
//                     })}
//                     </div>
//                     <div className="d-flex">
//                     {newFlexObj['No'].map((item) => {
//                         return (
//                             <CustomBet
//                                 fixture={fixture}
//                                 market={Market}
//                                 bet={item}
//                                 provider={Market}
//                                 isCentered={flex.length < 3}
//                                 type={type}
//                                 leagueName={leagueName}
//                                 key={item.Id}
//                                 column={columns}
//                             />
//                         );
//                     })}
//                     </div>
//                     </div>
//                 </>
//             );
//         };
//         return (
//             <>
//                 {flex[0].BaseLine && (
//                     <Grid className="match__bets_baseline" style={{ minWidth: `calc((100% - 12px) / ${columns})` }}>
//                         <span>{flex[0].BaseLine}</span>
//                     </Grid>
//                 )}
//                 {getMarket415Bets()}
//             </>
//         );
//     } else
//         return (
//             <>
//                 {flex[0].BaseLine && (
//                     <Grid className="match__bets_baseline" style={{ minWidth: `calc((100% - 12px) / ${columns})` }}>
//                         <span>{flex[0].BaseLine}</span>
//                     </Grid>
//                 )}
//                 {flex.map((item) => {
//                     return (
//                         <CustomBet
//                             fixture={fixture}
//                             market={Market}
//                             bet={item}
//                             provider={Market}
//                             isCentered={flex.length < 3}
//                             type={type}
//                             leagueName={leagueName}
//                             key={item.Id}
//                             column={columns}
//                         />
//                     );
//                 })}
//             </>
//         );
// }

const CustomMarket = React.memo((props) => {
    let { Market, column, fixture, type, leagueName } = props;
    const lan = `name_${ useSelector((state) => state.general.language) }`;
    const participants = [ fixture?.participants[0][lan] || '', fixture?.participants[1][lan] || '' ];
    let Bets = Market ? Market.Bets : null;
    Bets = Util.sortBet(Bets, Market.Id, lan);
    const activeBet = lSportsConfig.betStatus.active;
    const isLive = fixture.fixture_status === lSportsConfig.statuses.inplay;

    let isShowScore = showScore.indexOf(Market.Id) > -1;
    let score = null;

    Bets = filter(Bets, (bet) => bet.Status !== lSportsConfig.betStatus.settled);

    if (isLive && stableMarketOnExtraMarket.indexOf(+Market.Id) > -1) {
        Bets = filter(Bets, (bet) => bet.isFavorite);
    }

    if (isShowScore && Bets.length > 0 && Bets[0].specifier && Bets[0].specifier?.score) {
        const activeOutcomes = Bets.filter(bet => bet.Status === lSportsConfig.betStatus.active);
        if(activeOutcomes.length > 0) score = activeOutcomes[0].specifier.score;
        else score = Bets[Bets.length - 1].specifier.score;
    }

    let slicedBets = null;
    // if (Market.status === lSportsConfig.marketStatus.settled || Market.status === lSportsConfig.marketStatus.cancelled) return null;
   
    // showing outcomes in 2 columns
    if (TwoColumnMarketIds.indexOf(Market.Id) > -1) {
        column = 2;
    }

    //This market id should be included in lSportsConfig sort
    if (SortBySecondary.indexOf(Market.Id) > -1) {
        Bets = orderBy(Bets, ['secondarySort', 'outcome_id'], 'asc');
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
    
    let isActive = false;
    for(let i=0; i<slicedBets.length; i++) {
        let check = find(slicedBets[i], (bet) => bet.Status === activeBet);
        if(check) {
            isActive = true;
            break;
        }
    }
    const drawBets = slicedBets
        ? slicedBets.map((flex) => {
            count++;
            const isHandicapVisible = !isHandicap || (isHandicap && flex.every((b) => b.Status === activeBet)) ? true : false;
                return (
                    <Grid container className={`mx-0 pl-1 ${isHandicap && 'handicap'} `} key={count}>
                        {
                            isHandicap && flex.every((b) => b.Status === activeBet) && <Grid item xs className={'ripple-bet anim handicap small-width'} >
                                { `(${flex[0].BaseLine})`}
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
                                    isAnyBetActive = {isActive}
                                />
                            );
                        })}
                    </Grid>
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
            <div className="mx-auto match__bets market__odds pt-2">
                <span className="odd__title">
                    { Util.marketNameFormatter(Market[lan] || Market.name_en, marketSpecifier || {}, participants)} {line}
                </span>
                {drawBets}
            </div>
        )
    );
});

CustomMarket.propTypes = {
    column: PropTypes.number,
    fixture: PropTypes.object,
    type: PropTypes.string,
    leagueName: PropTypes.string,
};

export default CustomMarket;
