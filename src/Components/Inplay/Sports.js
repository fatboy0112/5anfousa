import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lSportsConfig } from '../../config/lsports.config';
import SportsList from '../Shared/SportsList';
import { getInplaySports, selectSport } from '../../store/actions/inplayActions';

class Sports extends Component {
    componentDidMount() {
       // this.props.getInplaySports();
       // this.props.selectSport(lSportsConfig.inplay.selectedSport);
    }

    selectSport = (sportId) => {
        this.props.selectSport(sportId);
    };

    render() {
        let { sports, selectedSport, language } = this.props;

        return (
            <SportsList
                sports={sports}
                selectedSport={selectedSport}
                selectSport={this.selectSport}
                searchPath="/live/search"
                type="inplay"
                language={language}
            />
        );
    }
}

Sports.propTypes = {
    getInplaySports: PropTypes.func,
    selectSport: PropTypes.func,
    sports: PropTypes.array,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        sports: state.inplay.sports,
        selectedSport: state.inplay.selectedSport,
        language: state.general.language,
        statsData: state.general.statsData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        // getInplaySports: () => dispatch(getInplaySports()),
        selectSport: (sportId) => dispatch(selectSport(sportId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sports);
