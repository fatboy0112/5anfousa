import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Match from './Match';
import LeagueHeader from '../../Components/Shared/LeagueHeader';
import { removeFavorite } from '../../store/actions/favorites.actions';
import { lSportsConfig } from '../../config';

function Matches(props) {
    const removeFavorite = (id, fixtureId) => {
        props.removeFavorite(id, fixtureId);
    };

    let { events, openMarketsModal, openStatisticsModal, unsubscribeSingleEvents, selectExtraMarket, setExtraMarkets, openLiveStreamModal, liveStreamData} = props;

    let drawMatches =        
            map(events, (e, i) => {
                  let eventId = e.event_id ? e.event_id : '' ;
                    let isLive = e.fixture_status === lSportsConfig.statuses.inplay;
                  
                  let fixtureId = e.fixture_id ? e.fixture_id : e.FixtureId;
                  let groupInfo = <LeagueHeader event={e} isLive={e.Fixture  && e.Fixture.Status === lSportsConfig.statuses.inplay } showStripe remove={(e) => removeFavorite(eventId, fixtureId)} />;

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
                         <tr key={`panel_ ${e.fixture_id ? e.fixture_id : e.FixtureId}`} className={ !isLive && 'live'}>
                              {/* {groupInfo} */}
                              <Match liveStreamData={liveStreamData} openLiveStreamModal={openLiveStreamModal} event={e} selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} openMarketsModal={openMarketsModal} openStatisticsModal={openStatisticsModal} unsubscribeSingleEvents={unsubscribeSingleEvents}/>
                          </tr>
                      </>
                          
                      )
                  );
              })

    return <tbody>{drawMatches}</tbody>;
}

Matches.propTypes = {
    events: PropTypes.array,
    removeFavorite: PropTypes.func,
    openMarketsModal: PropTypes.func,
    openStatisticsModal: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeFavorite: (id, fixtureId) => dispatch(removeFavorite(id, fixtureId)),
    };
};

export default connect(null, mapDispatchToProps)(Matches);
