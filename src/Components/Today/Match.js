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
import { endOfToday } from 'date-fns';

function Match(props) {
    const openExtraOddsModal = (event, count) => {
        if (count > 0) {
            props.openMarketsModal(event);
            props.setExtraMarkets(event.market);
            props.selectExtraMarket('All');
        } else {
            toastr.info('', 'There are no extra odds to show.');
        }
    };

    let { event, mainSelectedMarket, statsData, language } = props;
    let lang = `name_${language.toLowerCase()}`;
    let leagueName = event.league[lang] ? event.league[lang] : event.league.name_en;
    let sortedMarkets = event.market;
    let mainMarketEvent = find(sortedMarkets, (m) => m.Id === mainSelectedMarket);
    if (!mainMarketEvent) {
        mainMarketEvent = {
            Id: mainSelectedMarket,
            Name: '',
            Bets: null,
        };
    }
    sortedMarkets = filter(sortedMarkets, (m) => m.Id !== mainMarketEvent.Id);
    let sortedMarketsLength = Object.keys(event.market).length;
    if (mainMarketEvent === undefined) return null;
    let hasStatistics = event.has_live_statistics || event.has_prematch_statistics;
    if (statsData?.[+event.fixture_id]) {
        hasStatistics = true;
    }
    let showDate = false;
    if (new Date(event.start_date) > new Date (endOfToday())) {
        showDate = true;
    }

    return (
        <div className="match__panel hybrid-tomorrow">
            <div className="width-95 mx-auto match__wrap">
                <div className="match__left">
                    <Favorite fixture={event} />
                    <MatchDateTime fixture={event} showDate={showDate} />
                </div>

                <div className="match__right">
                    <Grid container className="pl-xs mx-auto match__info">
                        <Participants participants={event.participants} />
                        {/* {cards}
                        <MatchResult isLive={false} livescore={false} /> */}
                        {/* <Statistics isDisabled={!hasStatistics} onClick={(e) => openStatisticsModal(event)} /> */}
                        <ExtraMarkets extraMarketsNumber={sortedMarketsLength} onClick={(e) => openExtraOddsModal(event, sortedMarketsLength)} />
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
    setExtraMarkets: PropTypes.func,
    selectExtraMarket: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        mainSelectedMarket: state.today.mainSelectedMarket,
        statsData: state.general.statsData,
        language: state.general.language,
    };
};

export default connect(mapStateToProps)(Match);
