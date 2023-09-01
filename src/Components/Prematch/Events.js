import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import InfiniteScroll from 'react-infinite-scroll-component';
import Matches from './Matches';
import MainMarketSelector from '../Shared/MainMarketSelector';
import Loading from '../Common/NewLoading';
import LoadingIcon from '../Common/LoadingIcon';
import ExtraOddsModal from '../Shared/ExtraOddsModal';
import { selectMainMarket, getPrematchLeagueEvents, setPrematchResetPage, clearLeagueEvents, getMarketData, searchEvents } from '../../store/actions/prematchActions';
import { setCurrentEvent, clearStatistics, setStatistics, setExtraMarkets, selectExtraMarket } from '../../store/actions/lsports.global.actions';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';

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
        sportEventInterval = setInterval(() => {
            let { mainEvents } = this.props;
            forEach(mainEvents, (event, i) => {
                this.props.getMarketData(event.fixture_id, 0, i, mainEvents.length, false, i === 0 ? true : false);
            });
        }, 300000);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // this.props.setPrematchResetPage();

            if (!this.props.searchValue !== '') {
                // this.props.getPrematchLeagueEvents(this.props.selectedLeague);
            } else {
                this.props.search(this.props.searchValue);
            }
        }
    }

    componentWillUnmount() {
        this.props.clearLeagueEvents();
        clearInterval(sportEventInterval);
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
            if (this.props.searchValue === '') {
                this.props.getPrematchLeagueEvents(this.props.nextIndex);
                // if is in main page
            } else {
                // if is in search page
                this.props.search(this.props.searchValue);
            }
        }
    };

    render() {
        let { showExtraOddsModal, event } = this.state;
        let { selectMainMarket, mainSelectedMarket, mainEvents, noSearchResults, noEvents, hasNextPage, searchValue, selectedSport, setExtraMarkets, selectExtraMarket } = this.props;

        let groupedEventsBySport =
            mainEvents &&
            mainEvents[0] &&
            mainEvents[0].sport_id &&
            groupBy(mainEvents, function (event) {
                return `_${event.sport_id}`;
            });

        // let groupedEventsByStatusAndSport = {};

        // forEach(groupedEventsByStatus, (group, status) => {
        //     let eventsGroup = groupBy(group, function (event) {
        //         return `_${event.sport_id}`;
        //     });

        //     groupedEventsByStatusAndSport[status] = eventsGroup;
        // });

        let matchesInplay = [];
        let matchesPrematch = [];


            
                forEach(groupedEventsBySport, (gr, sportId) => {
                    if (gr.length > 0) {
                        let marketSelector = (
                            <MainMarketSelector selectMainMarket={selectMainMarket} mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[selectedSport]} mainSelectedMarket={mainSelectedMarket} />
                        );

                        let groupMatches = <Matches selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} events={gr} openMarketsModal={this.openExtraOddsModal} openStatisticsModal={this.openStatisticsModal} />;

                        matchesPrematch.push(
                            <div key={`${sportId}`}>
                                {marketSelector}
                                {groupMatches}
                            </div>,
                        );
                    }
                })

        let matches = [...matchesInplay, ...matchesPrematch];

        let drawContent =
            matches.length > 0 ? (
                <div>
                    <InfiniteScroll
                        dataLength={mainEvents.length}
                        next={this.fetchMoreData}
                        hasMore={hasNextPage}
                        loader={<LoadingIcon theme="dark centered" />}
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
                searchValue === '' ? <Loading/> : <Loading/>
            );

        return <div className="events__wrap pre-match-wrapper">{drawContent}</div>;
    }
}

Events.propTypes = {
    selectedLeague: PropTypes.number,
    searchValue: PropTypes.string,
    mainEvents: PropTypes.array,
    searchStarted: PropTypes.bool,
    selectMainMarket: PropTypes.func,
    getPrematchLeagueEvents: PropTypes.func,
    setCurrentEvent: PropTypes.func,
    mainSelectedMarket: PropTypes.number,
    noSearchResults: PropTypes.bool,
    noEvents: PropTypes.bool,
    language: PropTypes.string,
    hasNextPage: PropTypes.bool,
    search: PropTypes.func,
    setPrematchResetPage: PropTypes.func,
    clearLeagueEvents: PropTypes.func,
    statisticsType: PropTypes.string,
    clearStatistics: PropTypes.func,
    setStatistics: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        selectedLeague: state.prematch.selectedLeague,
        searchValue: state.prematch.searchValue,
        mainEvents: state.prematch.mainEvents,
        searchStarted: state.prematch.searchStarted,
        mainSelectedMarket: state.prematch.mainSelectedMarket,
        noSearchResults: state.prematch.noSearchResults,
        noEvents: state.prematch.noEvents,
        language: state.general.language,
        hasNextPage: state.prematch.hasNextPage,
        statisticsType: state.lsportsGlobal.statisticsType,
        selectedSport: state.prematch.selectedSport,
        nextIndex: state.prematch.nextIndex,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectMainMarket: (marketId) => dispatch(selectMainMarket(marketId)),
        setCurrentEvent: (event) => dispatch(setCurrentEvent(event)),
        getPrematchLeagueEvents: (leagueId) => dispatch(getPrematchLeagueEvents(leagueId)),
        search: (value) => dispatch(searchEvents(value)),
        setPrematchResetPage: () => dispatch(setPrematchResetPage()),
        clearLeagueEvents: () => dispatch(clearLeagueEvents()),
        clearStatistics: () => dispatch(clearStatistics()),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        selectExtraMarket: (marketName) => dispatch(selectExtraMarket(marketName)),
        getMarketData: (fixture_id, startIndex, i, count, isSearch, clear) => dispatch(getMarketData(fixture_id, startIndex, i, count, isSearch, clear))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
