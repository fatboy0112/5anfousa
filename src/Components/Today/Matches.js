import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Match from './Match';
import LeagueHeader from '../Shared/LeagueHeader';
import { removeLeague } from '../../store/actions/todayActions';

function Matches(props) {
    const removeLeague = (leagueId) => {
        props.removeLeague(leagueId);
    };

    let { events, openMarketsModal, openStatisticsModal, selectExtraMarket, setExtraMarkets } = props;
    let lastLeagueId = null;
    let drawMatches =
        events && events.length > 0
            ? map(events, (e, i) => {
                  let groupInfo = null;
                  let divider = null;
                  if (!e.league) return null;

                  if (lastLeagueId === e.league.Id) {
                      divider = <div className="match__divider" />;
                  } else {
                      let leagueId = e.league.Id;
                      lastLeagueId = e.league.Id;
                      divider = null;
                      groupInfo = <LeagueHeader event={e} showStripe remove={(e) => removeLeague(leagueId)} />;
                  }

                  return (
                      e && (
                          <div className='my-2' key={'panel_' + e.fixture_id}>
                              {groupInfo}
                              {divider}
                              <Match selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} event={e} openMarketsModal={openMarketsModal} openStatisticsModal={openStatisticsModal} />
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
    openMarketsModal: PropTypes.func,
    openStatisticsModal: PropTypes.func,
    setExtraMarkets: PropTypes.func,
    selectExtraMarket: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeLeague: (leagueId) => dispatch(removeLeague(leagueId)),
    };
};

export default connect(null, mapDispatchToProps)(Matches);
