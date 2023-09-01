import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import { slice, sortBy } from 'lodash';
import { setHomeLeagues, setHomeActive, setHomeLeaguesActive, removeHomeActiveLeague, getMarketData, selectHomeActiveLeague, getHomeActiveLeagueEvents } from '../../store/actions/home.actions';
import { getTodaySports, selectSportMobile } from '../../store/actions/todayActions';
import { getStatsData, getBanners } from '../../store/actions/general.actions';
import {  selectPreSport } from '../../store/actions/prematchActions';
import TopLinks from '../TopLinks';
import TopLeague from '../TopLeague';
import { intervalTime } from '../../config';
import Loading from '../../Components/Common/NewLoading';
import { setStatistics } from '../../store/actions/lsports.global.actions';
import Betslip from '../Betslip';
import Inplay from './index';
// import Upcoming from '../Today';
import { withRouter } from 'react-router-dom';
import BannerCarousel from '../Common/Banner/BannerCarousel';
import { staticPrematchSports } from '../../config/sports';

let sportEventInterval;
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showExtraOddsModal: false,
            event: {},
            showStatisticsModal: false,
        };
    }
    componentDidMount() {
        this.props.getBanners();
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

    getEventMarkets = () => {
        const startIndex = this.props.nextIndex || 0;
        const data = slice(this.props.partialAllEvents, 0, 20);
        this.props.getMarketData(data, startIndex, data.length);
    }

    openStatisticsModal = (fixture) => {
        // let statsTemplateType = fixture.has_prematch_statistics ? 'prematch' : fixture.has_live_statistics ? 'live' : '';
        this.setState({ showStatisticsModal: true });
        this.props.setStatistics(fixture.fixture_id, 'forMatch', 'prematch');
    };

    render() {
        let sportsList = Object.values(staticPrematchSports())
         const { extraMarketChild: ExtraMarket } = this.props;
        return (
            <React.Fragment>
                <TopLinks sports={sportsList}/> 
                <div className="middle-part sport-middle d-flex">
                    { !ExtraMarket && <div id='side-navbar' className="side-navbar fade1">
                        <nav className="side-multilevel">
                            <div id='item-search' style={{ height: '45px' }}/>
                            {/* <TopLeague /> */}
                            <div id='location-filter' className='' />
                        </nav>
                    </div>}
                    <div id="scrollableDiv" className={ `odds-panel ${ExtraMarket ? 'mid-expand' : ''}`}>
                        { !ExtraMarket ? <BannerCarousel/>: null}
                        { ExtraMarket ? <ExtraMarket /> : <Inplay limit={ this.props.limit}/>}
                    </div>
                    <Betslip />
                </div>               
            </React.Fragment>
        )
}
}

Home.propTypes = {
    isHomeActive: PropTypes.bool,
    isHomeLeagueActive: PropTypes.bool,
    setHomeActive: PropTypes.func,
    setHomeLeaguesActive: PropTypes.func,
    removeHomeActiveLeague: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        isHomeActive: state.home.isHomeActive,
        isHomeLeagueActive: state.home.isHomeLeagueActive,
        lastMinuteSports: state.lastMinute.sports,
        lastMinCountObj: state.lastMinute.lastMinCountObj,
        isLastMinAvailable: state.lastMinute.isLastMinAvailable,
        statsData: state.general.statsData,
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
        selectHomeActiveLeague: (leagueId) => dispatch(selectHomeActiveLeague(leagueId)),
        getHomeActiveLeagueEvents: (leagueId) => dispatch(getHomeActiveLeagueEvents(leagueId)),
        setHomeLeagues: () => dispatch(setHomeLeagues()),
        setHomeActive: (value) => dispatch(setHomeActive(value)),
        setHomeLeaguesActive: (value) => dispatch(setHomeLeaguesActive(value)),
        removeHomeActiveLeague: () => dispatch(removeHomeActiveLeague()),
        getTodaySports: () => dispatch(getTodaySports()),
        selectSportMobile: (sportId) => dispatch(selectSportMobile(sportId)),
        selectPreSport: (sportId) => dispatch(selectPreSport(sportId)),
        getStatsData: () => dispatch(getStatsData()),
        getBanners: () => dispatch(getBanners()),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        getMarketData: (data, startIndex, count) => dispatch(getMarketData(data, startIndex, count)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
