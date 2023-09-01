import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import {slice} from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import Matches from './Matches';
import MainMarketSelector from '../Shared/MainMarketSelector';
import Loading from '../Common/Loading';
import LoadingIcon from '../Common/LoadingIcon';
import ExtraOddsModal from '../Shared/ExtraOddsModal';
import { selectMainMarket, getSportEvents, setLastMinuteResetPage, clearSportEvents, setClearData } from '../../store/actions/lastMinuteActions';
import { setCurrentEvent, clearStatistics, setStatistics, setExtraMarkets, selectExtraMarket } from '../../store/actions/lsports.global.actions';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';

class Events extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showExtraOddsModal: false,
            event: {},
            showStatisticsModal: false,
        };
    }
    componentDidMount() {
        // sportEventInterval = setInterval(() => {
        // let sportId = this.props.selectedSport;
        // // this.props.getSportEvents(sportId);
        // } , 60000);
        // if(this.props.fetchedAll) {
        // }
        this.props.setClearData();
    }

    componentDidUpdate(prevProps) {
        let sportId = this.props.selectedSport;
        // if (prevProps.language !== this.props.language) {
        //     this.props.setLastMinuteResetPage();

        //     let sportId = this.props.selectedSport;
        //     this.props.getSportEvents(sportId);
        // }
        if(prevProps.allData !== this.props.allData && this.props.fetchedAll ){
            // const data = this.props.allData[sportId].slice(20);
            const data = slice(this.props.allData[sportId], 0, 20);
            this.props.getSportEvents(data, 0, data.length);
        }
        if( prevProps.selectedSport !== sportId) {
            const data = slice(this.props.allData[sportId], 0, 20);
            this.props.getSportEvents(data, 0, data.length);
        }
    }

    componentWillUnmount() {
        this.props.setClearData();
        // this.props.clearSportEvents();
        // this.props.setLastMinuteResetPage();
        // clearInterval(sportEventInterval);
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
        let statsTemplateType = fixture.has_prematch_statistics ? 'prematch' : fixture.has_live_statistics ? 'live' : '';
        this.setState({ showStatisticsModal: true });
        this.props.setStatistics(fixture.fixture_id, 'forMatch', statsTemplateType);
    };

    closeStatisticsModal = () => {
        this.setState({ showStatisticsModal: false });
        this.props.clearStatistics();
    };

    fetchMoreData = () => {
        if (this.props.hasNextPage) {
            let { nextIndex, selectedSport } = this.props;
            const data = slice(this.props.allData[selectedSport], nextIndex, nextIndex + 20);
            this.props.getSportEvents(data, nextIndex, data.length);
        }
    };

    render() {
        let { showExtraOddsModal, event } = this.state;
        let { mainEvents, selectMainMarket, mainSelectedMarket, noEvents, hasNextPage, selectedSport, setExtraMarkets, selectExtraMarket } = this.props;

        let groupedEvents =
            mainEvents &&
            mainEvents[0] &&
            mainEvents[0].sport_id &&
            groupBy(mainEvents, function (event) {
                return `_${event?.sport_id}`;
            });
        let matches = [];

        forEach(groupedEvents, (group, sportId) => {
            if (group.length > 0) {
                let marketSelector = (
                    <MainMarketSelector selectMainMarket={selectMainMarket} mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[selectedSport]} mainSelectedMarket={mainSelectedMarket} />
                );

                let groupMatches = <Matches selectExtraMarket ={selectExtraMarket} setExtraMarkets={setExtraMarkets} events={group} openMarketsModal={this.openExtraOddsModal} openStatisticsModal={this.openStatisticsModal} />;

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
                        hasMore={hasNextPage}
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

Events.propTypes = {
    selectedSport: PropTypes.number,
    mainEvents: PropTypes.array,
    selectMainMarket: PropTypes.func,
    mainSelectedMarket: PropTypes.number,
    noEvents: PropTypes.bool,
    setCurrentEvent: PropTypes.func,
    clearSportEvents: PropTypes.func,
    getSportEvents: PropTypes.func,
    setLastMinuteResetPage: PropTypes.func,
    hasNextPage: PropTypes.bool,
    language: PropTypes.string,
    statisticsType: PropTypes.string,
    clearStatistics: PropTypes.func,
    setStatistics: PropTypes.func,
    fetchedAll: PropTypes.bool,
};

const mapStateToProps = (state) => {
    return {
        selectedSport: state.lastMinute.selectedSport,
        mainEvents: state.lastMinute.mainEvents,
        mainSelectedMarket: state.lastMinute.mainSelectedMarket,
        noEvents: state.lastMinute.noEvents,
        hasNextPage: state.lastMinute.hasNextPage,
        language: state.general.language,
        statisticsType: state.lsportsGlobal.statisticsType,
        fetchedAll: state.lastMinute.fetchedAll,
        allData: state.lastMinute.allData,
        nextIndex: state.lastMinute.nextIndex,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectMainMarket: (marketId) => dispatch(selectMainMarket(marketId)),
        setCurrentEvent: (event) => dispatch(setCurrentEvent(event)),
        clearSportEvents: () => dispatch(clearSportEvents()),
        getSportEvents: (eventsArray, startIndex, count) => dispatch(getSportEvents(eventsArray, startIndex, count)),
        setLastMinuteResetPage: () => dispatch(setLastMinuteResetPage()),
        clearStatistics: () => dispatch(clearStatistics()),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        selectExtraMarket: (marketName) => dispatch(selectExtraMarket(marketName)),
        setClearData: () => dispatch(setClearData()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
