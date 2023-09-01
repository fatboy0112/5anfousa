import React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash.map';
import filter from 'lodash.filter';
import take from 'lodash.take';
import orderBy from 'lodash.orderby';
import Util from '../../helper/Util';
import MainBet from './MainBet';
import { lSportsConfig } from '../../config';
import { marketIds } from '../../config/markets';
import { groupBy } from 'lodash';

function MainMarket(props) {
    let { market, fixture, type, leagueName, areBetsAllSettled, selectedLine, column } = props;
    // let orderedProviders = market.Providers ? Util.orderProviders(market.Providers) : [];
    // let selectedProvider = orderedProviders.length > 0 ? orderedProviders[0] : [];
    let bets = market.Bets;
    
    if (!market.Bets){
        bets = [];
        for(let i =0 ; i < column.length; i++){
            let id = Math.random(16);
            let name = column[i];
            let aliasObj = {Id: `id_t${id}`, Name: name, Status: undefined};
            bets = [ ...bets, aliasObj ];
        }
    }

    bets = filter(bets, (bet) => bet);
    bets = Util.sortBet(bets, market.Id);
    // let orderedBets = orderBy(bets, ['BaseLine', 'Sort'], 'asc');
    let orderedBets = filter(bets, (bet) => bet.Status !== lSportsConfig.betStatus.settled);
    let countOfBets = 0;

    // market Under/Over - show started form line 2.5
    if (market.Id == marketIds.total) {
        if (selectedLine) orderedBets = filter(orderedBets, (bet) => +bet.Line == selectedLine);
        else orderedBets = filter(orderedBets, (bet) => +bet.Line > 2);
    }

    // 18 is 'Total' market id for Betradar
    let betsCount = market.Id == marketIds.total || market.Id == 28 || market.Id == marketIds.winner || market.Id == marketIds.oneTwoInclOvertime || market.Id == marketIds.underOverInclOvertime ? 2 : 3; // For any market with Under/Over we only want 2 fields
    if (orderedBets && orderedBets.length < betsCount){
        let count = betsCount - Object.keys(orderedBets).length;
        for(let i =0 ; i < count; i++){
            let id = Math.random(16);
            let name = orderedBets.map((bet)=>(bet.Name));
            name = column.filter(e => !name.includes(e));
            let aliasObj = {Id: `id_t${id}`,Name: name[0],Status: lSportsConfig.betStatus.suspended};
            orderedBets = [ ...orderedBets, aliasObj ];
        }
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

    // let betsCount = market.Id == 2 || market.Id == 28 || market.Id == 21 || market.Id == 52 ? 2 : 3; // For any market with Under/Over we only want 2 fields
    let drawBets =
        orderedBets.length > 0 ? (
            map(take(orderedBets, betsCount), (bet) => {
                if (!bet) {
                    return;
                }
                if (bet.Status !== lSportsConfig.betStatus.settled) {
                    countOfBets++;
                }
                if (countOfBets === 2 && bet.Status === lSportsConfig.betStatus.settled) {
                    return;
                }

                return <MainBet fixture={fixture} market={market} bet={bet} key={bet.Id} type={type} leagueName={leagueName} />;
            })
        ) : areBetsAllSettled && type === 'live' ? (
            Array(betsCount).fill(1).map(() => (
                <li
                    item
                    xs
                    className={`pl-2 pr-2 mx-xs ${
                        type === 'live' ? 'live__background' : 'prematch__background'
                    } text-center ripple-bet d-flex align-items-center justify-content-center `}
                >
                    <i className="material-icons"> lock </i>
                </li>
            ))
        ) : type !== 'sports' ? null : (
                Array(betsCount).fill(1).map(() => (
                    <li
                        item
                        xs
                        className={`pl-2 pr-2 mx-xs ${
                            type === 'live' ? 'live__background' : 'prematch__background'
                        } text-center ripple-bet d-flex align-items-center justify-content-center `}
                    >
                        <i className="material-icons"> lock </i>
                    </li>
            ))
        );

    return (
        <React.Fragment>           
            <ul>
                {column.map(col => <ol> { col } </ol>)}
            </ul>
            <ul className="">
                {drawBets}
            </ul>
        </React.Fragment>
    );
}

MainMarket.propTypes = {
    market: PropTypes.object,
    fixture: PropTypes.object,
    type: PropTypes.string,
    leagueName: PropTypes.string,
};

export default MainMarket;
