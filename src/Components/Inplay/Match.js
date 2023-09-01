import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import { toastr } from 'react-redux-toastr';
import { lSportsConfig } from '../../config';
import Grid from '@material-ui/core/Grid';
import MainMarket from '../Shared/MainMarket';
import Participants from '../Shared/Match/Participants';
import ExtraMarkets from '../Shared/Match/ExtraMarkets';
import MatchResult from '../Shared/Match/MatchResult';
import Favorite from '../Shared/Match/Favorite';
import MatchDateTime from '../Shared/Match/MatchDateTime';
import { hybridMarketHelperArray, MARKET_FOR_OUTER_SLIDER } from '../../config/markets';
import Util from '../../helper/Util';
import map from 'lodash.map';
import filter from 'lodash.filter';
import uniqBy from 'lodash.uniqby';
import { withRouter } from 'react-router-dom';


function Match(props) {
    const openExtraOddsModal = (event, count) => {
        if (count > 0) {
            // console.log('<<<<<<<<<<<<<<<<<', props, event);
            props.openMarketsModal(event, liveStreamAvailable);
        } else {
            toastr.info('', 'There are no extra odds to show.');
        }
    };

    const [ liveStreamAvailable, setLiveStreamAvailable] = useState(false);
    const [ streamURL, setStreamingURL] = useState(null);
    const [ streamUrlData, setStreamUrlData] = useState([]);

    let { event, mainSelectedMarket, liveStreamData, statsData } = props;

    useEffect (() => {
            let selectedEvents = filter(liveStreamData, (e) =>  e.matchId == event.fixture_id );
            selectedEvents = uniqBy(selectedEvents, (e) => e.iframe);
            if(selectedEvents.length && selectedEvents[0].live === '1') {
                setStreamUrlData(selectedEvents);
                setStreamingURL(selectedEvents[0].iframe);
                setLiveStreamAvailable(true);
            }
    }, [liveStreamData, event.fixture_id]);

    let isLive = event.fixture_status === lSportsConfig.statuses.inplay;
    let leagueName = event.league.Name;
    let sortedMarkets = event.Markets ? Object.values(event.Markets) : [];
    let sportId = event.sport?.Id;
    let mainMarketEvent = find(sortedMarkets, (m) => m.Id == (mainSelectedMarket ? mainSelectedMarket : MARKET_FOR_OUTER_SLIDER[sportId][0].Id));
    // Next Goal 8
    // Next Goal 1st Half 62

    let mixedMainMarket = {};
    if (mainSelectedMarket == 8)  {
        mixedMainMarket[mainSelectedMarket] = mainMarketEvent;
        mixedMainMarket[62] = find(sortedMarkets, (m) =>  m.Id == 62 );
    }

    // Remaining Match 7
    // Remaining Match 1st Half 61
    if (mainSelectedMarket == 7) {
        mixedMainMarket[mainSelectedMarket] = mainMarketEvent;
        mixedMainMarket[61] = find(sortedMarkets, (m) =>  m.Id == 61 );
    }
    
    // Under Over 18
    // Under Over 1st Half 68
    if (mainSelectedMarket == 18)  {
        mixedMainMarket[mainSelectedMarket] = mainMarketEvent;
        mixedMainMarket[68] = find(sortedMarkets, (m) =>  m.Id == 68 );
    }

    // if (!mainMarketEvent) {
    //     mainMarketEvent = Object.values(sortedMarkets)[0];
    // }
   // sortedMarkets = filter(sortedMarkets, (m) => m.Id !== mainMarketEvent.Id);
    let sortedMarketsLength = event.MarketsCount ? event.MarketsCount : (event.Markets ? Object.values(event.Markets).length : 0);
    let hasStatistics = true;
    if (statsData?.[+event.fixture_id] && ['live', 'finished'].indexOf(statsData[+event.fixture_id].status_type) > -1) {
        hasStatistics = true;
    }
    let statistics = event.Livescore && event.Livescore?.statistics ? event.Livescore?.statistics : null;
    let cards = sportId === lSportsConfig.sports.football.id && statistics ? Util.getRedCards(statistics) :  <Grid item xs={2} className="results__cards live_cards p-2"></Grid>;
    let count = 0;
    let isFirstHalf = event.Livescore.match_status === 6; // match status = 6 belongs to first half 
    return (
        <div id={event.fixture_id} className="match__panel hybrid">
            <div className="width-95 mx-auto match__wrap">
                <div className="match__left">
                    <Favorite fixture={event} />
                    <MatchDateTime fixture={event} showDate={false} />
                </div>

                <div className="match__right">
                    <Grid container className="pl-xs mx-auto match__info">
                        <Participants isInplay participants={event.participants} onClick={(e) => openExtraOddsModal(event, sortedMarketsLength, liveStreamAvailable)}  />
                        {cards}
                        <MatchResult isLive={isLive} livescore={event.Livescore} />
                        {/* <Statistics isDisabled={!hasStatistics} onClick={(e) => openStatisticsModal(event)} /> */}
                        {/* <Grid item xs={1} className="p-1 text-right d-flex align-items-center justify-content-center">
                            {
                            // liveStreamAvailable &&
                            //     (<IconButton onClick={() => openLiveStreamModal(streamUrlData)}>
                            //         <img className="stream-icon" alt="stream-icon" src="./images/smart-tv-live-new.svg"></img> 
                            //     </IconButton> )
                                // :
                                // <IconButton>
                                //     <img className="stream-icon stream_disabled" alt="stream-icon" src="./images/smart-tv.svg"></img> 
                                // </IconButton>
                            }
                        </Grid> */}
                        <ExtraMarkets isInplay extraMarketsNumber={sortedMarketsLength} onClick={(e) => openExtraOddsModal(event, sortedMarketsLength, liveStreamAvailable)} />
                    </Grid>
                    {mainMarketEvent ? (
                        isFirstHalf && (mainSelectedMarket === 7 || mainSelectedMarket === 8  || mainSelectedMarket === 18) ? (
                            map(mixedMainMarket, (item) => {
                                if (!item) return null;
                                count++;
                                const areBetsAllSettled = Util.checkBets(item.Bets);
                                return (
                                    <div className='hybrid-market-halftime'>
                                        {areBetsAllSettled && hybridMarketHelperArray[count] !== '' && (
                                            <span className={'pl-1 text-overflow text-gray-darker MuiGrid-item hybrid-halftime'}>{`${hybridMarketHelperArray[count]}`}</span>
                                        )}
                                        <MainMarket market={item} fixture={event} type="live" leagueName={leagueName} areBetsAllSettled={areBetsAllSettled} />
                                    </div>
                                );
                            })
                        ) : (
                            
                            <MainMarket market={mainMarketEvent} fixture={event} type="live" leagueName={leagueName} />
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
}

Match.propTypes = {
    event: PropTypes.object,
    mainSelectedMarket: PropTypes.string,
    openMarketsModal: PropTypes.func,
    openStatisticsModal: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        mainSelectedMarket: state.inplay.mainSelectedMarket,
        statsData: state.general.statsData,
    };
};

export default withRouter(connect(mapStateToProps)(React.memo(Match)));
