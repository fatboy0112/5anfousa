import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Sports from './Sports';
import Locations from './Locations';
import DateFilters from './DateFilters';
import Events from './Events';
import { clearLocations, setClearLocations, searchEvents, setPrematchDateFilter, resetPrematch } from '../../store/actions/prematchActions';
let timer = 0;
class Prematch extends Component {
    componentWillUnmount() {
        let fromXtraMarket = localStorage.getItem('fromExtraMarketPrematch');
        if(fromXtraMarket !== 'true') {
            this.props.setClearLocations();
            this.props.setPrematchDateFilter();
            this.props.resetPrematch();
        }
        localStorage.setItem('fromExtraMarketPrematch', false);
    }
    
    searchPrematchEvents = (value) => {
        const requestDelay = 400;
        clearTimeout(timer);

        timer = setTimeout(() => {
            this.props.search(value);
        }, requestDelay);

    }

    render() {
        let { isLocationsActive, isPrematchActive, searchValue, searchStarted } = this.props;
        return (
            <div className="main-container">


                <Sports />
                {isLocationsActive && (
                    <>
                        <DateFilters handleSearch={this.searchPrematchEvents} searchPath="/sports/search" />
                        { !searchStarted && searchValue === ''  ? <Locations /> : <Events />}
                    </>
                )}
                {isPrematchActive && (
                <Events />
                )}
            </div>
        );
    }
}

Prematch.propTypes = {
    isLocationsActive: PropTypes.bool,
    isPrematchActive: PropTypes.bool,
    clearLocations: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        isLocationsActive: state.prematch.isLocationsActive,
        isPrematchActive: state.prematch.isPrematchActive,
        searchValue: state.prematch.searchValue,        
        searchStarted: state.prematch.searchStarted,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearLocations: () => dispatch(clearLocations()),
        search: (searchVal) => dispatch(searchEvents(searchVal)),
        setClearLocations: () => dispatch(setClearLocations()),
        setPrematchDateFilter: () => dispatch(setPrematchDateFilter()),
        resetPrematch: () => dispatch(resetPrematch()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Prematch);
