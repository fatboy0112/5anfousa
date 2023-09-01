import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Match from './Match';
import LeagueHeader from '../Shared/LeagueHeader';
import { removeLeague, setLocationsActive, setPrematchActive } from '../../store/actions/prematchActions';
import { isEmpty } from 'lodash';

function Matches(props) {
    const removeLeague = (leagueId) => {
        // If league is not in search results
        if (props.searchStarted) {
            props.removeLeague(leagueId);
        } else {
            props.setLocationsActive(true);
            props.setPrematchActive(false);
        }
    };

    let { events, openMarketsModal, openStatisticsModal, setExtraMarkets, selectExtraMarket } = props;
    let lastLeagueId = null;

    let drawMatches =
        events && events.length > 0
            ? map(events, (e, i) => {
                  let groupInfo = null;
                  let divider = null;

                  if (!isEmpty(e.league) && lastLeagueId === e.league.Id) {
                      divider = null;
                  } else if(!isEmpty(e.league)) {
                      let leagueId = e.league.Id;
                      lastLeagueId = leagueId;
                      divider = null;
                      groupInfo = <LeagueHeader event={e} showStripe remove={(e) => removeLeague(leagueId)} />;
                  }

                  return (
                      e && !isEmpty(e.market) && !isEmpty(e.league) &&  (
                          <div className='my-2'  key={'panel_' + e.fixture_id}>
                              {groupInfo}
                              {divider}
                              <Match event={e} selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} openMarketsModal={openMarketsModal} openStatisticsModal={openStatisticsModal} />
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
    setLocationsActive: PropTypes.func,
    setPrematchActive: PropTypes.func,
    searchStarted: PropTypes.bool,
    openMarketsModal: PropTypes.func,
    openStatisticsModal: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        searchStarted: state.prematch.searchStarted,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeLeague: (leagueId) => dispatch(removeLeague(leagueId)),
        setLocationsActive: (value) => dispatch(setLocationsActive(value)),
        setPrematchActive: (value) => dispatch(setPrematchActive(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Matches);
