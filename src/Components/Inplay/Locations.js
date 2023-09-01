import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Translate } from '../../localization';
import map from 'lodash.map';
import { connect } from 'react-redux';
import uniqBy from 'lodash.uniqby';
import { selectLocation } from '../../store/actions/todayActions';
import { internationalLocationIds } from '../../config';

function Locations(props) {
    const resetSelectedLocations = (e) => {
        e.preventDefault();
        props.resetSelectedLocations();
        props.selectTodayLocation();
    };
    const [showSearch, setShowSearch] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        props.selectLocation(e.currentTarget.id);
        props.selectTodayLocation(e.currentTarget.id);

    };

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

    let { locationsObj, currentSelectedLeague, searchVal, fromLivePage, todayLocations, language } = props;
    let lang = `name_${language.toLowerCase()}`;
    let isAllActive = currentSelectedLeague === 'all';
    let locations = locationsObj ? Object.values(locationsObj.Locations) : [];
    if (fromLivePage) {
        if (todayLocations.length !== 0) {
            for (let l in todayLocations) {
                locations.push({ ...todayLocations[l], Name: todayLocations[l].Name, name: todayLocations[l][lang] || todayLocations[l].name_en,  Id: todayLocations[l].Id });
            }
            locations = uniqBy(locations, 'Id');
        } 
    }

    let isInternationalPresent = false;
    const locationsList =
            map(locations, (item, i) => {
                let locationId = item.Id;
                let locationName = item[lang] || item.Name || item.name_en || item.name;
                let contains = (currentSelectedLeague === locationId + '');
                if (!isInternationalPresent && internationalLocationIds.indexOf(+locationId) > -1) isInternationalPresent = true;
                else if (isInternationalPresent && internationalLocationIds.indexOf(+locationId) > -1) return null;

                return (
                    <div className="live-locations__item" id={locationId} onClick={handleClick} key={locationId}>
                        <div className={`live-locations__box ${contains ? 'live-locations__box_active' : ''}`}>
                            <div country={'flag_' + locationId } className="live-flag-25 flag"></div>
                            <span>{locationName.substring(0, 3)}</span>
                        </div>
                    </div>
                );
            })

    return (
        <div className="d-flex sports disable-select">
            {showSearch ? (
                <div className="sports__content sports__content_sm">
                    <div className="sports__search-bar">
                        <input
                            type="text"
                            className="ml-2 form-control sports__search-input"
                            autoFocus
                            placeholder={Translate.searchHere}
                            value={searchVal}
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
        </div>
    );
}

Locations.propTypes = {
    todayLocations: PropTypes.array,
    selectTodayLocation: PropTypes.func
};

const mapStateToProps = (state) => {
    return {
        todayLocations: state.today.locations,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectTodayLocation: (locationId) => dispatch(selectLocation(locationId)), 
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
