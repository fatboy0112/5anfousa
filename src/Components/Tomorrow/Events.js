import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import InfiniteScroll from 'react-infinite-scroll-component';
import { slice } from 'lodash';
import Locations from './Locations';
import Matches from './Matches';
import MainMarketSelector from '../Shared/MainMarketSelector';
import Loading from '../Common/NewLoading';
import LoadingIcon from '../Common/LoadingIcon';
import ExtraOddsModal from '../Shared/ExtraOddsModal';
import {
    selectMainMarket,
    getSportEvents,
    search,
    getTomorrowLocations,
    setTomorrowResetPage,
    clearSportEvents,
    clearLocations,
    searchTomorrowEvents,
    getMarketData,
    setTomorrowSports,
    setLocationLoading,
} from '../../store/actions/tomorrowActions';
import { setCurrentEvent, clearStatistics, setStatistics, setExtraMarkets, selectExtraMarket } from '../../store/actions/lsports.global.actions';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import { intervalTime } from '../../config';
import find from 'lodash.find';

let sportEventInterval;
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
        this.props.setLocationLoading(true);
        sportEventInterval = setInterval(() => {
        let { mainEvents } = this.props;
        this.props.getMarketData(mainEvents, 0, mainEvents.length);
        this.props.setTomorrowSports();
        } , intervalTime);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // this.props.setTomorrowResetPage();

            if (!this.props.searchStarted) {
                // let sportId = this.props.selectedSport;
                // this.props.getSportEvents(sportId);
                // this.props.getTomorrowLocations(sportId);
            } else {
                this.props.search(this.props.searchValue);
            }
        }

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
        this.props.clearSportEvents();
        this.props.clearLocations();
        clearInterval(sportEventInterval);
    }

    openExtraOddsModal = (fixture) => {
        this.setState({ event: fixture }, () => {
            this.setState({ showExtraOddsModal: true });
            this.props.setCurrentEvent(fixture);
        });
    };

    getEventMarkets = () => {
        const startIndex = this.props.nextIndex || 0;
        const data = slice(this.props.partialAllEvents, 0, 20);
        this.props.getMarketData(data, startIndex, data.length);
    }

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
            if (!this.props.searchStarted) {
                let { nextIndex } = this.props;
                const data = slice(this.props.partialAllEvents, nextIndex, nextIndex + 20);
                this.props.getMarketData(data, nextIndex, data.length);
            } else {
                // if is in search page
                this.props.search(this.props.searchValue);
            }
        }
    };

    render() {
        let { showExtraOddsModal, event } = this.state;
        let {
            searchStarted,
            mainEvents,
            selectMainMarket,
            mainSelectedMarket,
            noSearchResults,
            noEvents,
            hasNextPage,
            searchTomorrowEvents,
            filteredTomorrowEvents,
            locations,
            locationsLoading,
            setExtraMarkets,
            selectExtraMarket
        } = this.props;
        
        let filteredMainEvents = noSearchResults ? [] : filteredTomorrowEvents.length > 0 ? filteredTomorrowEvents : mainEvents;
        
        let groupedEvents =
            filteredMainEvents &&
            filteredMainEvents[0] &&
            filteredMainEvents[0].sport_id &&
            groupBy(filteredMainEvents, function (event) {
                return `_${event.sport_id}`;
            });

        let matches = [];

        forEach(groupedEvents, (group, sportId) => {
            if (group.length > 0) {
                const groupSportId = group[0].sport_id;
                let marketSelector = (
                    <MainMarketSelector selectMainMarket={selectMainMarket} mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[groupSportId]} mainSelectedMarket={mainSelectedMarket} />
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
                        dataLength={filteredMainEvents.length}
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
            ) : noSearchResults || noEvents ? (
                <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
            ) : (
                !searchStarted && <Loading />
            );

        return (
            <div className="events__wrap pre-match-wrapper">
                <Locations {...this.props} handleSearch={searchTomorrowEvents} />
                { locations.length > 0 ? drawContent : !locationsLoading ? <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div> : <Loading /> }
            </div>
        );
    }
}

Events.propTypes = {
    selectedSport: PropTypes.number,
    mainEvents: PropTypes.array,
    selectMainMarket: PropTypes.func,
    mainSelectedMarket: PropTypes.number,
    noSearchResults: PropTypes.bool,
    noEvents: PropTypes.bool,
    getSportEvents: PropTypes.func,
    getTomorrowLocations: PropTypes.func,
    setTomorrowResetPage: PropTypes.func,
    clearSportEvents: PropTypes.func,
    clearLocations: PropTypes.func,
    setCurrentEvent: PropTypes.func,
    hasNextPage: PropTypes.bool,
    search: PropTypes.func,
    searchStarted: PropTypes.bool,
    searchValue: PropTypes.string,
    language: PropTypes.string,
    statisticsType: PropTypes.string,
    clearStatistics: PropTypes.func,
    setStatistics: PropTypes.func,
    locationsLoading: PropTypes.bool,
    setExtraMarkets: PropTypes.func,
    selectExtraMarket: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        selectedSport: state.tomorrow.selectedSport,
        mainEvents: state.tomorrow.mainEvents,
        mainSelectedMarket: state.tomorrow.mainSelectedMarket,
        noSearchResults: state.tomorrow.noSearchResults,
        noEvents: state.tomorrow.noEvents,
        hasNextPage: state.tomorrow.hasNextPage,
        searchStarted: state.tomorrow.searchStarted,
        searchValue: state.tomorrow.searchValue,
        language: state.general.language,
        statisticsType: state.lsportsGlobal.statisticsType,
        filteredTomorrowEvents: state.tomorrow.filteredTomorrowEvents,
        locations: state.tomorrow.locations,
        locationsLoading: state.tomorrow.locationsLoading,
        fetchedAll: state.tomorrow.fetchedAll,
        partialAllEvents: state.tomorrow.partialAllEvents,
        nextIndex: state.tomorrow.nextIndex,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectMainMarket: (marketId) => dispatch(selectMainMarket(marketId)),
        setCurrentEvent: (event) => dispatch(setCurrentEvent(event)),
        getSportEvents: (sportId) => dispatch(getSportEvents(sportId)),
        search: (value) => dispatch(search(value)),
        getTomorrowLocations: (sportId) => dispatch(getTomorrowLocations(sportId)),
        setTomorrowResetPage: () => dispatch(setTomorrowResetPage()),
        clearSportEvents: () => dispatch(clearSportEvents()),
        clearLocations: () => dispatch(clearLocations()),
        clearStatistics: () => dispatch(clearStatistics()),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        searchTomorrowEvents: (value) => dispatch(searchTomorrowEvents(value)),
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        selectExtraMarket: (marketName) => dispatch(selectExtraMarket(marketName)),
        getMarketData: (data, startIndex, count) => dispatch(getMarketData(data, startIndex, count)),
        setTomorrowSports: () => dispatch(setTomorrowSports()),
        setLocationLoading: (val) => dispatch(setLocationLoading(val))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
