import React from 'react';
import PropTypes from 'prop-types';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import { useSelector } from 'react-redux';

function Match(props) {
    let { event } = props;
    let results = event.sport_event_status && event.sport_event_status.home_score  ? [ event.sport_event_status.home_score, event.sport_event_status.away_score ] : null;
    let sportId = event.sport_id;

    let periodWidth = sportId === lSportsConfig.sports.basketball.id ? 'results__score-md' : 'results__score-sm';
    let periods = event?.sport_event_status?.period_scores?.period_score ? event.sport_event_status.period_scores.period_score : null;
    let drawPeriods = Util.getSportPeriods(periods, sportId);
    let currentDate = Util.convertToLocalTimezone(event.start_date);
    let dateString = currentDate.dateString;
    let timeString = currentDate.timeString;

    let dateTime = (
        <div className="text-center text-black py-2 px-1">
            <time className="d-block">{dateString}</time>
            <time className="d-block">{timeString}</time>
        </div>
    );

    let participants = (
        <div className="results__participants text-gray-darker p-2">
            <span className="d-block ellipsis ls-0">{event.participant_one_full.name_en}</span>
            <span className="d-block ellipsis ls-0">{event.participant_two_full.name_en}</span>
        </div>
    );

    let statistics = event.sport_event_status && event.sport_event_status.statistics ? event.sport_event_status.statistics : null;
    let cards = sportId === lSportsConfig.sports.football.id ? Util.getSportCards(statistics) : null;
    let score = (
        <div className="results__score p-2">
            {drawPeriods}
            {results && (
                <div className={`text-green font-weight-bold ${periodWidth}`}>
                    
                    <span className="d-block">{results[0]}</span>
                    <span className="d-block">{results[1]}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="match__panel hybrid-tomorrow">
            <div className="results__panel">
                {dateTime}
                {participants}
                {cards}
                {score}
            </div>
        </div>
    );
}

Match.propTypes = {
    event: PropTypes.object,
};

export default Match;
