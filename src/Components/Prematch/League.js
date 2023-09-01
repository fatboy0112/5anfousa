import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Grid from '@material-ui/core/Grid';
import { selectLeague, setLocationsActive, setPrematchActive, getPrematchLeagueEvents } from '../../store/actions/prematchActions';
import Loading from '../Common/NewLoading';

function League(props) {
    const handleClick = (e, leagueId) => {
        e.preventDefault();
        props.selectLeague(leagueId);
        props.setLocationsActive(false);
        props.setPrematchActive(true);
    };
    const { leagues, loading, language } = props;
    let lang = `name_${language.toLowerCase()}`;
    let drawLeagues = leagues
        ? map(leagues, (item, i) => {
              let leagueId = item.location_id;
              let leagueName = item[lang] || item.name || item.name_en;
              let count = item.fixtures_count;
              let divider = leagues.length - 1 > i ? <div className="location__divider"></div> : null;

              return (
                  <div className="mx-auto" key={leagueId}>
                      <Grid container className="m-0 justify-content-md-center" onClick={(e) => handleClick(e, leagueId)}>
                          <Grid item xs={10} className="location__league p-0">
                              {leagueName}
                          </Grid>
                          <Grid item xs={1} className="p-0">
                              {count}
                          </Grid>
                          <Grid item xs={1} className="p-0">
                              <i className="material-icons align-i"> keyboard_arrow_right </i>
                          </Grid>
                      </Grid>
                      {divider}
                  </div>
              );
          })
        : null;

    return <div className="location__content">{ loading ? <Loading /> : drawLeagues}</div>;
}

League.propTypes = {
    selectLeague: PropTypes.func,
    setLocationsActive: PropTypes.func,
    setPrematchActive: PropTypes.func,
    getPrematchLeagueEvents: PropTypes.func,
    leagues: PropTypes.array,
};

const mapStateToProps = (state) => {
    return {
        leagues: state.prematch.leagues,
        loading: state.general.loading,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectLeague: (leagueId) => dispatch(selectLeague(leagueId)),
        setLocationsActive: (value) => dispatch(setLocationsActive(value)),
        setPrematchActive: (value) => dispatch(setPrematchActive(value)),
        getPrematchLeagueEvents: (leagueId) => dispatch(getPrematchLeagueEvents(leagueId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(League);
