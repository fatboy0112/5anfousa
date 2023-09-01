import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Match from './Match';
import LeagueHeader from '../Shared/LeagueHeader';
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
                  
                  let fixtureId = e.fixture_id ? e.fixture_id : e.FixtureId;
                  let groupInfo = <LeagueHeader event={e} isLive={e.Fixture  && e.Fixture.Status === lSportsConfig.statuses.inplay } showStripe remove={(e) => removeFavorite(eventId, fixtureId)} />;

                  return (
                      e && (
                          <div key={`panel_ ${e.fixture_id ? e.fixture_id : e.FixtureId}`}>
                              {groupInfo}
                              <Match liveStreamData={liveStreamData} openLiveStreamModal={openLiveStreamModal} event={e} selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} openMarketsModal={openMarketsModal} openStatisticsModal={openStatisticsModal} unsubscribeSingleEvents={unsubscribeSingleEvents}/>
                          </div>
                      )
                  );
              })

    return <div>{drawMatches}</div>;
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
