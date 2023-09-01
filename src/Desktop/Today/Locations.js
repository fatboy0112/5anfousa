import React, { useEffect , useMemo} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import Loading from '../../Components/Common/NewLoading';
import { Translate } from '../../localization';
import { resetSelectedLocations, getSportEvents, getTodayLocations, selectLocation, clearPartialLocations, selectLeague, getSportEventsDesktop } from '../../store/actions/todayActions';
import { getPrematchLocations,getPrematchLocationsDesktop } from '../../store/actions/todayActions/lsports.prematch.location.action';
import { useLocation } from 'react-router-dom';

let sportEventInterval;
function Locations(props) {
    const resetSelectedLocation = (e) => {
        e.preventDefault();
        props.resetSelectedLocations();
        props.selectTodayLeague();
        props.selectLocation();
    };

    const location = useLocation();
    const isHomeActive = useMemo(() => !location.pathname.split('/')[2], [ location ]);

    useEffect(() => {
        props.clearPartialLocations();
       if(isHomeActive ) { 
            props.getSportEventsDesktop(); // fetching data on the basis of date filter
        } else {
           props.getPrematchLocationsDesktop(); // fetching all data
         }
        sportEventInterval = setInterval(() => {
            if(isHomeActive ) {
               // do nothing
           } else {
            props.clearPartialLocations();
            props.getPrematchLocationsDesktop();
           }
        }, 300000);
        return () => {
            clearInterval(sportEventInterval);
            
        };
    }, []);

    
    const getLeaguesByLocation = (locationId) => {
        let leagueDataObj = {};
        let leagueArray = [];

        if (todayLocationsObj[locationId]) {
            if (dateFilter === 'all') {
                forEach(Object.keys(todayLocationsObj[locationId]), (league) => {
                    if (!isNaN(league)) {
                        leagueDataObj[league] = {
                            location_id: parseInt(league)
                        };
                    };
                });
            }
            else {
                forEach(Object.keys(todayLocationsObj[locationId]), (league) => {
                    if (!isNaN(league) && todayLocationsObj[locationId][league].start_date[dateFilter]) {
                        leagueDataObj[league] = {
                            location_id: parseInt(league)
                        };
                    }
                });

            }
        }
         leagueArray = Object.values(leagueDataObj);
         return leagueArray.map(league => `${league.location_id}`);
    };

    const handleClick = (isPartialSelected) => (e) => {
        e.preventDefault();
         let leagues = getLeaguesByLocation(e.currentTarget.id);
       
        if (props.selectedLocationList.indexOf(e.currentTarget.id) > -1 && props.selectedLocationList.length === 1) {
            props.resetSelectedLocations();
        }
        else {
            props.selectLocation(e.currentTarget.id);
        }
        props.selectTodayLocation(e.currentTarget.id,leagues);
    };

    const handleLeagueClick = (isCountrySelected, location) => (e) => {
        e.preventDefault();
        // let allLeagues = getLeaguesByLocation(location);
        // let selectedLeagues = intersection(props.selectedTodayLeagues, allLeagues);
        // if (selectedLeagues.indexOf(e.currentTarget.id) === -1) selectedLeagues = selectedLeagues.concat(e.currentTarget.id);
        // else selectedLeagues = selectedLeagues.filter(league => league !== e.currentTarget.id);
        // if (selectedLeagues.length === allLeagues.length) {
        //     props.selectTodayLocation(`${location}`);
        // } else {
        //     if (!props.selectedLocationList.length && props.selectedTodayLeagues.indexOf(e.currentTarget.id) > -1 && props.selectedTodayLeagues.length === 1) {
        //         props.resetSelectedLocations();
        //     } else if (isCountrySelected) {
        //         props.selectTodayLocation(`${location}`);
        //     }
        // }
        props.selectTodayLeague(e.currentTarget.id);
    };

    const handleChange = (e) => {
        e.preventDefault();
       props.handleSearch(e.target.value);
    };

    let { locations, selectedLocation, todayLocationsObj, locationsLoading, language, dateFilter, selectedTodayLeagues, selectedLocationList } = props;
    let isAllActive = selectedTodayLeagues.length === 0;
    let lang = `name_${ language?.toLowerCase() || 'en' }`;
    const locationsList =
        !locationsLoading ? (
            locations.length > 0 ?
            locations.map((item, i) => {
            let locationId = item.Id;
            let locationName = item[lang] || item.name_en;
            let leagueArray = [];
            let isCountrySelected = selectedLocationList.indexOf(`${locationId}`) > -1;
            let leagueDataObj = {};
            let isAnyLeaguePresent = false;
            if (todayLocationsObj[locationId]) {
                if(dateFilter === 'all') {
                    forEach(Object.keys(todayLocationsObj[locationId]), (league) => {
                        if(!isNaN(league)) {
                            if ([].indexOf(league) > -1) {
                                isAnyLeaguePresent = true;
                            }
                            leagueDataObj[league] = { 
                                location_id: parseInt(league),
                                name: todayLocationsObj[locationId][league][lang],
                                fixtures_count: todayLocationsObj[locationId][league].count,
                                start_date: todayLocationsObj[locationId][league].start_date,
                                ...todayLocationsObj[locationId][league]
                            };
                        };
                    });
                }
                else {
                    forEach(Object.keys(todayLocationsObj[locationId]), (league) => {
                        if(!isNaN(league) && todayLocationsObj[locationId][league].start_date[dateFilter]) {
                            if (selectedTodayLeagues.indexOf(league) > -1) {
                                isAnyLeaguePresent = true;
                            }
                            leagueDataObj[league] = {
                                location_id: parseInt(league),
                                name: todayLocationsObj[locationId][league][lang],
                                fixtures_count: todayLocationsObj[locationId][league].start_date[dateFilter],
                                ...todayLocationsObj[locationId][league]
                            };
                        }
                    });
                    
                }
            }

            let countryChecked = isCountrySelected ? 'checked' : isAnyLeaguePresent ? 'partial checked' : ''

            leagueArray = Object.values(leagueDataObj);

            let contains = selectedLocation == locationId;

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
                        let leagueName = league[lang] || league.name_en;
                        let isLeagueSelected = selectedTodayLeagues.indexOf(`${league.Id}`) > -1;
                        // let isLeagueSelected = selectedTodayLeagues.indexOf(`${league.Id}`) > -1 ;
                        return (
                            <li className={isLeagueSelected && 'show'}>
                                <a href id={ league.Id } className={`accordion-heading`} onClick={handleLeagueClick(isCountrySelected, locationId)}>
                                    <span>
                                        { leagueName }
                                        { ` (${count || 0})`}
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
            }) : null
        ) : <Loading customClass='w-100'/>;
    const searchToRender =
        <div className="sports__content sports__content_sm">
            <div>
                <input
                    type="text"
                    className="sports__search-input"
                    // autoFocus
                    placeholder={Translate.searchHere}
                    // value={searchVal}
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
                        <div className="d-flex align-items-center nav-parent" onClick={resetSelectedLocation} id='all-date'>
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
        todayLocations: state.today.locations,
        selectedLocationList: state.today.selectedLocationList,
        todayLocationsObj: state.today.locationObj,
        dateFilter: state.today.dateFilter,
        selectedTodayLocation: state.today.selectedLocation,
        selectedTodayLeagues: state.today.selectedLeagues || [],
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        resetSelectedLocations: () => dispatch(resetSelectedLocations(true)),
        selectLocation: (locationId) => dispatch(selectLocation(locationId)),
        getSportEvents: (sportId) => dispatch(getSportEvents(sportId)),
        getTodayLocations: (sportId) => dispatch(getTodayLocations(sportId)),
        selectTodayLeague: (leagueId) => dispatch(selectLeague(leagueId)),
        clearPartialLocations: () => dispatch(clearPartialLocations()),
        getPrematchLocations: () => dispatch(getPrematchLocations()),
        getPrematchLocationsDesktop: () => dispatch(getPrematchLocationsDesktop()),
        getSportEventsDesktop: (sportId) =>dispatch(getSportEventsDesktop(sportId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
