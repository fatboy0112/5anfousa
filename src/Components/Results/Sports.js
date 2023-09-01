import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lSportsConfig } from '../../config/lsports.config';
import SportsList from '../Shared/SportsList';
import { selectSportMobile, setLocationsActive, setResultsActive, selectLocation } from '../../store/actions/resultsActions';
import { staticPrematchSports } from '../../config/sports';

class Sports extends Component {
    componentDidMount() {
        // this.props.getResultsSports();
        this.props.selectSportMobile(lSportsConfig.results.selectedSport);
        this.props.setLocationsActive(true);
        this.props.setResultsActive(false);
        this.props.selectLocation(null);
    }

    componentDidUpdate(prevProps) {
        // if (prevProps.language !== this.props.language) {
        //     this.props.getResultsSports();
        // }
    }

    selectSport = (sportId) => {
        this.props.setLocationsActive(true);
        this.props.setResultsActive(false);

        let selectedSport = this.props.selectedSport;

        if (selectedSport !== sportId) {
            this.props.selectLocation(null);
            this.props.selectSportMobile(sportId);
        }

    };

    render() {
        let { selectedSport, language } = this.props;

        return (
            <div className={`pre-match-wrapper`}>
                <SportsList
                    sportsObj = {this.props.sportsCountObj}
                    sports={staticPrematchSports()}
                    selectedSport={selectedSport}
                    selectSport={this.selectSport}
                    searchPath="/results/search"
                    type="seven_days_finished"
                    language={language}
                />
            </div>
        );
    }
}

Sports.propTypes = {
    selectSportMobile: PropTypes.func,
    setLocationsActive: PropTypes.func,
    setResultsActive: PropTypes.func,
    selectLocation: PropTypes.func,
    sports: PropTypes.array,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        sports: state.results.sports,
        selectedSport: state.results.selectedSport,
        language: state.general.language,
        sportsCountObj: state.results.sportsCountObj
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectSportMobile: (sportId) => dispatch(selectSportMobile(sportId)),
        setLocationsActive: (value) => dispatch(setLocationsActive(value)),
        setResultsActive: (value) => dispatch(setResultsActive(value)),
        selectLocation: (value) => dispatch(selectLocation(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sports);
