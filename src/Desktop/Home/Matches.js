import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Match from './Match';
import LeagueHeader from '../../Components/Shared/LeagueHeader';
import { removeHomeActiveLeague } from '../../store/actions/home.actions';

function Matches(props) {
    const removeLeague = () => {
        props.removeHomeActiveLeague();
    };

    let { events, openMarketsModal, openStatisticsModal, setExtraMarkets, selectExtraMarket } = props;
    let lastLeagueId = null;

    let drawMatches =
        events && events.length > 0
            ? map(events, (e, i) => {
                let groupInfo = null;
                let divider = null;
                if (lastLeagueId === e.league_id) {
                    divider = <div className="match__divider" />;
                } else {
                    lastLeagueId = e.league_id;
                    divider = null;
                    groupInfo = <LeagueHeader event={e} showStripe remove={(e) => removeLeague()} />;
                }

                return (
                    e && (
                        <>
                            { groupInfo && (
                                <tr className="custom-league-header">
                                    <td colSpan='8' className='px-0 mx-0'>
                                        {groupInfo}
                                    </td>
                                </tr>
                            )}
                            <tr className='live' key={'panel_' + e.fixture_id}>
                            {/* {divider} */}
                            <Match event={e} selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} openMarketsModal={openMarketsModal} openStatisticsModal={openStatisticsModal} />
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
    openMarketsModal: PropTypes.func,
    openStatisticsModal: PropTypes.func,
    removeHomeActiveLeague: PropTypes.func,
    setExtraMarkets: PropTypes.func,
    selectExtraMarket: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeHomeActiveLeague: () => dispatch(removeHomeActiveLeague()),
    };
};

export default connect(null, mapDispatchToProps)(Matches);
