import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Util from '../../../helper/Util';
import { Translate } from '../../../localization';

const MatchBanner = (props) => {
  const { item } = props;

  const {
    'background-url': bgImgURL,
    'logo-1': logoOne,
    'logo-2': logoTwo,
    participants,
    start_date: scheduleTime,
    fixture_id: matchID,
    redirection: redirectionUrl,
    //   tournament: { id: tourID },
  } = item;

  let teamNames = [];
  if (participants) teamNames = [ participants?.[0], participants?.[1] ];
  let currentDate = {};
  let dateString = '';
  let timeString = '';
  if(scheduleTime) {
    currentDate = Util.convertToLocalTimezone(scheduleTime);
    dateString = currentDate.dateString;
    timeString = currentDate.timeString;
  }

  const spacesForTeamA = teamNames[ 1 ]?.length - teamNames[ 0 ]?.length;
  const spacesForTeamB = teamNames[ 0 ]?.length - teamNames[ 1 ]?.length;

  const getSpaces = (num) => ' '.repeat(num);

  return (
      <div key={ `banner_${ matchID }` } className='slider-content-wrap d-inline-block'>
          <div className='slider-image'>
              <img src={ bgImgURL || '/images/banner.jpg' } height='150' />
          </div>
          <div className='slider-content'>
              <div className='d-flex align-items-center justify-content-between'>

                  <div className='team-detail d-flex align-items-center justify-content-center max-width-33 '>
                      <span>
                          <img className='team-logo' src={ logoOne } />
                          <span title={ teamNames[ 0 ] } className='team-name'>
                              { spacesForTeamA > 1 ? getSpaces(spacesForTeamA / 2) : ''}
                              { teamNames?.length ? teamNames[ 0 ] : '' }
                              { spacesForTeamA > 1 ? getSpaces(spacesForTeamA / 2) : ''}
                          </span>
                      </span>
                  </div>

                  <div className='center-banner-content'>
                      <span className='team-logo-top-center'>
                          { `${ dateString } ${timeString}` }
                      </span>
                      <span className='team-logo-center max-width-33 '>
                          <img className='versus-logo' src='/images/vs.png' />
                      </span>
                      <Link to={ redirectionUrl } className='more-btn go-to-match-btn'>
                          { Translate.placeBet }
                      </Link>
                  </div>


                  <div className='team-detail d-flex align-items-center justify-content-center max-width-33 '>
                      <span className='team-logo-center-right'>
                          <img className='team-logo' src={ logoTwo } />
                          <span title={ teamNames[ 1 ] } className='team-name'>
                              { spacesForTeamB > 1 ? getSpaces(spacesForTeamB / 2) : ''}
                              { teamNames?.length ? teamNames[ 1 ] : '' }
                              { spacesForTeamB > 1 ? getSpaces(spacesForTeamB / 2) : ''}
                          </span>
                      </span>
                  </div>
              </div>
          </div>
      </div>
  );
};

MatchBanner.defaultProps = {
  timeZone: 'Africa/Dakar',
};

MatchBanner.propTypes = {
  item: PropTypes.arrayOf(PropTypes.any).isRequired,
  timeZone: PropTypes.string,
};

export default MatchBanner;
