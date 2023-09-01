import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Market from './Market';
import Util from '../../helper/Util';
import {MarketIdMapping} from '../../config/markets';

function Markets(props) {
    let { markets, fixture, type, leagueName,status} = props;
    const [liveMarkets, setLiveMarkets] = useState([]);

    useEffect(() => {
        setLiveMarkets(markets);
    },[markets,fixture]);
    
    useEffect(() => {
        markets && setLiveMarkets(Object.values(markets));
    },[markets, fixture]);

     let order ;
     const sortMarkets = (array, key) => {
        let sportId = props.fixture.sport_id;
        if(status === 'Live'){
             order = Util.getExtraMarketName(sportId)?.[MarketIdMapping['All']].marketIds;
        }else{
            order = Util.getExtraMarketNamePrematch(sportId)[MarketIdMapping['All']].marketIds;
        }
        array.sort( (a, b) => {
          var A = a[key],
              B = b[key];
          let indA = order.indexOf(A);
          let indB = order.indexOf(B);
          if (indA === -1) indA = order.length - 1;
          if (indB === -1) indB = order.length - 1;

          if (indA < indB) {
              return -1;
          } else if (indA > indB) {
              return 1;
          }
          return 0;
          
        });
        
        return array;
      };

     let sortedMarkets = sortMarkets(liveMarkets, 'Id');
     sortedMarkets = sortedMarkets.filter(obj => {
               let check = true;
                 if( Array.isArray(obj.Bets)){
                   check = obj.Bets.some(bet => bet.Status === 1);
                 }else{
                   let temp = Object.values(obj.Bets);
                   check = temp.some(t => t.Status === 1);
                 }
             return check;
     });
     sortedMarkets = sortedMarkets.filter(mar => mar.Bets);
     sortedMarkets = sortedMarkets.slice(0,5);
    const drawMarkets =
        <div className='w-100 d-flex'>
            <div className="match-panel-bottom px-1 pb-4 w-100 justify-content-start">
                {sortedMarkets.map((market) => {
                    return <Market 
                    Market={market}
                    fixture={fixture}
                    column={3} 
                    key={market.Id} 
                    type={type} 
                    leagueName={leagueName} 
                    />;
                })}
            </div>;
            {/* <div className='statistic-background w-50 justify-content-end'>
            </div>; */}
        </div>;

    return drawMarkets;
}

Markets.propTypes = {
    fixture: PropTypes.object,
    markets: PropTypes.object,
    type: PropTypes.string,
    leagueName: PropTypes.string,
};

export default Markets;
