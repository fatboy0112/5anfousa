import React from 'react';
import PropTypes from 'prop-types';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';
import { sportAndLocationData } from '../../config/sports';
import { lSportsConfig } from '../../config';

function LeagueHeader(props) {
    let { event, showStripe, language } = props;
    let iconName, locationId, leagueName, stripeClassname;
        let lang = `name_${language.toLowerCase()}`;
        iconName = Util.getSportIconByName(sportAndLocationData()[event.sport_id].Name);
        locationId = event.location.Id;
        leagueName = event.league[lang] ? event.league[lang] : event.league.name_en;
        stripeClassname = showStripe ? (event.fixture_status === lSportsConfig.statuses.inplay ? 'stripe_green' : 'stripe_blue') : '';

    return (
        <>
            {/*<a href="#">*/}
            {/*    <div className="arrow-div">*/}
            {/*        <img className="arrow-img" src="/images/arrow-left.png"/>*/}
            {/*    </div>*/}
            {/*</a>*/}
            <div className={`country ${stripeClassname}`}>

                <Grid container className='bg-gray-league-header mx-0  px-0  justify-content-between align-items-center flex-nowrap country__content'>
                    <a href="#">
                        <div className="arrow-div">
                            <img className="arrow-img" src="/images/arrow-left.png"/>
                        </div>
                    </a>
                    <Grid item xs={11} className="pl-2 text-overflow d-flex align-items-center">
                        {/* <i className={iconName + ' pr-1 align-middle'}></i> */}
                        <div country={'flag_' + (locationId === 250 ? 248 : locationId)} className="flag live-flag-25"></div>
                        <span className="pl-league-header text-light text-bold">{leagueName}</span>
                    </Grid>

                    {/* <Grid item xs={1} className="d-flex justify-content-end">
                    <i className="header__close-btn material-icons" onClick={remove}>
                        close
                    </i>
                </Grid> */}
                </Grid>
            </div>
        </>

    );
}

LeagueHeader.propTypes = {
    event: PropTypes.object,
    showStripe: PropTypes.bool,
    remove: PropTypes.func,
    isLive: PropTypes.bool,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

export default connect(mapStateToProps)(LeagueHeader);
