import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import { toastr } from 'react-redux-toastr';
import MainMarket from '../Shared/MainMarkets';
// import Statistics from '../Shared/Match/Statistics';
import Participants from '../Shared/Match/Participant';
import Favorite from '../../Components/Shared/Match/Favorite';
import MatchDateTime from '../../Components/Shared/Match/MatchDateTime';
import { MARKET_FOR_OUTER_SLIDER, MARKET_FOR_TABLE_VIEW_LIVEMATCH } from '../../config/markets';
import filter from 'lodash.filter';
import uniqBy from 'lodash.uniqby';
import groupBy from 'lodash.groupby';
import { withRouter } from 'react-router-dom';


function Match(props) {
    const openExtraOddsModal = (event, count) => {
        if (count > 0) {
            localStorage.setItem('toLiveExtraMrkt', true);
            props.openMarketsModal(event, liveStreamAvailable);
            props.history.push(`/d/live-bettingextra-market/${event.sport_id}/${event.fixture_id}/${liveStreamAvailable}`);
        } else {
            toastr.info('', 'There are no extra odds to show.');
        }
    };

    const [ liveStreamAvailable, setLiveStreamAvailable] = useState(false);
    const [ matchSelectedLine, setMatchLine ] = useState({});
    const [ streamURL, setStreamingURL] = useState(null);
    const [ streamUrlData, setStreamUrlData] = useState([]);

    let { event, mainSelectedMarket, liveStreamData, statsData } = props;

    useEffect (() => {
            let selectedEvents = filter(liveStreamData, (e) =>  e.matchId === event.fixture_id );
            selectedEvents = uniqBy(selectedEvents, (e) => e.iframe);
            if(selectedEvents.length && selectedEvents[0].live === '1') {
                setStreamUrlData(selectedEvents);
                setStreamingURL(selectedEvents[0].iframe);
                setLiveStreamAvailable(true);
            }
    }, [liveStreamData, event.fixture_id]);

    let mainMarkets = MARKET_FOR_TABLE_VIEW_LIVEMATCH[event.sport_id];
    let leagueName = event.league.Name;
    let sortedMarkets = event.Markets ? Object.values(event.Markets) : [];
    let sportId = event.sport.Id;
    let mainMarketEvent = find(sortedMarkets, (m) => m.Id === (mainSelectedMarket ? mainSelectedMarket : MARKET_FOR_OUTER_SLIDER[sportId][0].Id));
    // Next Goal 59 
    // Next Goal 1st Half 338

    let mixedMainMarket = {};
    if (mainSelectedMarket === 238)  {
        mixedMainMarket[mainSelectedMarket] = mainMarketEvent;
        mixedMainMarket[247] = find(sortedMarkets, (m) =>  m.Id === 247 );
    }

    // Remaining Match 238
    // Remaining Match 1st Half 247
    if (mainSelectedMarket === 59) {
        mixedMainMarket[mainSelectedMarket] = mainMarketEvent;
        mixedMainMarket[338] = find(sortedMarkets, (m) =>  m.Id === 338 );
    }
    
    // Under Over 2
    // Under Over 1st Half 21
    if (mainSelectedMarket === 2)  {
        mixedMainMarket[mainSelectedMarket] = mainMarketEvent;
        mixedMainMarket[21] = find(sortedMarkets, (m) =>  m.Id === 21 );
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
    return (
        <React.Fragment>
            <td>
                <Favorite fixture={event} />
            </td>
            <td className="fav-star">
                <MatchDateTime fixture={ event } showDate />
            </td>
            {/* <td>
                <MatchDateTime fixture={ event } showDate />
            </td> */}
            <td className="team-name">

                {/* <span>{ `${event.location.Name}/${event.league.Name}` }</span> */}
                <div className="team-detail">

                    <Participants participants={ event.participants } isInplay score={ event.Livescore }/>
                </div>
            </td>
            {/* <td class='statistics'>
                <Statistics isDisabled={!hasStatistics} onClick={(e) => openStatisticsModal(event)} /> */}


            {/* <i className="icon-statistics"></i> */}
            {/* </td> */}
            <div className="score-section">
                <p>
                    {event.Livescore?.home_score}
                    {/* { score ? score[1].Value : '-' } */}
                </p>
                <p>
                    {event.Livescore?.away_score}
                    {/* { score ? score[2].Value : '-' } */}
                </p>
            </div>

            {mainMarkets.slice(0,1).map((mainMarket,i) => {
                const { Id, col, isLine: isLineAvailable } = mainMarket;
                let mainMarketEvent = Object.values(event.Markets).find( mkt => mkt.Id === Id);
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
                <a href onClick={() => openExtraOddsModal(event, sortedMarketsLength, liveStreamAvailable)}>
                    +{ Object.keys(event.Markets).length }
                </a>
            </td>
        </React.Fragment>
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
