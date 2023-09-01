import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import { slice, sortBy } from 'lodash';
import { setHomeLeagues, setHomeActive, setHomeLeaguesActive, removeHomeActiveLeague, getMarketData } from '../../store/actions/home.actions';
import { selectSportMobile } from '../../store/actions/todayActions';
import { getStatsData, getBanners } from '../../store/actions/general.actions';
import TopLinks from '../TopLinks';
import { lSportsConfig } from '../../config';
import { setStatistics } from '../../store/actions/lsports.global.actions';
import Betslip from '../Betslip';
import Upcoming from './index';
import { withRouter } from 'react-router-dom';
import BannerCarousel from '../Common/Banner/BannerCarousel';
import { staticPrematchSports } from '../../config/sports';

class KSports extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showExtraOddsModal: false,
            event: {},
            showStatisticsModal: false,
        };
    }
    componentDidMount() {
        const { selectSportMobile } = this.props;
        this.props.getBanners();
        let sportsList = Object.values(staticPrematchSports()).filter(sport => sport.k_sport);
        if (sportsList?.[0]) selectSportMobile(sportsList[0].sport_id);
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
        this.props.selectSportMobile(lSportsConfig.prematch.selectedSport);
        this.props.setHomeActive(true);
        this.props.setHomeLeaguesActive(false);
        this.props.removeHomeActiveLeague();
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
        let sportsList = Object.values(staticPrematchSports()).filter(sport => sport.k_sport);
        sportsList = sortBy(sportsList, ['sort']);
        return (
            <React.Fragment>
                <TopLinks sports={ sportsList }/>               
                <div className="middle-part sport-middle d-flex">
                    <div id='side-navbar' className="side-navbar fade1">
                        <nav className="side-multilevel">
                            <div id='item-search' style={{ height: '45px' }}/>
                            {/* <TopLeague /> */}
                            <div id='location-filter' className='' />
                        </nav>
                    </div>
                    <div id="scrollableDiv" className={ `odds-panel ${false ? 'mid-expand' : ''}`}>
                        <BannerCarousel />
                        <Upcoming noSports={ true } limit={this.props.limit}/>
                    </div>
                    <Betslip />
                </div>               
            </React.Fragment>
        );
    }
}

KSports.propTypes = {
    isHomeActive: PropTypes.bool,
    setHomeActive: PropTypes.func,
    setHomeLeaguesActive: PropTypes.func,
    removeHomeActiveLeague: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        selectedLeague: state.home.selectedLeague,
        isHomeActive: state.home.isHomeActive,
        isHomeLeagueActive: state.home.isHomeLeagueActive,
        language: state.general.language,
        statisticsType: state.lsportsGlobal.statisticsType,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setHomeLeagues: () => dispatch(setHomeLeagues()),
        setHomeActive: (value) => dispatch(setHomeActive(value)),
        setHomeLeaguesActive: (value) => dispatch(setHomeLeaguesActive(value)),
        removeHomeActiveLeague: () => dispatch(removeHomeActiveLeague()),
        selectSportMobile: (sportId) => dispatch(selectSportMobile(sportId)),
        getStatsData: () => dispatch(getStatsData()),
        getBanners: () => dispatch(getBanners()),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        getMarketData: (data, startIndex, count) => dispatch(getMarketData(data, startIndex, count)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(KSports));
