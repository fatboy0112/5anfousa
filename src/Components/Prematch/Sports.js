import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lSportsConfig } from '../../config/lsports.config';
import SportsList from '../Shared/SportsList';
import { getPrematchSports, selectPreSport, getPrematchSportsMobile, setLocationsActive, setPrematchActive, selectLocation, selectLeague } from '../../store/actions/prematchActions';
import { getStatsData } from '../../store/actions/general.actions';
import { staticPrematchSports } from '../../config/sports';


class Sports extends Component {
    componentDidMount() {
        //if (!this.props.sports.length > 0) {
            // for(let i=0; i < totalSegments; i++ ) {
            //     this.props.getPrematchSportsMobile(true, i);
            // }
            this.props.selectPreSport(lSportsConfig.prematch.selectedSport);
       // }
        // const { statsData } = this.props;
        // if (!statsData) this.props.getStatsData();
        this.props.setLocationsActive(true);
        this.props.setPrematchActive(false);
        this.props.selectLocation(null);
        this.props.selectLeague(null);
        this.props.getPrematchSportsMobile(true, 0);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // this.props.getPrematchSports();
        }
    }

    selectSport = (sportId) => {
        this.props.setLocationsActive(true);
        this.props.setPrematchActive(false);

        let selectedSport = this.props.selectedSport;

        if (selectedSport !== sportId) {
            this.props.selectLocation(null);
            this.props.selectLeague(null);
            this.props.selectPreSport(sportId);
        }
        
    };

    render() {
        let { selectedSport, language, sportsCountObj } = this.props;

        return (
            <div className={`pre-match-wrapper`}>
                <SportsList
                sports={staticPrematchSports()}
                sportsObj={sportsCountObj}
                selectedSport={selectedSport}
                selectSport={this.selectSport}
                searchPath={''}
                type="prematch"
                language={language}
                sort
                />
            </div>
        );
    }
}

Sports.propTypes = {
    selectPreSport: PropTypes.func,
    setLocationsActive: PropTypes.func,
    setPrematchActive: PropTypes.func,
    selectLocation: PropTypes.func,
    selectLeague: PropTypes.func,
    sports: PropTypes.array,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        sports: state.prematch.sports,
        selectedSport: state.prematch.selectedSport,
        language: state.general.language,
        sportsCountObj: state.prematch.sportsCountObj,
        statsData: state.general.statsData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectPreSport: (sportId) => dispatch(selectPreSport(sportId)),
        setLocationsActive: (value) => dispatch(setLocationsActive(value)),
        setPrematchActive: (value) => dispatch(setPrematchActive(value)),
        selectLocation: (value) => dispatch(selectLocation(value)),
        selectLeague: (value) => dispatch(selectLeague(value)),
        getPrematchSports: (value) => dispatch(getPrematchSports(value)),
        getStatsData: () => dispatch(getStatsData()),
        getPrematchSportsMobile: (value, segment) => dispatch(getPrematchSportsMobile(value, segment)),

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sports);
