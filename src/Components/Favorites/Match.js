import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import find from 'lodash.find';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { lSportsConfig } from '../../config';
import Grid from '@material-ui/core/Grid';
import MainMarket from '../Shared/MainMarket';
import Participants from '../Shared/Match/Participants';
import ExtraMarkets from '../Shared/Match/ExtraMarkets';
import MatchResult from '../Shared/Match/MatchResult';
import Favorite from '../Shared/Match/Favorite';
import MatchDateTime from '../Shared/Match/MatchDateTime';
import { MARKET_FOR_OUTER_SLIDER } from '../../config/markets';

function Match(props) {
    const openExtraOddsModal = (event, count) => {
        if (count > 0) {
            props.setExtraMarkets(event.market);
            props.selectExtraMarket('All');
            props.openMarketsModal(event, liveStreamAvailable);
        } else {
            toastr.info('', 'There are no extra odds to show.');
        }
    };
    
    let { event, unsubscribeSingleEvents, liveStreamData, statsData} = props;
    const [ liveStreamAvailable, setLiveStreamAvailable] = useState(false);
    const [ streamURL, setStreamingURL] = useState(null);
    
    useEffect(() => {
        let selectedEvent = find(liveStreamData, (e) => e.matchId == event.fixture_id);
        if (selectedEvent && selectedEvent.live === '1') {
            setStreamingURL(selectedEvent.iframe);
            setLiveStreamAvailable(true);
        }
    }, [liveStreamData, event.fixture_id]);

    let fixtureStatus = event.fixture_status;
    let isLive = fixtureStatus === lSportsConfig.statuses.inplay;
    let livescore = event.Livescore;
    let leagueName = event.league?.Name;
    let sortedMarkets = event.market ? event.market : [];
    let mainMarketEvent = Object.values(sortedMarkets)[0];
    let fixMarketForLive = find(sortedMarkets, m => m.Id == MARKET_FOR_OUTER_SLIDER[event.sport_id][0].Id);
    let sortedMarketsLength = event.market ? Object.values(event.market).length : event.Market ? Object.values(event.Market) : null;
    let hasStatistics = event.Livescore?.Statistics ? true : false;
    if (statsData?.[+event.fixture_id]) {
        if (fixtureStatus == 2 && ['live', 'finished'].indexOf(statsData[+event.fixture_id].status_type) > -1) {
            hasStatistics = true;
        }
        if (fixtureStatus != 2 ) hasStatistics = true;
    }
    let participants = event.participants;
    let cards =  <Grid item xs={2} className="results__cards p-2"></Grid>;

    return (
        <div className="match__panel hybrid-tomorrow">
            <div className="width-95 mx-auto match__wrap">
                <div className="match__left">
                    <Favorite fixture={event} unsubscribeSingleEvents={unsubscribeSingleEvents} />
                    <MatchDateTime fixture={event} showDate={true} />
                </div>

                <div className="match__right">
                    <Grid container className="pl-xs mx-auto match__info">
                       
                        <Participants isInplay={isLive}  participants={participants} />
                        {isLive && <>
                            {cards}
                            <MatchResult isLive={isLive} livescore={livescore} />
                        </>}
                        
                        {/* <Statistics isDisabled={!hasStatistics} onClick={(e) => openStatisticsModal(event)} /> */}
                        {/* {isLive && <> <Grid item xs={1} className="p-1 text-right d-flex align-items-center justify-content-center">
                            {
                            liveStreamAvailable &&
                                <IconButton onClick={() => openLiveStreamModal(streamURL)}>
                                    <img className="stream-icon" alt="stream-icon" src="./images/smart-tv-live-new.svg"></img> 
                                </IconButton> 
                            }
                        </Grid>
                        </>} */}
                        <ExtraMarkets isInplay={isLive} extraMarketsNumber={sortedMarketsLength} onClick={(e) => openExtraOddsModal(event, sortedMarketsLength)} />
                    </Grid>

                    {isLive ? (
                        <MainMarket market={fixMarketForLive ? fixMarketForLive : []} fixture={event} type="live" leagueName={leagueName} />
                    ) : (
                        <MainMarket market={mainMarketEvent} fixture={event} type="sports" leagueName={leagueName} />
                    )}
                </div>
            </div>
        </div>
    );
}

Match.propTypes = {
    event: PropTypes.object,
    openMarketsModal: PropTypes.func,
    openStatisticsModal: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        mainSelectedMarket: state.home.mainSelectedMarket,
        statsData: state.general.statsData,
    };
};

export default connect(mapStateToProps)(Match);
