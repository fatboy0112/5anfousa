import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Match from './Match';
import LeagueHeader from '../../Components/Shared/LeagueHeader';
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
                          <>
                            { groupInfo && (
                                <tr className="custom-league-header">
                                    <td colSpan='9' className='px-0 mx-0'>
                                        {groupInfo}
                                    </td>
                                </tr>
                            )}
                            <tr className='live' key={'panel_' + e.fixture_id}>
                                {/* {divider} */}
                                <Match selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} event={e} openMarketsModal={openMarketsModal} openStatisticsModal={openStatisticsModal} />
                            </tr>
                          </>
                      )
                  );
              })
            : null;

    return <tbody>{drawMatches}</tbody>;
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
