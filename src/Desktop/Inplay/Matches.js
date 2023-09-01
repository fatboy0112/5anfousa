import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Match from './Match';
import LeagueHeader from '../../Components/Shared/LeagueHeader';
import { removeLeague } from '../../store/actions/inplayActions';
import { orderBy } from 'lodash';
// import { sortLiveEvents } from './../../config/sports'

function Matches(props) {
    const removeLeague = (leagueId) => {
        props.removeLeague(leagueId);
    };

    let { events, openMarketsModal, openStatisticsModal, openLiveStreamModal, liveStreamData } = props;
    let lastLeagueId = null;


    events = orderBy(events, ['league.Id'], ['desc']);
    // events = sortLiveEvents(events);
    let drawMatches =
        events && Object.keys(events).length > 0
            ? map(events, (e, i) => {
                  let groupInfo = null;
                  let divider = null;
                 
                  if (lastLeagueId === e.league.Id ) {
                      divider = <div className="match__divider" />;
                  } else {
                      let leagueId = e.league.Id;
                      lastLeagueId = leagueId;
                      divider = null;
                      groupInfo = <LeagueHeader isLive event={e} showStripe={true} remove={(e) => removeLeague(leagueId)} />;
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
                         <tr className='' key={`panel_${e.fixture_id}`}>
                              {/* {divider} */}
                              <Match liveStreamData={liveStreamData} openLiveStreamModal={openLiveStreamModal} event={e} openMarketsModal={openMarketsModal} openStatisticsModal={openStatisticsModal} />
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
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeLeague: (leagueId) => dispatch(removeLeague(leagueId)),
    };
};

export default connect(null, mapDispatchToProps)(Matches);
