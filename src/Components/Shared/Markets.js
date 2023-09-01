import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash.groupby';
import filter from 'lodash.filter';
import orderBy from 'lodash.orderby';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import Bet from './Bet';
import { Translate } from '../../localization';
import CustomBet from './CustomBet';
import { lSportsConfig } from '../../config';
import { marketIds, handicapMarkets } from '../../config/markets';

// This component is not in use.
const Market = React.memo((props) => {
    let { Market, column, fixture, type, leagueName } = props;
    let Bets = Market ? Market.Bets : null;
    Bets = Util.sortBet(Bets, Market.Id);
    Bets = filter(Bets, (bet) => bet.Status === lSportsConfig.betStatus.active);
    let slicedBets = null;

    if (Bets.length > 0 && Bets[0].BaseLine !== undefined) {
        let orderedBets = orderBy(Bets, ['BaseLine'], 'asc');
        slicedBets = groupBy(orderedBets, function (bet) {
            return `${bet.BaseLine}`;
        });

        slicedBets = Object.values(slicedBets);
    } else {
        slicedBets = new Array(Math.ceil(Bets.length / column)).fill('').map(function () {
            return this.splice(0, column);
        }, Bets.slice());
    }

    let count = 0;
    let classForHandicap = Market.Id == handicapMarkets.indexOf( Market.Id ) > -1  ? 'handicap' : '';
    
    // Slice it on the 2 column basis for market Under Over and Both Team to Score
    if (Market.Id === 523) {
        slicedBets = new Array(Math.ceil(Bets.length / 2)).fill('').map(function () {
            return this.splice(0, column);
        }, Bets.slice());
    }
    
    const drawBets = slicedBets
        ? slicedBets.map((flex) => {
              count++;
              return (
                  <Grid container className={`mx-0 ${classForHandicap}`} key={count}>
                      {
                        handicapMarkets.indexOf( Market.Id ) > -1 && flex.every((b) => b.Status === lSportsConfig.betStatus.active) && <Grid item xs className={'ripple-bet anim handicap small-width'} >
                            {`(${flex[0].BaseLine})`}
                        </Grid> 
                     } 
                      {flex.map((item) => {
                          return (
                              <CustomBet
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
              );
          })
        : null;

    let line = Market.Line ? <span>{Market.Line}</span> : null;

    return (
        slicedBets &&
        slicedBets.length > 0 && (
            <div className="mx-auto match__bets market__odds pt-2">
                <span className="odd__title">
                    { handicapMarkets.indexOf( Market.Id ) > -1 ? 'Handicap' : (Util.marketNameFormatter(Market.name_en) )} {line}
                </span>
                {drawBets}
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
