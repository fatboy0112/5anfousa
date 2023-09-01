import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import { slice } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import Matches from './Matches';
import MainMarketSelector from '../Shared/MainMarketSelector';
import Loading from '../Common/NewLoading';
import LoadingIcon from '../Common/LoadingIcon';
import ExtraOddsModal from '../Shared/ExtraOddsModal';
import {
    selectMainMarket, getHomeActiveLeagueEvents, setHomeResetPage, clearHomeActiveLeagueEvents,
    getMarketData,
} from '../../store/actions/home.actions';
import { setCurrentEvent, clearStatistics, setStatistics, setExtraMarkets, selectExtraMarket } from '../../store/actions/lsports.global.actions';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import { intervalTime } from '../../config';
import find from 'lodash.find';

let sportEventInterval;
class League extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showExtraOddsModal: false,
            event: {},
            showStatisticsModal: false,
        };
    }

    componentDidMount() {
        sportEventInterval = setInterval(() => {
        let { mainEvents } = this.props;
        this.props.getMarketData(mainEvents, 0, mainEvents.length);
        } , intervalTime);
    }

    componentDidUpdate(prevProps) {
        if(prevProps.mainEvents !== this.props.mainEvents && this.state.showExtraOddsModal) {
            let fixture = find(this.props.mainEvents, (event) => event.fixture_id === this.props.extraMarketEvent.fixture_id);
            this.props.setCurrentEvent(fixture);
            this.setState({ event: fixture });
        }

        if(prevProps.fetchedAll !== this.props.fetchedAll && this.props.fetchedAll ){
            this.getEventMarkets();            
        }
    }

    componentWillUnmount() {
        this.props.clearHomeActiveLeagueEvents();
        clearInterval(sportEventInterval);
    }

    getEventMarkets = () => {
        const startIndex = this.props.nextIndex || 0;
        const data = slice(this.props.partialAllEvents, 0, 20);
        this.props.getMarketData(data, startIndex, data.length);
    }

    openExtraOddsModal = (fixture) => {
        this.setState({ event: fixture }, () => {
            this.setState({ showExtraOddsModal: true });
            this.props.setCurrentEvent(fixture);
        });
    };

    closeExtraOddsModal = () => {
        this.setState({ showExtraOddsModal: false });
    };

    openStatisticsModal = (fixture) => {
        this.setState({ showStatisticsModal: true });
        this.props.setStatistics(fixture.fixture_id, 'forMatch', 'prematch');
    };

    closeStatisticsModal = () => {
        this.setState({ showStatisticsModal: false });
        this.props.clearStatistics();
    };

    fetchMoreData = () => {
        if (this.props.hasNextPage) {
            let { nextIndex } = this.props;
            const data = slice(this.props.partialAllEvents, nextIndex, nextIndex + 20);
            this.props.getMarketData(data, nextIndex, data.length);
        }
    };

    render() {
        let { showExtraOddsModal, event } = this.state;
        let { selectMainMarket, mainSelectedMarket, mainEvents, noEvents, setExtraMarkets, selectExtraMarket } = this.props;

        let groupedEvents =
            mainEvents &&
            mainEvents[0] &&
            mainEvents[0].sport_id &&
            groupBy(mainEvents, function (event) {
                return `_${event.sport_id}`;
            });

        let matches = [];        
        forEach(groupedEvents, (group, sportId) => {
            if (group.length > 0) {
                let groupLeagueId = group[0].league_id;
                const groupSportId = group[0].sport_id;
                // Hide MainMarketSelector for NBA and UFC
                let marketSelector =
                    groupLeagueId === 64 || groupLeagueId === 14896 ? null : (
                        <MainMarketSelector selectMainMarket={selectMainMarket} mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[groupSportId]} mainSelectedMarket={mainSelectedMarket} />
                    );

                let groupMatches = <Matches selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} events={group} openMarketsModal={this.openExtraOddsModal} openStatisticsModal={this.openStatisticsModal} />;

                matches.push(
                    <div key={sportId}>
                        {marketSelector}
                        {groupMatches}
                    </div>,
                );
            }
        });

        let drawContent =
            matches.length > 0 ? (
                <div>
                    <InfiniteScroll
                        dataLength={mainEvents.length}
                        next={this.fetchMoreData}
                        hasMore={this.props.nextIndex < this.props.partialAllEvents.length}
                        loader={<LoadingIcon theme="dark centered" />}
                        scrollThreshold = {0.95}
                    >
                        {matches}
                    </InfiniteScroll>

                    <div className="pb-4" />

                    {showExtraOddsModal && <ExtraOddsModal event={event} closeModal={this.closeExtraOddsModal} />}

                    {/* {showStatisticsModal && statisticsType === 'forMatch' && <StatisticsModal closeModal={this.closeStatisticsModal} />} */}
                </div>
            ) : noEvents ? (
                <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
            ) : (
                <Loading />
            );

        return <div className="events__wrap pre-match-wrapper">{drawContent}</div>;
    }
}

League.propTypes = {
    selectedLeague: PropTypes.number,
    mainEvents: PropTypes.array,
    selectMainMarket: PropTypes.func,
    getHomeActiveLeagueEvents: PropTypes.func,
    setCurrentEvent: PropTypes.func,
    mainSelectedMarket: PropTypes.number,
    language: PropTypes.string,
    hasNextPage: PropTypes.bool,
    setHomeResetPage: PropTypes.func,
    clearHomeActiveLeagueEvents: PropTypes.func,
    noEvents: PropTypes.bool,
    statisticsType: PropTypes.string,
    clearStatistics: PropTypes.func,
    setStatistics: PropTypes.func,
    setExtraMarkets: PropTypes.func,
    selectExtraMarket: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        selectedLeague: state.home.selectedLeague,
        mainEvents: state.home.mainEvents,
        mainSelectedMarket: state.home.mainSelectedMarket,
        language: state.general.language,
        hasNextPage: state.home.hasNextPage,
        noEvents: state.home.noEvents,
        statisticsType: state.lsportsGlobal.statisticsType,
        fetchedAll: state.home.fetchedAll,
        partialAllEvents: state.home.partialAllEvents,
        nextIndex: state.home.nextIndex,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectMainMarket: (marketId) => dispatch(selectMainMarket(marketId)),
        setCurrentEvent: (event) => dispatch(setCurrentEvent(event)),
        getHomeActiveLeagueEvents: (leagueId) => dispatch(getHomeActiveLeagueEvents(leagueId)),
        setHomeResetPage: () => dispatch(setHomeResetPage()),
        clearHomeActiveLeagueEvents: () => dispatch(clearHomeActiveLeagueEvents()),
        clearStatistics: () => dispatch(clearStatistics()),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        selectExtraMarket: (marketName) => dispatch(selectExtraMarket(marketName)),
        getMarketData: (data, startIndex, count) => dispatch(getMarketData(data, startIndex, count)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(League);
