import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import filter from 'lodash.filter';
import find from 'lodash.find';
import { toastr } from 'react-redux-toastr';
import MainMarket from '../Shared/MainMarkets';
import Participants from '../Shared/Match/Participant';
// import ExtraMarkets from '../../Components/Shared/Match/ExtraMarkets';
import Favorite from '../../Components/Shared/Match/Favorite';
import MatchDateTime from '../../Components/Shared/Match/MatchDateTime';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import groupBy from 'lodash.groupby';

function Match(props) {
    const openExtraOddsModal = (event, count) => {
        if (count > 0) {
            props.setExtraMarkets(event.market);
            props.selectExtraMarket('All');
            props.openMarketsModal(event);
        } else {
            toastr.info('', 'There are no extra odds to show.');
        }
    };

    const [ matchSelectedLine, setMatchLine ] = useState({});
    let { event, mainSelectedMarket, statsData } = props;
    let mainMarkets = MARKET_FOR_OUTER_SLIDER_PREMATCH[event.sport_id];
    let leagueName = event.league.Name;
    let sortedMarkets = event.market;
    let mainMarketEvent = find(sortedMarkets, (m) => m.Id === mainSelectedMarket);
    if (!mainMarketEvent) {
        mainMarketEvent = {
            Id: mainSelectedMarket,
            Name: '',
            Bets: null,
        };
    }
    sortedMarkets = filter(sortedMarkets, (m) => m.Id !== mainMarketEvent.Id);
    let sortedMarketsLength = sortedMarkets.length;
    if (mainMarketEvent === undefined) return null;
    let hasStatistics = event.has_live_statistics || event.has_prematch_statistics;
    if (statsData?.[+event.fixture_id]) {
        hasStatistics = true;
    }
    // let cards =  <Grid item xs={2} className="results__cards p-2"></Grid>;
    let mixedMainMarket = {};
    // Under Over 2
    // Under Over 1st Half 21
    if (mainSelectedMarket === 2)  {
        mixedMainMarket[mainSelectedMarket] = mainMarketEvent;
        mixedMainMarket[21] = find(sortedMarkets, (m) =>  m.Id === 21 );
    }

    // 1X2 1
    // 1st period winner 41
    if (mainSelectedMarket === 1)  {
        mixedMainMarket[mainSelectedMarket] = mainMarketEvent;
        mixedMainMarket[41] = find(sortedMarkets, (m) =>  m.Id === 41 );
    }
    return (
        <React.Fragment>
            <td>
                <Favorite fixture={event} />
            </td>
            <td className="fav-star">
                <MatchDateTime fixture={ event } showDate />
            </td>
            {/* <td className="time">
                <MatchDateTime fixture={ event } showDate />
            </td> */}
            <td className="team-name">
                {/* <span>{ event.league.Name }</span> */}
                <div className="team-detail">
                    <Participants participants={ event.participants } />
                </div>
            </td>
            <td>
                {/* <Statistics isDisabled={!hasStatistics} onClick={(e) => openStatisticsModal(event)} /> */}
                <div className="score-section">
                    <p>
                        -
                    </p>
                    <p>
                        -
                    </p>
                </div>                
                {/* <i className="icon-statistics"></i> */}
            </td>
            {mainMarkets.slice(0,3).map((mainMarket, i) => {
                const { Id, col, isLine: isLineAvailable } = mainMarket;
                let mainMarketEvent = Object.values(event.market).find( mkt => mkt.Id === Id);
                let listofLines = [];
                let indexOfSelectedLine = -1;
                let selectedLine = null;
                let lastMarketClass = i === 2 ? 'padd-left' : '';
                if (!mainMarketEvent) {
                    mainMarketEvent = { ...mainMarket };
                    // return <td className="odd-box 1 up-down-no" />;
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
                            {!!listofLines.length && (<i className={`material-icons icon-color ${indexOfSelectedLine < listofLines.length -1? 'visible' : 'invisible'}`} onClick={ () => {
                                if (indexOfSelectedLine < listofLines.length -1) setMatchLine((prev) => ({ ...prev, [event.fixture_id]: listofLines[indexOfSelectedLine + 1] }));
                            }}> keyboard_arrow_up </i>)}
                            <span>
                                
                                { selectedLine }
                            </span>
                            { !!listofLines.length && <i className={`material-icons icon-color ${indexOfSelectedLine > 0 ? 'visible' : 'invisible'}`} onClick={ () => {
                                if (indexOfSelectedLine > 0) setMatchLine((prev) => ({ ...prev, [event.fixture_id]: listofLines[indexOfSelectedLine - 1] }))
                            }}> keyboard_arrow_down </i>}
                        </td>
                        )}
                        <td className={`odd-box 1 ${lastMarketClass} priority-${i}`}>
                            <MainMarket market={mainMarketEvent} selectedLine={selectedLine} column={col} fixture={event} type="sports" leagueName={leagueName} />
                        </td>
                    </React.Fragment>
                );}
            )}
            <td className="next-match-btn">
                <a href onClick={() => openExtraOddsModal(event, sortedMarketsLength)}>
                    +{ Object.keys(event.market).length }
                </a>
            </td>
        </React.Fragment>
    );
}

Match.propTypes = {
    event: PropTypes.object,
    mainSelectedMarket: PropTypes.number,
    openMarketsModal: PropTypes.func,
    openStatisticsModal: PropTypes.func,
    setExtraMarkets: PropTypes.func,
    selectExtraMarket: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        mainSelectedMarket: state.home.mainSelectedMarket,
        statsData: state.general.statsData,
    };
};

export default connect(mapStateToProps)(Match);
