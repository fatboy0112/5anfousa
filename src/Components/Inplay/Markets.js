import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CustomMarket from '../Shared/CustomMarket';
import Util from '../../helper/Util';
import { MarketIdMapping } from '../../config/markets'

function Markets(props) {
    let { markets, fixture, type, leagueName,currentlySelectedMarket = 'All' } = props;
    const [liveMarkets, setLiveMarkets] = useState([]);
    useEffect(() => {
        setLiveMarkets(markets);
    },[markets]);
    
    useEffect(() => {
        markets && setLiveMarkets(Object.values(markets));
    },[markets, fixture]);
    
    const sortMarkets = (array, key) => {

        let sportId = props.fixture.sport_id;
        const order = Util.getExtraMarketName(sportId)[MarketIdMapping[currentlySelectedMarket]].marketIds;
        array.sort( (a, b) => {
          var A = a[key],
              B = b[key];

          let indA = order.indexOf(A);
          let indB = order.indexOf(B);
          if (indA == -1) indA = order.length - 1;
          if (indB == -1) indB = order.length - 1;

          if (indA < indB) {
              return -1;
          } else if (indA > indB) {
              return 1;
          }
          return 0;
          
        });
        
        return array;
      };

    const sortedMarkets = sortMarkets(liveMarkets, 'Id');

    //const sortedMarkets = orderBy(liveMarkets, ['Id'], 'asc');
    const drawMarkets = liveMarkets ? (
        <div className="match-panel-bottom pl-2 pr-2 modal-body">
            {sortedMarkets.map((market) => {
                return <CustomMarket
                Market={market}
                fixture={fixture}
                column={3} 
                key={market.Id} 
                type={type} 
                leagueName={leagueName} 
                />;
            })}
        </div>
    ) : (
        <div className="no-data fs-15 pt-3 pb-3">No data</div>
    );

    return drawMarkets;
}

Markets.propTypes = {
    fixture: PropTypes.object,
    markets: PropTypes.object,
    type: PropTypes.string,
    leagueName: PropTypes.string,
};

export default Markets;
