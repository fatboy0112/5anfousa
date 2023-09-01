import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { lSportsConfig } from '../../config';
import MainMarket from '../Shared/MainMarkets';
import Participants from '../Shared/Match/Participant';
import Favorite from '../../Components/Shared/Match/Favorite';
import MatchDateTime from '../../Components/Shared/Match/MatchDateTime';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import uniqBy from 'lodash.uniqby';
import filter from 'lodash.filter';
import groupBy from 'lodash.groupby';
import { withRouter } from 'react-router-dom';

function Match(props) {
    const openExtraOddsModal = (event, count, isLive) => {
        if (count > 0) {
            props.setExtraMarkets(event.market);
            props.selectExtraMarket('All');
            isLive ? props.history.push(`/d/live-bettingextra-market/${event.sport_id}/${event.fixture_id}/${liveStreamAvailable}`) :
        props.history.push(`/d/extra-market/${event.sport_id}/${event.fixture_id}`);

        } else {
            toastr.info('', 'There are no extra odds to show.');
        }
    };
    
    let { event, unsubscribeSingleEvents, liveStreamData, statsData} = props;
    const [ liveStreamAvailable, setLiveStreamAvailable] = useState(false);
    const [ streamURL, setStreamingURL] = useState(null);
    const [ streamUrlData, setStreamUrlData] = useState([]);
    const [ matchSelectedLine, setMatchLine ] = useState({});
    
    useEffect(() => {
        let selectedEvents = filter(liveStreamData, (e) => e.matchId == event.fixture_id);
        selectedEvents = uniqBy(selectedEvents, (e) => e.iframe);
        if (selectedEvents[0] && selectedEvents[0].live === '1') {
            setStreamUrlData(selectedEvents);
            setStreamingURL(selectedEvents.iframe);
            setLiveStreamAvailable(true);
        }
    }, [liveStreamData, event.fixture_id]); 

    let fixtureStatus = event.fixture_status;
    let isLive = fixtureStatus === lSportsConfig.statuses.inplay;
    let leagueName = event.league?.Name;
    let mainMarkets = MARKET_FOR_OUTER_SLIDER_PREMATCH[event.sport_id];

    let sortedMarketsLength = event.market ? Object.values(event.market).length : event.Market ? Object.values(event.Market) : null;
    let hasStatistics = event.Livescore?.Statistics ? true : false;
    if (statsData?.[+event.fixture_id]) {
        if (fixtureStatus == 2 && ['live', 'finished'].indexOf(statsData[+event.fixture_id].status_type) > -1) {
            hasStatistics = true;
        }
        if (fixtureStatus != 2 ) hasStatistics = true;
    }

    let score = event?.livescore;
    let liveParticipantProps = isLive ? { isInplay: true, score: score} : {};
    return (
        <React.Fragment>
            <td>
                <Favorite fixture={event} unsubscribeSingleEvents={unsubscribeSingleEvents} />
            </td>
            <td className="fav-star">                
                <MatchDateTime fixture={ event } showDate />
            </td>
            {/* <td className="time">
                <MatchDateTime fixture={ event } showDate />
            </td> */}
            <td className="team-name">
                <div className="team-detail">
                    <Participants participants={ event.participants } { ...liveParticipantProps }/>
                </div>
            </td>
            <td>
            <div className="score-section">
                    <p>
                        { score ? score.home_score : '-' }
                    </p>
                    <p>
                        { score ? score.away_score : '-' }
                    </p>
                </div>
                {/* <Statistics isDisabled={!hasStatistics} onClick={(e) => openStatisticsModal(event)} /> */}
                {/* {   isLive && liveStreamAvailable &&
                    <IconButton onClick={() => openLiveStreamModal(streamUrlData)}>
                        <img className="stream-icon" alt="stream-icon" src="./images/smart-tv-live-new.svg"></img> 
                    </IconButton> 
                } */}
                {/* <i className="icon-statistics"></i> */}
            </td>
            {mainMarkets.slice(0,1).map((mainMarket,i) => {
                const { Id, col, isLine: isLineAvailable } = mainMarket;
                let mainMarketEvent = Object.values(event.market).find( mkt => mkt.Id == Id);
                let listofLines = [];
                let selectedLine = null;
                let indexOfSelectedLine = -1;
                let lastMarketClass = i === 2 ? 'padd-left' : '';
                if (!mainMarketEvent) {
                    mainMarketEvent = { ...mainMarket };
                    // return <td className="odd-box 1" />;
                }
                if (isLineAvailable && mainMarketEvent?.Bets) {
                    let orderedBets = filter(mainMarketEvent?.Bets, (bet) => +bet.Line > 2 && +bet.Status === 1);
                    listofLines = Object.keys(groupBy(orderedBets, 'Line'));
                    listofLines = listofLines.map(Number)?.sort((a,b) => a-b);
                    selectedLine = matchSelectedLine[event.fixture_id] || listofLines?.[0];
                    indexOfSelectedLine = listofLines.indexOf(selectedLine);
                }
                return (
                    <React.Fragment>
                        { isLineAvailable && (
                        <td className={`up-down-no priority-${i}`}>
                            { !!listofLines.length && <i className={`material-icons icon-color ${indexOfSelectedLine < listofLines.length -1? 'visible' : 'invisible'}`} onClick={ () => {
                                if (indexOfSelectedLine < listofLines.length -1) setMatchLine((prev) => ({ ...prev, [event.fixture_id]: listofLines[indexOfSelectedLine + 1] }));
                            }}> keyboard_arrow_up </i> }
                            <span>
                                {/* <select
                                    className='line-select'
                                    onChange={(e) => {
                                        if(e.target && e.target.value) {
                                            const { value } = e.target;
                                            setMatchLine((prev) => ({ ...prev, [event.fixture_id]: value }));
                                        }} }
                                >
                                    { listofLines.map(line => <option selected={selectedLine === line}> { line }</option>)}
                                </select>  */}
                                { selectedLine }
                            </span>
                            { !!listofLines.length && <i className={`material-icons icon-color ${indexOfSelectedLine > 0 ? 'visible' : 'invisible'}`} onClick={ () => {
                                if (indexOfSelectedLine > 0) setMatchLine((prev) => ({ ...prev, [event.fixture_id]: listofLines[indexOfSelectedLine - 1] }))
                            }}> keyboard_arrow_down </i>}
                        </td>
                        )}
                        <td className={`odd-box 1 ${lastMarketClass} priority-${i}`}>
                            <MainMarket market={mainMarketEvent} selectedLine={selectedLine} column={col} fixture={event} type="live" leagueName={leagueName} />
                        </td>
                    </React.Fragment>
                );}
            )}
            <td className="next-match-btn">
                <a href onClick={() => openExtraOddsModal(event, sortedMarketsLength,isLive)}>
                    +{ Object.keys(event.market).length }
                </a>
            </td>
        </React.Fragment>
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

export default withRouter(connect(mapStateToProps)(Match));
