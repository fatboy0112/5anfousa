import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { clearSearch } from '../../store/actions/resultsActions';

const Filter = (props) => {
    const { sports, selectedSport, selectSport, clearSearch, mainEvents, isHomeLeagueActive, sportsObj, noSearchResults } = props;

    const handleChangeSport = (sportId) => {
        if (sportId === props.selectedSport) return null;
        selectSport(sportId);
        clearSearch();
    };

  return (
      <div className="d-flex flex-wrap links-block">
          <div id='sport-filter' className="game-block">
              { <ul className="d-flex">
                  { Object.values(sports).map(item => {
                      let sportId = item.sport_id;
                      let sportName = item.name;
                      const className = !isHomeLeagueActive && sportId === selectedSport ? 'active' : ''
                      return (
                          <li onClick={ mainEvents.length > 0 || noSearchResults ? (e) => handleChangeSport(sportId) : null } key={sportId} className='counter_position'>
                              <a href className={ className }>
                                  {/* <div className='sports__counter'> 20 </div> */}
                                  {/* <img alt="stream-icon" className="nav-ico-dark" src={`/images/sports/${item.icon_name}-desktop.svg`}></img> */}
                                  <img alt="stream" className="nav-ico-light" src={`/images/sports/${item.icon_name}-desktop-white.svg`}></img>
                                  <span>{sportName}</span>
                                  <span className='counter'>{ sportsObj[ sportId ] }</span>
                              </a>
                          </li>
                      );
                  })}
              </ul>
            }
          </div>
      </div>
    );
};

Filter.propTypes = {
    userData: PropTypes.object,
    setLanguage: PropTypes.func,
    language: PropTypes.string,
    headerClassname: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        dateFilter: state.today.dateFilter,
        selectedSport: state.results.selectedSport,
        mainEvents: state.results.mainEvents,
        noSearchResults: state.results.noSearchResults,
        language: state.general.language,
        isHomeLeagueActive: state.home.isHomeLeagueActive,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        clearSearch: () => dispatch(clearSearch()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Filter);