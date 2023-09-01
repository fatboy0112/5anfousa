import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Sports from './Sports';
import Events from './Events';
import Locations from './Locations';
import { clearLocations, getResultsLocationsCount , getResultsLocationsCountMobile } from '../../store/actions/resultsActions';
import { resultTotalSegments } from '../../config';

class Results extends Component {
    componentDidMount() {
        for(let i=0; i< resultTotalSegments; i++) {
            this.props.getResultsLocationsCountMobile(true, null, i);
        }
    }
    componentWillUnmount() {
        this.props.clearLocations();
    }

    render() {
        let { isLocationsActive, isResultsActive } = this.props;

        return (
            <div className="main-container">
                <Sports />
                {isLocationsActive && <Locations />}
                {isResultsActive && <Events />}
            </div>
        );
    }
}

Results.propTypes = {
    isLocationsActive: PropTypes.bool,
    isResultsActive: PropTypes.bool,
    clearLocations: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        isLocationsActive: state.results.isLocationsActive,
        isResultsActive: state.results.isResultsActive,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearLocations: () => dispatch(clearLocations()),
        getResultsLocationsCount: (val) => dispatch(getResultsLocationsCount(val)),
        getResultsLocationsCountMobile: (val, nextToken, i ) => dispatch(getResultsLocationsCountMobile(val, nextToken, i)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Results);
