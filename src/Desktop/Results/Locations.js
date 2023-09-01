import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Loading from '../../Components/Common/NewLoading';
import { getResultsLocations, selectLocation, setResultsLocationEvents, setLocationsActive, setResultsActive } from '../../store/actions/resultsActions';

class Locations extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // let sportId = this.props.selectedSport;
            // this.props.getResultsLocations(sportId);
        }
        const { locations } = this.props;
        if (prevProps.locations !== locations && locations.length > 0){
            const locationId = locations[ 0 ]?.location_id;
            this.props.selectLocation(locationId);
            this.props.setLocationsActive(false);
            this.props.setResultsActive(true);
            this.props.setResultsLocationEvents(locationId);
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
        let lang = `name_${ language?.toLowerCase() || 'en' }`;
        let locationLength = locations ? locations.length : 0;
        let locationsList =
            !isLocationLoading ? locations.length > 0 ? (
                locations.map((item, i) => {
                    let locationId = item.location_id;
                    let locationName = item[lang] || item.name_en;
                    let count = item.fixtures_count;
                    let divider = locationLength - 1 > i ? <div className="location__divider"> </div> : null;
                    let isSelected = this.props.selectedLocation === locationId ? 'checked' : '';

                    return (
                        <div className='location location_hover' key={locationId}>
                            <Grid
                                container
                                className='justify-content-md-center location__item mx-auto py-3 pb-2'
                                onClick={(e) => this.handleClick(e, locationId)}
                            >
                                <Grid item xs={8} className="d-flex align-items-center p-0">
                                    <div country={'flag_' + (locationId === 250 ? 248 : locationId)} className="flag"></div>
                                    <span className="ellipsis pr-3 text-light allow_cursor">{locationName}</span>
                                </Grid>
                                <Grid item xs={2} className="p-0 text-light event_count">
                                    {count}
                                </Grid>
                                <Grid item xs={ 1 } className='pt-1'>
                                    <div className={`form-group custum-check ${isSelected}`}>
                                        <input type="checkbox" id="html" checked={isSelected}/>
                                        <label></label>
                                    </div>
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
