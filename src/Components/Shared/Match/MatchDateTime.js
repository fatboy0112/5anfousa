import React from 'react';
import PropTypes from 'prop-types';
import Util from '../../../helper/Util';
import { lSportsConfig } from '../../../config';
import { withRouter } from 'react-router';
import { includes } from 'lodash';
import { betradarConfig } from '../../../config/betradar.config';

function MatchDateTime(props) {
    let { fixture, showDate } = props;
    let isLive, time, halfTime, extraTime, currentTime, currentDate, dateString, timeString, matchDateTime, sportId, overTime;
    if (fixture.fixture_status !== lSportsConfig.statuses.inplay) {
        isLive = fixture.fixture_status === lSportsConfig.statuses.inplay;

        time = fixture.livescore && fixture.livescore.clock && fixture.livescore.clock.match_time ? fixture.livescore.clock.match_time : 0;
        time = fixture.livescore && fixture.livescore.clock && fixture.livescore.clock.match_time ? parseInt(time * 0.0166666667) + 1 : 0; // Convert to seconds
        halfTime = false;


        if (fixture.livescore && fixture.livescore.match_status === 31) {
            time = 'HT'; // Break Time
            halfTime = true;
        }
        currentTime = (
            <span className={`match__time ${halfTime ? 'match__time_ht' : ''}`}>
                {time}
                {!halfTime && "'"}
            </span>
        );
        if(fixture.start_date) {

        currentDate = Util.convertToLocalTimezone(fixture.start_date);

        dateString = currentDate.dateString;
        timeString = currentDate.timeString;
        }
        matchDateTime = (
            <span className="text-black match__datetime">
                {showDate && <time className="d-block">{dateString}</time>}
                <time className="d-block">{timeString}</time>
            </span>
        );

    }
    else {

        isLive = fixture.fixture_status === lSportsConfig.statuses.inplay;
        halfTime = false;
        overTime = false;
        sportId = fixture.sport_id;
        

        switch (sportId) {
            case 1: // Football
                time = fixture.Livescore && fixture.Livescore.clock && fixture.Livescore.clock.match_time ? fixture.Livescore.clock.match_time.split(':')?.[0] : 0;
                extraTime = fixture.Livescore && fixture.Livescore.clock && fixture.Livescore.clock.stoppage_time ? fixture.Livescore.clock.stoppage_time.split(':')?.[0] : 0
                if (extraTime) {
                    let { match_status } = fixture.Livescore;
                    if ((match_status == '6' && time >= '45') || (match_status == '7' && time >= '90')) time = `${ time }+${ +extraTime+1 }`;
                }
                if (time && fixture.Livescore.clock.match_time.split(':')?.[1] !== '00') time = isNaN(+time) ? time : +time + 1;
                // time = Math.ceil(time / 60);
                if (fixture.Livescore && +fixture.Livescore.match_status === 31) {
                    time = 'HT'; // Break Time
                    halfTime = true;
                }
                if (fixture.Livescore && +fixture.Livescore.match_status === 50) {
                    time = 'Pen'; // Penalties
                    halfTime = true;
                }
                if (fixture.Livescore && +fixture.Livescore.match_status === 41) {
                    time = 'OT 1HT'; // Penalties
                    halfTime = true;
                }
                if (fixture.Livescore && +fixture.Livescore.match_status === 42) {
                    time = 'OT 2HT'; // Penalties
                    halfTime = true;
                }
                currentTime = (
                    <span className={`match__time ${halfTime ? 'match__time_ht' : ''}`}>
                        {time}
                        {!halfTime && "'"}
                    </span>
                );
                break;
            case 2: //Basketball
                time = fixture.Livescore && fixture.Livescore.clock && fixture.Livescore.clock.match_time ? fixture.Livescore.clock.match_time.split(':')?.[0] : 0;
                if (time) time = isNaN(+time) ? time : +time + 1;
                // time = Math.ceil(time / 60);
                if (fixture.Livescore && +fixture.Livescore.match_status === 31) {
                    time = 'HT'; // Break Time
                }

                if (fixture.Livescore && +fixture.Livescore.match_status === 40) {
                    time = 'OT'; // Over Time
                }
                let quarter = '';
                if (betradarConfig.quarterPeriods.indexOf(+fixture?.Livescore?.match_status) > -1) {
                    quarter = betradarConfig.period[fixture.Livescore.match_status]?.period_number;
                }
                currentTime = (
                    <div style={{ display: "flex", alignItems: "center"}}>
                        {!isNaN(time) && <span className={``}>{`Q${quarter}`}</span>}
                        <span className={`match__time ${isNaN(time) ? 'match__time_ht' : ''}`}>
                            {time}
                            {!isNaN(time) && "'"}
                        </span>
                    </div>
                );
                break;
            case 4: // Ice Hockey
                time = fixture.Livescore && fixture.Livescore.clock && fixture.Livescore.clock.match_time ? fixture.Livescore.clock.match_time.split(':')?.[0] : 0;
                if (time) time = isNaN(+time) ? time : +time + 1;
                // time = Math.ceil(time / 60);
                let hset = '';
                
                if (fixture.Livescore && +fixture.Livescore.match_status === 31) {
                    time = 'HT'; // Break Time
                }
                if (fixture.Livescore && +fixture.Livescore.match_status === 40) {
                    time = 'OT'; // Over Time
                }

                if (fixture.Livescore && +fixture.Livescore.match_status === 50) {
                    time = 'Pen'; // Penalties
                }

                if (fixture.Livescore && +fixture.Livescore.match_status === 301) {
                    time = '1Brk'; // First Break
                }

                if (fixture.Livescore && +fixture.Livescore.match_status === 302) {
                    time = '2Brk'; // Second Break
                }

                hset = time;

                if (betradarConfig.iceHockeyPeriods.indexOf(+fixture?.Livescore?.match_status) > -1) {
                    hset = `P${betradarConfig.period[fixture.Livescore.match_status]?.period_number || ''}`;
                }
                currentTime = (
                    <div>
                        <span className={`match__time ${isNaN(time) ? 'match__time_ht' : ''}`}>
                            {hset}
                            {!isNaN(time) && "'"}
                        </span>
                    </div>
                );
                break;
            case 5: // Tennis
                time = fixture.Livescore && fixture.Livescore.clock && fixture.Livescore.clock.match_time ? fixture.Livescore.clock.match_time.split(':')?.[0] : 0;
                if (time) time = isNaN(+time) ? time : +time + 1;
                if (fixture.Livescore && +fixture.Livescore.match_status === 31) {
                    time = 'HT'; // Break Time
                }

                if (fixture.Livescore && +fixture.Livescore.match_status === 60) {
                    time = 'Game';
                }
                let set = '';
                if (betradarConfig.setPeriods.indexOf(+fixture?.Livescore?.match_status) > -1) {
                    set = `${betradarConfig.period[fixture.Livescore.match_status]?.period_number || ''}`;
                }
                currentTime = (
                    <div>
                        <span className={` ${isNaN(time) ? 'match__time_ht' : ''}`}>
                            {!isNaN(time) ? `Set ${set}` : time}
                        </span>
                    </div>
                );
                break;
            case 23: // Volleyball
                time = fixture.Livescore && fixture.Livescore.clock && fixture.Livescore.clock.match_time ? fixture.Livescore.clock.match_time.split(':')?.[0] : 0;
                if (time) time = isNaN(+time) ? time : +time + 1;
                if (fixture.Livescore && +fixture.Livescore.match_status === 31) {
                    time = 'HT'; // Break Time
                }
                if (fixture.Livescore && +fixture.Livescore.match_status === 17) {
                    time = 'Golden Set';
                }

                if (fixture.Livescore && +fixture.Livescore.match_status === 60) {
                    time = 'Game';
                }

                let vset = '';
                if (betradarConfig.setPeriods.indexOf(+fixture?.Livescore?.match_status) > -1) {
                    vset = `${betradarConfig.period[fixture.Livescore.match_status]?.period_number || ''}`;
                }

                currentTime = (
                    <div>
                        <span className={` ${isNaN(time) ? 'match__time_ht' : ''}`}>
                            {!isNaN(time) ? `Set ${vset}` : time}
                        </span>
                    </div>
                );
                break;
            case 10: // Boxing
                break;
            default:
                break;
        }
       
    }

    const fromExtraMarket = includes(props.location.pathname, '/extra-market/'); 
    return <div className={`match__time-wrap ${!fromExtraMarket ? 'pb-1' : ''}`}>{isLive ? currentTime : matchDateTime}</div>;
}

MatchDateTime.propTypes = {
    fixture: PropTypes.object,
    showDate: PropTypes.bool,
};

export default withRouter(MatchDateTime);
