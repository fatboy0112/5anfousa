import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import includes from 'lodash.includes';
import Loading from '../Common/NewLoading';
import { Translate } from '../../localization';
import { resetSelectedLocations, getSportEvents, getTodayLocations, selectLocation } from '../../store/actions/todayActions';
import { Link } from 'react-router-dom';

function Locations(props) {
    const resetSelectedLocations = (e) => {
        e.preventDefault();
        props.resetSelectedLocations();
    };

    const [showSearch, setShowSearch] = useState(false);

    const handleSearchToggle = () => {
        setShowSearch(!showSearch);
    }
    
    const handleChange = (e) => {
        e.preventDefault();
       props.handleSearch(e.target.value);
    }

    const hideSearchBar = () => {
        setShowSearch(false);
        props.handleSearch('');
        
    };
    
    const handleClick = (e) => {
        e.preventDefault();
        if (e.currentTarget.id === props.selectedLocation) props.selectLocation('');
        else props.selectLocation(e.currentTarget.id);
    };

    let { locations, selectedLocation, noEvents, locationsLoading, language } = props;
    let isAllActive = selectedLocation === '';
    let lang = `name_${language.toLowerCase()}`;
    const locationsList =
        !locationsLoading ? (
            locations.length > 0 ?
            locations.map((item, i) => {
                let locationId = item.Id;
                let locationName = item[lang] || item.name_en;

                let contains = selectedLocation == locationId;

                return (
                    <div className="live-locations__item" id={locationId} onClick={handleClick} key={locationId}>
                        <div className={`live-locations__box ${contains ? 'live-locations__box_active' : ''}`}>
                            <div country={'flag_' + (locationId === 250 ? 248 : locationId)} className="live-flag-25 flag"></div>
                            <span>{locationName.substring(0, 3)}</span>
                        </div>
                    </div>
                );
            }) : null
        ) : <Loading />
    return (
        !props.fromLivePage ?
        <div className={`pre-match-wrapper`}>
            {showSearch ? (
                <div className="sports__content sports__content_sm">
                    <div className="sports__search-bar">
                        <input
                            type="text"
                            className="ml-2 form-control sports__search-input"
                            autoFocus
                            placeholder={Translate.searchHere}
                            onChange={handleChange}
                        />
                        <i className="icon-search" />
                        <div className="sports__close-search">
                            <i className="material-icons text-body" onClick={hideSearchBar}>
                                close
                            </i>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="livesearch">
                        <div className="live-icn" onClick={handleSearchToggle}>
                            <i className="icon-search live-search-icon d-inline-block"></i>
                        </div>
                    </div>
                    <div className="live-locations">
                        <div className="live-locations__item" onClick={resetSelectedLocations}>
                            <div className={`live-locations__box live-locations__box_all ${isAllActive ? 'live-locations__box_active' : ''}`}>
                                <i className="icon-all live-locations__icon" />
                                <span>{Translate.all}</span>
                            </div>
                        </div>
                        {locationsList}
                    </div>
                </>
            )}
            {/* <div className="live-icn">
                <i className="icon-search live-search-icon d-inline-block"></i>
            </div> */}
        </div>
        : null
    );
}

Locations.propTypes = {
    locations: PropTypes.array,
    selectedLocation: PropTypes.array,
    resetSelectedLocations: PropTypes.func,
    selectLocation: PropTypes.func,
    getSportEvents: PropTypes.func,
    getTodayLocations: PropTypes.func,
    selectedSport: PropTypes.number,
    language: PropTypes.string,
    searchStarted: PropTypes.bool,
    noEvents: PropTypes.bool,
    locationsLoading: PropTypes.bool,
};

const mapStateToProps = (state) => {
    return {
        locations: state.today.locations,
        selectedLocation: state.today.selectedLocation,
        selectedSport: state.today.selectedSport,
        searchStarted: state.today.searchStarted,
        language: state.general.language,
        noEvents: state.today.noEvents,
        locationsLoading: state.today.locationsLoading,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        resetSelectedLocations: () => dispatch(resetSelectedLocations()),
        selectLocation: (locationId) => dispatch(selectLocation(locationId)),
        getSportEvents: (sportId) => dispatch(getSportEvents(sportId)),
        getTodayLocations: (sportId) => dispatch(getTodayLocations(sportId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
