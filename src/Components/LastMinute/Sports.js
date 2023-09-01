import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lSportsConfig } from '../../config/lsports.config';
import SportsList from '../Shared/SportsList';
import { getLastMinuteSports, selectSport } from '../../store/actions/lastMinuteActions';
import { staticPrematchSports } from '../../config/sports';

let sportInterval;

class Sports extends Component {
    componentDidMount() {
        this.props.getLastMinuteSports(); 
       
            // this.props.getLastMinuteSports(); 
                       
        this.props.selectSport(lSportsConfig.lastMinute.selectedSport);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // this.props.getLastMinuteSports();
        }
    }

    componentWillUnmount() {
        clearInterval(sportInterval);
    }

    selectSport = (sportId) => {
        if(sportId !== this.props.selectedSport)
        this.props.selectSport(sportId);
    };

    render() {
        let { lastMinCountObj, selectedSport, language, mainEvents } = this.props;
        return (
            <div className={`pre-match-wrapper`}>
                <SportsList
                    sports={staticPrematchSports()}
                    sportsObj={lastMinCountObj}
                    selectedSport={selectedSport}
                    selectSport={this.selectSport}
                    searchPath=""
                    type="last_minute"
                    language={language}
                    isDisable={mainEvents.length === 0}
                    sort
                />
            </div>
        );
    }
}

Sports.propTypes = {
    getLastMinuteSports: PropTypes.func,
    selectSport: PropTypes.func,
    sports: PropTypes.array,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        sports: state.lastMinute.sports,
        selectedSport: state.lastMinute.selectedSport,
        language: state.general.language,
        mainEvents: state.lastMinute.mainEvents,
        lastMinCountObj: state.lastMinute.lastMinCountObj
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLastMinuteSports: () => dispatch(getLastMinuteSports()),
        selectSport: (sportId) => dispatch(selectSport(sportId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sports);
