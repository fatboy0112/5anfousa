import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { isEmpty } from 'lodash';
import Match from './Match';
import LeagueHeader from '../Shared/LeagueHeader';
import { removeLeague } from '../../store/actions/lastMinuteActions';

function Matches(props) {
    const removeLeague = (leagueId) => {
        props.removeLeague(leagueId);
    };

    let { events, openMarketsModal, openStatisticsModal,setExtraMarkets, selectExtraMarket } = props;
    let lastLeagueId = null;
    let drawMatches =
        events && events.length > 0
            ? map(events, (e, i) => {
                  let groupInfo = null;
                  let divider = null;
                  if (!isEmpty(e.league) && lastLeagueId === e.league) {
                      divider = <div className="match__divider" />;
                  } else if(!isEmpty(e.league)) {
                      let leagueId = e.league.Id;
                      lastLeagueId = leagueId;
                      divider = null;
                      groupInfo = <LeagueHeader event={e} showStripe remove={(e) => removeLeague(leagueId)} />;
                  }

                  return (
                      e && !isEmpty(e.market) && (
                          <div className='my-2' key={'panel_' + e.fixture_id}>
                              {groupInfo}
                              {divider}
                              <Match event={e}  selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} openMarketsModal={openMarketsModal} openStatisticsModal={openStatisticsModal} />
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
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeLeague: (leagueId) => dispatch(removeLeague(leagueId)),
    };
};

export default connect(null, mapDispatchToProps)(Matches);
