import React from 'react';
import PropTypes from 'prop-types';
import { homePageLeagues } from '../../config/sports';
import { connect } from 'react-redux';
import { selectHomeActiveLeague, removeHomeActiveLeague, getHomeActiveLeagueEvents } from '../../store/actions/home.actions';
import { withRouter } from 'react-router-dom';

const TopLeague = (props) => {
    const { selectedLeague } = props;
    const setActiveLeague = (leagueId) => {
      props.history.push('/d');
    //   if (selectedLeague === leagueId) {
    //       props.removeHomeActiveLeague();
    //   } else {
    //       props.selectHomeActiveLeague(leagueId);
    //       props.getHomeActiveLeagueEvents(leagueId);
    //     //   props.history.push({pathname: '/d', state: {leagueId} });
    //   }
      props.selectHomeActiveLeague(leagueId);
  };
    const leagues_list = homePageLeagues.map((league) => {
      let leagueId = league.league_id;
      let leagueName = league.league_name_en;
      let isSelected = selectedLeague === leagueId ? 'checked' : '';
       const { mainEvents, isHomeLeagueActive, noEvents } = props;
      return (
          <li className={'leagues__item' + isSelected} key={leagueId}>
              <div className='d-flex align-items-center nav-parent' onClick={ ((mainEvents.length !== 0) || noEvents || !isHomeLeagueActive) && (selectedLeague !== leagueId) ? () => setActiveLeague(leagueId) : null}>
                  <a className="accordion-heading">
                      <span className="nav-header-primary">
                          {/* <div className="flag" country="flag_uefachampionsleague"></div> */}
                          <img src={`/images/leagues/${leagueName}.png`} className="leagues__img mr-2" alt={leagueName} style={{ height: '24px', width: '24px'}}/>
                          { leagueName }
                      </span>
                  </a>
                  <div className={`form-group custum-check ${isSelected}`}>
                      <input type="checkbox" id="html" checked={isSelected}/>
                      <label></label>
                  </div>
              </div>
          </li>
      );
  });
  return (
      <React.Fragment>
          <h3 className="side-title">Top Leagues</h3>
          <ul className="nav nav-list ">
              { leagues_list }
          </ul>
      </React.Fragment>
    );
};

TopLeague.propTypes = {
    userData: PropTypes.object,
    setLanguage: PropTypes.func,
    language: PropTypes.string,
    headerClassname: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        leagues: state.home.leagues,
        selectedLeague: state.home.selectedLeague,
        loading: state.general.loading,
        mainEvents: state.home.mainEvents,
        fetchAll: state.home.fetchAll,
        noEvents: state.home.noEvents,
        isHomeLeagueActive: state.home.isHomeLeagueActive

    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectHomeActiveLeague: (leagueId) => dispatch(selectHomeActiveLeague (leagueId)),
        removeHomeActiveLeague: () => dispatch(removeHomeActiveLeague()),
        getHomeActiveLeagueEvents: (leagueId) => dispatch(getHomeActiveLeagueEvents(leagueId)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopLeague));

