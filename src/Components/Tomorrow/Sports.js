import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getStatsData } from '../../store/actions/general.actions';
import { lSportsConfig } from '../../config/lsports.config';
import SportsList from '../Shared/SportsList';
import { selectSport, setTomorrowSports } from '../../store/actions/tomorrowActions';
import { staticPrematchSports } from '../../config/sports';

class Sports extends Component {
    componentDidMount() {
        // if (!statsData) this.props.getStatsData();
        if (!this.props.mainEvents.length > 0) { // DOn't reload data If main events are already present. 
            //this.props.getTomorrowSports();
            this.props.setTomorrowSports();
            this.props.selectSport(lSportsConfig.tomorrow.selectedSport);
        }
    }

    selectSport = (sportId) => {
        this.props.selectSport(sportId);
    };

    render() {
        let { selectedSport, language, mainEvents, noSport, sportCountObj } = this.props;
        return (
            !noSport ?
            <div className={`pre-match-wrapper`}>
                <SportsList
                    sports={staticPrematchSports()}
                    sportsObj={sportCountObj}
                    selectedSport={selectedSport}
                    selectSport={this.selectSport}
                    searchPath=""
                    type="tomorrow"
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
    // getTomorrowSports: PropTypes.func,
    selectSport: PropTypes.func,
    sports: PropTypes.array,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        sports: state.tomorrow.sports,
        selectedSport: state.tomorrow.selectedSport,
        language: state.general.language,
        mainEvents: state.tomorrow.mainEvents,
        sportCountObj: state.tomorrow.sportCountObj,
        statsData: state.general.statsData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        // getTomorrowSports: () => dispatch(getTomorrowSports()),
        selectSport: (sportId) => dispatch(selectSport(sportId)),
        setTomorrowSports: () => dispatch(setTomorrowSports()),
        getStatsData: () => dispatch(getStatsData()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sports);
