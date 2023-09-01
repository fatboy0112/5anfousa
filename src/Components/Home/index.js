import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import { isEmpty }                    from 'lodash';
import BannerCarousel, {CarouselItem}                                                  from './BannerCarousel';
import ItemsGrid                                                                       from './ItemsGrid';
import LeaguesList                                                                     from './LeaguesList';
import League                                                                          from './League';
import { setHomeLeagues, setHomeActive, setHomeLeaguesActive, removeHomeActiveLeague } from '../../store/actions/home.actions';
import { lSportsConfig }                                                               from '../../config';
import { getTodaySports, selectSportMobile }                                           from '../../store/actions/todayActions';
import { getStatsData }                                                                from '../../store/actions/general.actions';
import {  selectPreSport }                                                             from '../../store/actions/prematchActions';
import { checkLastMin, getLastMinuteSports }                                           from '../../store/actions/lastMinuteActions';
import Account                                                                         from './Account';
import {style}                                                                         from 'redux-logger/src/diff';
import Bhome from './Bhome/Bhome';

class Home extends Component {
    componentDidMount() {
        // this.props.getLastMinuteSports();
        //this.props.getTodaySports();
        //this.props.getPrematchSports();
        // this.props.selectPreSport(lSportsConfig.prematch.selectedSport);
        // this.props.selectSportMobile(lSportsConfig.today.selectedSport);
        // this.props.checkLastMin();
        // const { statsData } = this.props;
        // if (!statsData) this.props.getStatsData();
    }

    componentWillUnmount() {
        this.props.setHomeActive(true);
        this.props.setHomeLeaguesActive(false);
        this.props.removeHomeActiveLeague();
    }

    render() {

        let { isHomeActive, isHomeLeagueActive, lastMinCountObj, location } = this.props;

        let homeClass = ''
        if (location.pathname === '/' && !isHomeLeagueActive) {
            homeClass = 'bg-gradient';
        }

        const isLastMinuteActive = this.props.isLastMinAvailable;
        return (
            <div className={`main-container bg-f7 ${homeClass}`}>
                <Bhome ></Bhome>
		
            </div>
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
        isHomeActive: state.home.isHomeActive,
        isHomeLeagueActive: state.home.isHomeLeagueActive,
        lastMinuteSports: state.lastMinute.sports,
        lastMinCountObj: state.lastMinute.lastMinCountObj,
        isLastMinAvailable: state.lastMinute.isLastMinAvailable,
        statsData: state.general.statsData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setHomeLeagues: () => dispatch(setHomeLeagues()),
        setHomeActive: (value) => dispatch(setHomeActive(value)),
        setHomeLeaguesActive: (value) => dispatch(setHomeLeaguesActive(value)),
        removeHomeActiveLeague: () => dispatch(removeHomeActiveLeague()),
        getTodaySports: () => dispatch(getTodaySports()),
        selectSportMobile: (sportId) => dispatch(selectSportMobile(sportId)),
        selectPreSport: (sportId) => dispatch(selectPreSport(sportId)),
        getLastMinuteSports: () => dispatch(getLastMinuteSports()),
        checkLastMin: () => dispatch(checkLastMin()),
        getStatsData: () => dispatch(getStatsData()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
