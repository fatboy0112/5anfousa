import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import League from './League';
import Loading from '../Common/NewLoading';
import { getPrematchLeagueForLocation, getPrematchLocations, getPrematchLocationsMobile, selectLocation, setClearLocations, clearPartialLocations } from '../../store/actions/prematchActions';

let sportEventInterval;
class Locations extends Component {

    componentDidMount() {
            this.props.clearPartialLocations();
            this.props.getPrematchLocationsMobile();
            sportEventInterval = setInterval(() => {
                this.props.clearPartialLocations();
                this.props.getPrematchLocationsMobile();
            }, 300000);
            
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // this.props.getPrematchLocations();
        }
        if (this.props.selectedLocation) {
            this.props.getPrematchLeagueForLocation(this.props.selectedLocation);
        }

        if(prevProps.selectedSport !== this.props.selectedSport) {
            // this.props.clearPartialLocations();
            this.props.getPrematchLocationsMobile();
        }
    }

    componentWillUnmount() {
        clearInterval(sportEventInterval);
    }


    handleClick = (e, locationId) => {
        let { selectedLocation } = this.props;
        if (selectedLocation === locationId) {
            e.preventDefault();
            let locState = selectedLocation === locationId || locationId === null ? false : true;
            locationId = locState ? locationId : null;
            this.props.selectLocation(locationId);
        }
        else {
            e.preventDefault();
            let locState = selectedLocation === locationId || locationId === null ? false : true;
            locationId = locState ? locationId : null;
            this.props.selectLocation(locationId);
            this.props.getPrematchLeagueForLocation(locationId);

        }
    };

    render() {
        let { locations, selectedLocation, noLocations, language } = this.props;
        let lang = `name_${language.toLowerCase()}`;
        let locationLength = locations ? locations.length : 0;
        let locationsList =
            locations.length > 0 ? (
                locations.map((item, i) => {
                    let locationId = item.location_id;
                    let locationName = item[lang] || item.name || item.name_en;
                    let count = item.fixtures_count;
                    let divider = locationLength - 1 > i ? <div className="location__divider"> </div> : null;

                    return (
                        <div className={`location ${selectedLocation === locationId ? 'location_open' : ''}`} key={locationId}>
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

                            <League />
                        </div>
                    );
                })
            ) : noLocations ? (
                <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
            ) : (
                <Loading />
            );

        return <div className="disable-select pt-2">{locationsList}</div>;
    }
}

Locations.propTypes = {
    locations: PropTypes.array,
    selectedLocation: PropTypes.number,
    getPrematchLocations: PropTypes.func,
    selectLocation: PropTypes.func,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
    noLocations: PropTypes.bool,
    getPrematchLeagueForLocation: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        locations: state.prematch.locations,
        selectedLocation: state.prematch.selectedLocation,
        selectedSport: state.prematch.selectedSport,
        noLocations: state.prematch.noLocations,
        language: state.general.language,
    }; 
};

const mapDispatchToProps = (dispatch) => {
    return {
        getPrematchLocations: () => dispatch(getPrematchLocations()),
        selectLocation: (locationId) => dispatch(selectLocation(locationId)),
        getPrematchLeagueForLocation: (locationId) => dispatch(getPrematchLeagueForLocation(locationId)),
        setClearLocations: () => dispatch(setClearLocations()),
        clearPartialLocations: () => dispatch(clearPartialLocations()),
        getPrematchLocationsMobile: () => dispatch(getPrematchLocationsMobile()),

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
