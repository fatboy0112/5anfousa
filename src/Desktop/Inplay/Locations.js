import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Translate } from '../../localization';
import map from 'lodash.map';
import { connect } from 'react-redux';
import { selectLocation } from '../../store/actions/todayActions';
import forEach from 'lodash.foreach';

function Locations(props) {
    const resetSelectedLocations = (e) => {
        e.preventDefault();
        props.resetSelectedLocations();
    };

    const handleLeagueClick = (isCountrySelected, location) => (e) => {
        e.preventDefault();
        props.selectLeague(e.currentTarget.id);
    };

    const handleChange = (e) => {
        e.preventDefault();
        props.handleSearch(e.target.value);
    };

    let { locationsObj, searchVal, selectedLocationList, language, selectedTodayLeagues } = props;
    let lang = `name_${ language?.toLowerCase()}`;
    let isAllActive = !props.selectedTournament;
    let locations = locationsObj ? Object.values(locationsObj.Locations) : [];
    let liveLocationsObject = {};
    if(locationsObj?.Locations?.length) liveLocationsObject = locationsObj?.Locations?.reduce((ac, a) => ({ ...ac, [ a.Id ]: a }), {});

    const locationsList =
            map(locations, (item, i) => {
                let locationId = item.Id;
                let locationName = item[lang] || item.name_en || item.name;
                let leagueArray = [];
                let isCountrySelected = selectedLocationList.indexOf(`${locationId}`) > -1;
                let leagueDataObj = {};
                let isAnyLeaguePresent = false;
                if (liveLocationsObject[locationId]) {
                    forEach(Object.keys(liveLocationsObject[locationId]), (league) => {
                        if(!isNaN(league)) {
                            if (selectedTodayLeagues.indexOf(league) > -1) {
                                isAnyLeaguePresent = true;
                            }
                            // if (leagueDataObj[league]) leagueDataObj[league] = { ...leagueDataObj[league], live_count }
                            leagueDataObj[league] = {
                                location_id: parseInt(league),
                                name: liveLocationsObject[locationId][league].Name,
                                ...liveLocationsObject[locationId][league]
                            };
                            // } 
                        };
                    });           
                }
    
                let countryChecked = isCountrySelected ? 'checked' : isAnyLeaguePresent ? 'partial checked' : ''
    
                leagueArray = Object.values(leagueDataObj);
    
                // let contains = selectedLocation == locationId;
                let contains = false;
    

                return (
                    <li className={`${ contains && 'checked'}`}>
                        <div className="d-flex align-items-center nav-parent" key={locationId}>
                            <a href className="accordion-heading" data-toggle="collapse" data-target={`#submenu-${locationId}`}>
                                <span className="nav-header-primary">
                                    <div country={'flag_' + (locationId === 250 ? 248 : locationId)} className="live-flag-25 flag"></div>
                                    <span>{locationName}</span>
                                </span>
                            </a>
                            {/* <div className={`form-group custum-check ${countryChecked}`} id={locationId}>
                                <input type="checkbox" id={`input-${locationId}`} checked/>
                                <label></label>
                            </div> */}
                        </div>
                        <ul class="nav nav-list collapse" id={`submenu-${locationId}`}>
                            {leagueArray.map(league => {
                            const { fixtures_count: count, live_count: liveCount } = league;
                            let leagueName = league[lang] || league.name_en || league.Name;
                            // let isLeagueSelected = false;
                            let isLeagueSelected = props.selectedTournament == league.Id;
                            return (
                                <li className={isLeagueSelected && 'show'}>
                                    <a href id={ league.Id } className={`accordion-heading`} onClick={handleLeagueClick(isCountrySelected, locationId)}>
                                        <span>
                                            { leagueName }
                                            { ` (${ liveCount || 0})`}
                                        </span>
                                        <span class="pull-right"></span>
                                        {/* <div className={`form-group custum-check ${isLeagueSelected && 'checked'}`}>
                                            <input type="checkbox" id="html" />
                                            <label></label>
                                        </div> */}
                                    </a>
                                </li>
                            );
                        })}
                        </ul>
                    </li>
                );
            });

    const searchToRender =
        <div className="sports__content sports__content_sm">
            <div>
                <input
                    type="text"
                    className="sports__search-input"
                    // autoFocus
                    placeholder={Translate.searchHere}
                    value={searchVal}
                    onChange={handleChange}
                />
            </div>
        </div>;
    const childToRender =
        <React.Fragment>            
            <div className="w-100 d-flex sports disable-select">
                <ul className='nav nav-list all-league w-100'>
                    {/* <h2></h2> */}
                    <li className={`${ isAllActive && 'checked'}`}>
                        <div className="d-flex align-items-center nav-parent" onClick={resetSelectedLocations} id='all-date'>
                            <a className="accordion-heading" data-toggle="collapse" data-target="#submenu8">
                                <span className="nav-header-primary">
                                    <i className="icon-all live-locations__icon mr-2" />
                                    <span>{Translate.all}</span>
                                </span>
                            </a>
                            {/* <div className={`form-group custum-check ${isAllActive && 'checked' }`}>
                                <input type="checkbox" id="html" checked={isAllActive}/>
                                <label></label>
                            </div> */}
                        </div>
                    </li>
                    {locationsList}
                </ul>
            </div>
        </React.Fragment>;

    return (
        <>
            {document.getElementById('location-filter') && ReactDOM.createPortal(
                childToRender,
                document.getElementById('location-filter')
            )}
            {document.getElementById('item-search') && ReactDOM.createPortal(
                searchToRender,
                document.getElementById('item-search')
            )}
        </>
    );
}

Locations.propTypes = {
    todayLocations: PropTypes.array,
    selectTodayLocation: PropTypes.func
};

const mapStateToProps = (state) => {
    return {
        todayLocations: state.inplay.locations,
        selectedLocationList: state.today.selectedLocationList,
        dateFilter: state.today.dateFilter,
        selectedTodayLeagues: state.today.selectedLeagues,
        selectedTodayLocation: state.today.selectedLocation,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectTodayLocation: (locationId) => dispatch(selectLocation(locationId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
