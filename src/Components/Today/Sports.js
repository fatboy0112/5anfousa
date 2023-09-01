import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lSportsConfig } from '../../config/lsports.config';
import { getStatsData } from '../../store/actions/general.actions';
import SportsList from '../Shared/SportsList';
import { getTodaySportsMobile, selectSportMobile, setTodaySports, clearSportEvents } from '../../store/actions/todayActions';
import { staticPrematchSports } from '../../config/sports';

class Sports extends Component {
    componentDidMount() {
        const { statsData, fromLivePage, currentSelectedSport } = this.props;
        if (!statsData && !fromLivePage) this.props.getStatsData();
        //if (!this.props.mainEvents.length > 0 && !this.props.fromLivePage) { // DOn't reload data If main events are already present. 
            //this.props.getTodaySports();
            this.props.getTodaySportsMobile();
            this.props.selectSportMobile(lSportsConfig.today.selectedSport);

        //}
        if (fromLivePage){
            this.props.clearSportEvents();
            this.props.selectSportMobile(currentSelectedSport);}
    }

    componentDidUpdate(prevProps) {
        const {fromLivePage, currentSelectedSport } = this.props;
        if (fromLivePage) {
            if (prevProps.currentSelectedSport !== currentSelectedSport) {
                this.props.clearSportEvents();
                this.props.selectSportMobile(currentSelectedSport, true);
            }
        }

        // if (prevProps.language !== this.props.language) {
        //     this.props.getTodaySports();
        // }
    }

    selectSport = (sportId) => {
        this.props.selectSportMobile(sportId);
    };

    render() {
        let { sports, selectedSport, language, mainEvents, noSport, sportCountObj } = this.props;
        return (
            !noSport ?
            <div className={`pre-match-wrapper`}>
                <SportsList
                    sports={staticPrematchSports()}
                    sportsObj={sportCountObj}
                    selectedSport={selectedSport}
                    selectSport={this.selectSport}
                    searchPath=""
                    type="today"
                    language={language}
                    isDisable={mainEvents.length === 0}
                    sort
                />
            </div>
            : null
        );
    }
}

Sports.propTypes = {
    // getTodaySports: PropTypes.func,
    selectSport: PropTypes.func,
    sports: PropTypes.array,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        sports: state.today.sports,
        selectedSport: state.today.selectedSport,
        language: state.general.language,
        mainEvents: state.today.mainEvents,
        sportCountObj: state.today.sportCountObj,
        statsData: state.general.statsData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        // getTodaySports: () => dispatch(getTodaySports()),
        getTodaySportsMobile: () => dispatch(getTodaySportsMobile()),
        selectSportMobile: (sportId, dontFetch) => dispatch(selectSportMobile(sportId, dontFetch)),
        setTodaySports: () => dispatch(setTodaySports()),
        getStatsData: () => dispatch(getStatsData()),
        clearSportEvents: () => dispatch(clearSportEvents())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sports);
