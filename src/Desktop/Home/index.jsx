import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import { slice, sortBy } from 'lodash';
import {
    setHomeLeagues,
    setHomeActive,
    setHomeLeaguesActive,
    removeHomeActiveLeague,
    getMarketData,
    selectHomeActiveLeague,
    getHomeActiveLeagueEventsDesktop,
} from '../../store/actions/home.actions';
import { getTodaySports, selectSportMobile } from '../../store/actions/todayActions';
import { getStatsData, getBanners } from '../../store/actions/general.actions';
import { selectPreSport } from '../../store/actions/prematchActions';
import TopLinks from '../TopLinks';
import TopLeague from '../TopLeague';
import { intervalTime, lSportsConfig, totalSegments } from '../../config';
import Loading from '../../Components/Common/NewLoading';
import { setStatistics } from '../../store/actions/lsports.global.actions';
import Betslip from '../Betslip';
import League from './League';
// import Inplay from '../Inplay';
import Upcoming from '../Today';
import { withRouter, Link } from 'react-router-dom';
import BannerCarousel from '../Common/Banner/BannerCarousel';
import Inplay from '../Inplay';
import SportList from './Sports';
import { staticPrematchSports } from '../../config/sports';
import { CarouselItem } from '../../Components/Home/BannerCarousel';
import Banner from './Banner';
import SvgAMATIC from './AMATIC.svg';
import SvgGREENTUBE from './GREENTUBE.svg';
import Nhome from './Nhome/Nhome';

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
        const { selectedLeague } = this.props;
        this.props.getBanners();
        // this.props.selectSportMobile(lSportsConfig.today.selectedSport);
        if (selectedLeague) {
            this.props.selectHomeActiveLeague(selectedLeague);
            for (let segmentNo = 0; segmentNo < totalSegments; segmentNo++) {
                this.props.getHomeActiveLeagueEventsDesktop(selectedLeague, segmentNo);
            }
        }
        // if (!statsData) this.props.getStatsData();
        sportEventInterval = setInterval(() => {
            let { mainEvents } = this.props;
            this.props.getMarketData(mainEvents, 0, mainEvents.length);
        }, intervalTime);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.mainEvents !== this.props.mainEvents && this.state.showExtraOddsModal) {
            let fixture = find(this.props.mainEvents, (event) => event.fixture_id === this.props.extraMarketEvent.fixture_id);
            this.props.setCurrentEvent(fixture);
            this.setState({ event: fixture });
        }

        if (prevProps.fetchedAll !== this.props.fetchedAll && this.props.fetchedAll) {
            this.getEventMarkets();
        }
    }

    componentWillUnmount() {
        this.props.setHomeActive(true);
        this.props.setHomeLeaguesActive(false);
        this.props.removeHomeActiveLeague();
        // this.props.clearPartialEvents();
    }

    getEventMarkets = () => {
        const startIndex = this.props.nextIndex || 0;
        const data = slice(this.props.partialAllEvents, 0, 20);
        this.props.getMarketData(data, startIndex, data.length);
    };

    openStatisticsModal = (fixture) => {
        // let statsTemplateType = fixture.has_prematch_statistics ? 'prematch' : fixture.has_live_statistics ? 'live' : '';
        this.setState({ showStatisticsModal: true });
        this.props.setStatistics(fixture.fixture_id, 'forMatch', 'prematch');
    };

    render() {
        //const { isHomeLeagueActive } = this.props;
        //let sportsList = Object.values(staticPrematchSports())
        //sportsList = sortBy(sportsList, ['sort']);
        let { userData } = this.props;

        const { isHomeLeagueActive, extraMarketChild: ExtraMarket } = this.props;
        return (
            <React.Fragment>
                <Nhome ></Nhome>
                {/* <Banner /> */}
               
            </React.Fragment>
        );
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
        selectedLeague: state.home.selectedLeague,
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
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectHomeActiveLeague: (leagueId) => dispatch(selectHomeActiveLeague(leagueId)),
        getHomeActiveLeagueEventsDesktop: (leagueId, segmentNo) => dispatch(getHomeActiveLeagueEventsDesktop(leagueId, segmentNo)),
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
        // clearPartialEvents: () => dispatch(clearPartialEvents())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
