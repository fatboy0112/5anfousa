import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import filter from 'lodash.filter';
import find from 'lodash.find';
import { toastr } from 'react-redux-toastr';
import Grid from '@material-ui/core/Grid';
import MainMarket from '../Shared/MainMarket';
import Participants from '../Shared/Match/Participants';
import ExtraMarkets from '../Shared/Match/ExtraMarkets';
import Favorite from '../Shared/Match/Favorite';
import MatchDateTime from '../Shared/Match/MatchDateTime';
import { isEmpty } from 'lodash';
import { withRouter } from 'react-router';

function Match(props) {
    const openExtraOddsModal = (event, isSortedMarkets) => {
        if (isSortedMarkets) {
            props.setExtraMarkets(event.market);
            props.selectExtraMarket('All');
            props.openMarketsModal(event);
        } else {
            toastr.info('', 'There are no extra odds to show.');
        }
    };

    let { event, mainSelectedMarket, language } = props;
    let lang = `name_${language?.toLowerCase()}`;
    let leagueName = event.league[lang] ? event.league[lang] : event.league.Name;
    let sortedMarkets = event.market;
    let mainMarketEvent = find(sortedMarkets, (m) => m.Id === mainSelectedMarket);
    if (!mainMarketEvent) {
        mainMarketEvent = Object.values(sortedMarkets)[0];
    }
    sortedMarkets = filter(sortedMarkets, (m) => m.Id !== mainMarketEvent.Id);
    let isSortedMarkets = !isEmpty(event.market);
    if (mainMarketEvent === undefined) return null;
    return (
        <div className="match__panel">
            <div className="width-95 mx-auto match__wrap">
                <div className="match__left">
                    <Favorite fixture={event} />
                    <MatchDateTime fixture={event} showDate={true} />
                </div>

                <div className="match__right">
                    <Grid container className="pl-xs mx-auto match__info">
                        <Participants participants={[ event.participant_one_full,event.participant_two_full]} />
                        {/* {cards}
                        <MatchResult isLive={isLive} livescore={livescore} /> */}
                        {/* <Statistics isDisabled={!hasStatistics} onClick={(e) => openStatisticsModal(event)} /> */}
                        <ExtraMarkets onClick={(e) => openExtraOddsModal(event, isSortedMarkets)} />
                    </Grid>

                    <MainMarket market={mainMarketEvent} fixture={event} type="sports" leagueName={leagueName} />
                </div>
            </div>
        </div>
    );
}


Match.propTypes = {
    event: PropTypes.object,
    mainSelectedMarket: PropTypes.number,
    openMarketsModal: PropTypes.func,
    openStatisticsModal: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        mainSelectedMarket: state.prematch.mainSelectedMarket,
        statsData: state.general.statsData,
        language: state.general.language,
    };
};

export default withRouter(connect(mapStateToProps)(Match));
