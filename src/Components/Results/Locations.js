import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Loading from '../Common/NewLoading';
import { getResultsLocations, selectLocation, setResultsLocationEvents, setLocationsActive, setResultsActive } from '../../store/actions/resultsActions';

class Locations extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // let sportId = this.props.selectedSport;
            // this.props.getResultsLocations(sportId);
        }
    }

    handleClick = (e, locationId) => {
        e.preventDefault();
        // let { selectedLocation } = this.props;
        // let locState = selectedLocation === locationId || locationId === null ? false : true;
        // locationId = locState ? locationId : null;
        this.props.selectLocation(locationId);
        this.props.setLocationsActive(false);
        this.props.setResultsActive(true);
        this.props.setResultsLocationEvents(locationId);
    };

    render() {
        let { locations, isLocationLoading, language} = this.props;
        let lang = `name_${language.toLowerCase()}`;
        let locationLength = locations ? locations.length : 0;
        let locationsList =
            !isLocationLoading ? locations.length > 0 ? (
                locations.map((item, i) => {
                    let locationId = item.location_id;
                    let locationName = item[lang] || item.name_en;
                    let count = item.fixtures_count;
                    let divider = locationLength - 1 > i ? <div className="location__divider"> </div> : null;

                    return (
                        <div className="location" key={locationId}>
                            <Grid
                                container
                                className="justify-content-md-center location__item mx-auto p-0 pb-2 "
                                onClick={(e) => this.handleClick(e, locationId)}
                            >
                                <Grid item xs={10} className="d-flex align-items-center p-0">
                                    <div country={'flag_' + (locationId === 250 ? 248 : locationId)} className="flag"></div>
                                    <span className="ellipsis pr-3">{locationName}</span>
                                </Grid>
                                <Grid item xs={1} className="p-0">
                                    {count}
                                </Grid>
                                <Grid item xs={1} className="p-0">
                                    <i className="material-icons location__rotate-icon"> keyboard_arrow_right </i>
                                </Grid>
                            </Grid>
                            {divider}
                        </div>
                    );
                })
            ) : null
            : (
                <Loading />
            );

        return <div className="disable-select pt-3">{locationsList}</div>;
    }
}

Locations.propTypes = {
    locations: PropTypes.array,
    selectedLocation: PropTypes.number,
    getResultsLocations: PropTypes.func,
    selectLocation: PropTypes.func,
    getResultsLocationEvents: PropTypes.func,
    setLocationsActive: PropTypes.func,
    setResultsActive: PropTypes.func,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        locations: state.results.locations,
        selectedLocation: state.results.selectedLocation,
        selectedSport: state.results.selectedSport,
        language: state.general.language,
        isLocationLoading: state.results.isLocationLoading,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getResultsLocations: (sportId) => dispatch(getResultsLocations(sportId)),
        selectLocation: (locationId) => dispatch(selectLocation(locationId)),
        setResultsLocationEvents: (locationId) => dispatch(setResultsLocationEvents(locationId)),
        setLocationsActive: (value) => dispatch(setLocationsActive(value)),
        setResultsActive: (value) => dispatch(setResultsActive(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
