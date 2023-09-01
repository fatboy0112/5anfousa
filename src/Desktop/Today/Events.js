import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import InfiniteScroll from 'react-infinite-scroll-component';
import { find, slice } from 'lodash';
import Locations from './Locations';
import Matches from './Matches';
import MarketHeader from '../Shared/MarketHeader';
import Loading from '../../Components/Common/NewLoading';
import LoadingIcon from '../../Components/Common/LoadingIcon';
// import ExtraOddsModal from '../../Components/Shared/ExtraOddsModal';
import ExtraOddsModal from '../Shared/ExtraOddsModal';
import StatisticsModal from '../../Components/Shared/StatisticsModal';
import {
    selectMainMarket,
    getSportEvents,
    search,
    getTodayLocations,
    setTodayResetPage,
    clearSportEvents,
    clearLocations,
    searchTodayEvents,
    getMarketData,
    setLocationLoading,
    setTodaySportsWithDateRangeDesktop,
    selectSport
} from '../../store/actions/todayActions';
import { setCurrentEvent, clearStatistics, setStatistics, setExtraMarkets, selectExtraMarket } from '../../store/actions/lsports.global.actions';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import { intervalTime } from '../../config';
import Util from '../../helper/Util';
import { staticPrematchSports } from '../../config/sports';
import { Translate } from '../../localization';
import { Link } from 'react-router-dom';
import includes from 'lodash.includes';

