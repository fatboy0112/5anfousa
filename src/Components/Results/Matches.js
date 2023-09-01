import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Match from './Match';
import LeagueHeader from '../Shared/LeagueHeader';
import { removeLeague } from '../../store/actions/resultsActions';

function Matches(props) {
    const removeLeague = (leagueId) => {
        props.removeLeague(leagueId);
    };

    let { events } = props;
    let lastLeagueId = null;

    let drawMatches =
        events && events.length > 0
            ? map(events, (e, i) => {
                  let groupInfo = null;
                  let divider = null;

                  if (lastLeagueId === e.league_id) {
                      divider = <div className="match__divider" />;
                  } else {
                      let leagueId = e.league_id;
                      lastLeagueId = leagueId;
                      divider = null;
                      groupInfo = <LeagueHeader event={e} showStripe remove={(e) => removeLeague(leagueId)} />;
                  }

                  return (
                      e && (
                          <div className='my-2'  key={'panel_' + e.fixture_id}>
                              {groupInfo}
                              {divider}
                              <Match event={e} />
                          </div>
                      )
                  );
              })
            : null;

    return <div>{drawMatches}</div>;
}

Matches.propTypes = {
    events: PropTypes.array,
    removeLeague: PropTypes.func,
    searchStarted: PropTypes.bool,
    openMarketsModal: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        searchStarted: state.results.searchStarted,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeLeague: (leagueId) => dispatch(removeLeague(leagueId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Matches);
