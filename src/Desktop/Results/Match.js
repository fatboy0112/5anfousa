import React from 'react';
import PropTypes from 'prop-types';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import { useSelector } from 'react-redux';
function Match(props) {
    let { event } = props;
    const language = useSelector((state) => state.general.language);
    const lan =    `name_${ language }`;
    let results = event.sport_event_status && event.sport_event_status.home_score  ? [ event.sport_event_status.home_score, event.sport_event_status.away_score ] : ['', ''];
    let sportId = event.sport_id;

    let periods = event?.sport_event_status?.period_scores?.period_score ? event.sport_event_status.period_scores.period_score : null;
    let drawPeriods = Util.getSportPeriods(periods, sportId);
    let currentDate = Util.convertToLocalTimezone(event.start_date);
    let dateString = currentDate.dateString;
    let timeString = currentDate.timeString;

    let dateTime = (
        // <div className="text-center text-light py-2 px-1">
        <div>
            <time className="d-block">{dateString}</time>
            <time className="d-block">{timeString}</time>
        </div>
        // </div>
    );
    let rightSymbol = <span className='right_tick'>&#10003;</span>
    let participants = (
        // <div className="results__participants text-light p-2">
        <div className="team-detail">
            <span className="d-block ellipsis ls-0">{event.participant_one_full[lan] || event.participant_one_full.name_en}{ (results[0] > results[1]) ? rightSymbol : null}</span>
            <span className="d-block ellipsis ls-0">{event.participant_two_full[lan] || event.participant_two_full.name_en}{ (results[0] < results[1]) ? rightSymbol : null}</span>
        </div>
        // </div>
    );

    let statistics = event.sport_event_status && event.sport_event_status.statistics ? event.sport_event_status.statistics : null;
    let cards = sportId === lSportsConfig.sports.football.id ? Util.getSportCards(statistics, true) : null;
    let score = (
        <div className="results__score min_width result-scrore-wrap">
            {drawPeriods}
            {results && (
                // <div className={`text-green font-weight-bold ${periodWidth}`}>
                <div>   
                    <span className="d-block text-success font-weight-bold">{results[0]}</span>
                    <span className="d-block text-success last_span">{results[1]}</span>
                </div>
                // </div>
            )}
        </div>
    );

    return (
        <>

            <td className="fav-star">
                {dateTime}
            </td>
            <td className="team-name">
                {participants}
            </td>
            <td  className="score-section">
                <div className="d-flex  justify-content-end">
                    {cards}
                    {score}
                </div>
            </td>
        </>
    );
}

Match.propTypes = {
    event: PropTypes.object,
};

export default Match;