let sportEventInterval;
let toExtraMarket = false;
let frmXtraMrkt = false;
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
        this.props.setTodaySportsWithDateRangeDesktop();
        const { fromLivePage } = this.props;
        const lastUrl = localStorage.getItem('lastUrl');
        const fromExtraMarket = includes(lastUrl, '/extra-market/');
        const secondLastUrl = localStorage.getItem('secondLastUrl');
        if(false && this.props.mainEvents.length && this.props.partialAllEvents && fromExtraMarket) {
        } else {
            this.props.clearSportEvents();
            this.props.clearLocations();
            this.props.setLocationLoading(true);
        }
        sportEventInterval = setInterval(() => {
            this.refreshEvents();
        } , intervalTime);
    }

    refreshEvents = (retainSameEvents) => {
        let { mainEvents, partialAllEvents } = this.props;
        let toFilter = retainSameEvents ? mainEvents : partialAllEvents;
        partialAllEvents = toFilter.filter(event => Util.getFormattedDate(event.start_date) > new Date());
        
        mainEvents =  partialAllEvents.splice(0, mainEvents.length);
        this.props.getMarketData(mainEvents, 0, mainEvents.length);
        this.props.setTodaySportsWithDateRangeDesktop();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // this.props.setTodayResetPage();

            if (!this.props.searchStarted) {
                // let sportId = this.props.selectedSport;
                // this.props.getSportEvents(sportId);
                // this.props.getTodayLocations(sportId);
            } else {
                this.props.search(this.props.searchValue);
            }
        }

        if(prevProps.mainEvents !== this.props.mainEvents && this.state.showExtraOddsModal) {
            let fixture = find(this.props.mainEvents, (event) => event.fixture_id === this.props.extraMarketEvent.fixture_id);
            this.props.setCurrentEvent(fixture);
            this.setState({ event: fixture });
        }

        if(prevProps.fetchedAll !== this.props.fetchedAll && this.props.fetchedAll && (!frmXtraMrkt || this.props.selectedLocation === '' ) ){
            this.getEventMarkets();            
        } else if (this.props.fetchedAll && frmXtraMrkt) {
            frmXtraMrkt = false;
        }

       if (this.props.fromLivePage) {
           if (prevProps.currentSelectedMarket !== this.props.currentSelectedMarket) {
               if (this.props.currentSelectedMarket === 59) {
                   this.props.selectMainMarket(16);
               } 
               else if (this.props.currentSelectedMarket === 238) {
                   this.props.selectMainMarket(1);
               } 
               else this.props.selectMainMarket(this.props.currentSelectedMarket);
           }
       } 
    }

    componentWillUnmount() {
        const toLiveExtraMrkt = localStorage.getItem('toLiveExtraMrkt');

        if(toExtraMarket || toLiveExtraMrkt === 'true') {
            toExtraMarket = false;
            localStorage.setItem('toLiveExtraMrkt', false);
        } else {
            this.props.clearSportEvents();
            this.props.clearLocations();
           // this.props.selectSport(lSportsConfig.today.selectedSport);
        }
        clearInterval(sportEventInterval);
    }

    openExtraOddsModal = (fixture) => {
        toExtraMarket  = true;
        if(this.props.fromLivePage){
            this.props.openUpcomingExtraModal();
        }
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
        let { showExtraOddsModal, event, showStatisticsModal } = this.state;
        let {
            searchStarted,
            mainEvents,
            noSearchResults,
            noEvents,
            hasNextPage,
            statisticsType,
            searchTodayEvents,
            filteredTodayEvents,
            locations,
            locationsLoading,
            setExtraMarkets,
            selectExtraMarket,
            isLivePresent,
            selectedSport,
            limit: fromHomeLimit,
        } = this.props;
        
        let filteredMainEvents = noSearchResults ? [] : filteredTodayEvents.length > 0 ? filteredTodayEvents : mainEvents;
        if (fromHomeLimit) filteredMainEvents = filteredMainEvents.slice(0, fromHomeLimit);
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

                let groupMatches = <Matches selectExtraMarket ={selectExtraMarket} setExtraMarkets={setExtraMarkets} events={group} openMarketsModal={this.openExtraOddsModal} openStatisticsModal={this.openStatisticsModal} />;

                matches.push(
                    <table className="table mb-0">
                        {!isLivePresent && (
                        <thead>
                            <tr>
                                <th scope="col">&nbsp;</th>
                                <th scope="col">&nbsp;</th>
                                <th scope="col">&nbsp;</th>
                                <th scope="col">&nbsp;</th>
                                <MarketHeader mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[groupSportId]} />
                                <th scope="col">&nbsp;</th>
                            </tr>
                        </thead>
                        )}
                        {groupMatches}
                    </table>,
                );
            }
        });

        const noEventsContent =
            <table className="table mb-0">
                <thead>
                    <tr>
                        <th scope="col">&nbsp;</th>
                        {/* <th scope="col">&nbsp;</th> */}
                        <th scope="col">&nbsp;</th>
                        <th scope="col">&nbsp;</th>
                        <MarketHeader mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[selectedSport]} />
                        <th scope="col">&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan='9'>
                            <div className='no-data fs-15 pt-3 pl-3 pb-3'>
                                { Translate.nothingFound }
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>;

        const loadingContent =
            <table className="table mb-0">
                <thead>
                    <tr>
                        <th scope="col">&nbsp;</th>
                        {/* <th scope="col">&nbsp;</th> */}
                        <th scope="col">&nbsp;</th>
                        <th scope="col">&nbsp;</th>
                        <MarketHeader mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[selectedSport]} />
                        <th scope="col">&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan='9' className='p-0'><Loading customClass='odds-panel w-100 pt-0 mx-0'/> </td>
                    </tr>
                </tbody>
            </table>;

        let drawContent =
            matches.length > 0 ? (
                <React.Fragment>
                    <InfiniteScroll
                        dataLength={filteredMainEvents.length}
                        next={this.fetchMoreData}
                        hasMore={!fromHomeLimit && hasNextPage}
                        loader={<LoadingIcon theme="dark centered" />}
                        scrollThreshold = {0.95}
                        scrollableTarget="scrollableDiv"
                    >
                        {matches}
                    </InfiniteScroll>
                    {fromHomeLimit && <Link className='see-more-btn' to='/d/sports'>See more</Link>}

                    <div className="pb-4" />

                    {showExtraOddsModal && <ExtraOddsModal event={event} closeModal={this.closeExtraOddsModal} />}

                    {showStatisticsModal && statisticsType === 'forMatch' && <StatisticsModal closeModal={this.closeStatisticsModal} />}
                </React.Fragment>
            ) : noSearchResults || noEvents ? (
                noEventsContent
            ) : (
                !searchStarted && loadingContent
            );

        return (
            <React.Fragment>
                <div className={`table-responsive position-relative ${ fromHomeLimit && 'mt-4'}`}>
                    <span className="drawer" href>
                        <i className="icon-color">
                            <img src="/images/rounded.svg" alt="rounded" className='w-75'/>
                        </i>
                        { fromHomeLimit ? Translate.sports : 
                        <span className='ml-3'>{staticPrematchSports()[selectedSport]?.name}</span>
                        }
                    </span>
                    { <Locations {...this.props} handleSearch={searchTodayEvents} /> }
                    { locations.length > 0 ?
                            drawContent
                            : !locationsLoading ?
                                noEventsContent
                                : loadingContent 
                        }
                </div>
            </React.Fragment>
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
    getTodayLocations: PropTypes.func,
    setTodayResetPage: PropTypes.func,
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
        selectedSport: state.today.selectedSport,
        mainEvents: state.today.mainEvents,
        mainSelectedMarket: state.today.mainSelectedMarket,
        noSearchResults: state.today.noSearchResults,
        noEvents: state.today.noEvents,
        hasNextPage: state.today.hasNextPage,
        searchStarted: state.today.searchStarted,
        searchValue: state.today.searchValue,
        language: state.general.language,
        statisticsType: state.lsportsGlobal.statisticsType,
        filteredTodayEvents: state.today.filteredTodayEvents,
        locations: state.today.locations,
        locationsLoading: state.today.locationsLoading,
        fetchedAll: state.today.fetchedAll,
        partialAllEvents: state.today.partialAllEvents,
        nextIndex: state.today.nextIndex,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,
        selectedLeagues: state.today.selectedLeagues,
        selectedLocationList: state.today.selectedLocationList,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectMainMarket: (marketId) => dispatch(selectMainMarket(marketId)),
        selectSport: (sportId) => dispatch(selectSport(sportId)),
        setCurrentEvent: (event) => dispatch(setCurrentEvent(event)),
        getSportEvents: (sportId) => dispatch(getSportEvents(sportId)),
        search: (value) => dispatch(search(value)),
        getTodayLocations: (sportId) => dispatch(getTodayLocations(sportId)),
        setTodayResetPage: () => dispatch(setTodayResetPage()),
        clearSportEvents: () => dispatch(clearSportEvents()),
        clearLocations: () => dispatch(clearLocations()),
        clearStatistics: () => dispatch(clearStatistics()),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        searchTodayEvents: (value) => dispatch(searchTodayEvents(value)),
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        selectExtraMarket: (marketName) => dispatch(selectExtraMarket(marketName)),
        getMarketData: (data, startIndex, count) => dispatch(getMarketData(data, startIndex, count)),
        setTodaySportsWithDateRangeDesktop: () => dispatch(setTodaySportsWithDateRangeDesktop()),
        setLocationLoading: (val) => dispatch(setLocationLoading(val))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
