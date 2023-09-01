import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { getPrematchLocations, clearPartialLocations } from '../../store/actions/todayActions';
import { lSportsConfig } from '../../config';
import { setTodaySportsWithDateRangeDesktop, getSportEventsDesktop, selectSportMobile, setDateFilter ,getPrematchLocationsDesktop} from '../../store/actions/todayActions';
import { setHomeLeaguesActive } from '../../store/actions/home.actions';
import { useLocation } from 'react-router-dom';
import OwlCarousel from 'react-owl-carousel2';
import { withRouter } from 'react-router-dom';

const options = {
    // items: 10,
    navText: ['<div class=\'nav-btn prev-slide\'></div>','<div class=\'nav-btn next-slide\'></div>'],
    nav: true,
    dots: false,
    responsive:{
        1200:{
            items:10
        },
        1300:{
            items:11
        },
        1400:{
            items:12
        },
        1600:{
            items:12
        },
        1900:{
            items:14
        },
    }
};



const Filter = (props) => {
    const { sports, selectedSport, selectSportMobile, isDisable, mainEvents, isHomeLeagueActive, noEvents } = props;
    const location = useLocation();
    const isFavActive = useMemo(() => location.pathname.split('/')[2] === 'favorites', [ location ]);
    const isLiveBets = useMemo(() => location.pathname.split('/')[2] === 'live-betting', [ location ]);
    const isHomeActive = useMemo(() => !location.pathname.split('/')[2], [ location ]);
    const isExtraOddsActive = useMemo(() => props.match.path == "/d/extra-market/:sportId/:fixtureId" || 
    props.match.path == "/d/live-bettingextra-market/:sportId/:fixtureId/:liveStreamAvailable", [ props.match ]);
    
    useEffect(() => {
        if(!selectedSport) {
            selectSportMobile(lSportsConfig.inplay.selectedSport);
        }
    }, [selectSportMobile, selectedSport]);

    const handleChangeSport = (sportId) => {
        if (!isHomeLeagueActive && sportId === props.selectedSport) return null;
        if (isLiveBets && !props.inplayLoading) return props.selectSportMobile(sportId);
        if ((mainEvents.length !== 0 || noEvents || isHomeLeagueActive) && !isFavActive) {
            props.selectSportMobile(sportId);
            props.clearPartialLocations();
            props.getPrematchLocationsDesktop();
        }
        else if (isFavActive) {
            props.selectSportMobile(sportId);
        }
        props.setHomeLeaguesActive(false);
        // if (isExtraOddsActive){
        //     selectSportMobile(sportId);
        //     if (isExtraActiveLive) 
        //     props.history.push('/d/live-betting');
        //     else if(isExtraActivePre) 
        //     props.history.push('/d/sports');
        // }  
    };

    let dateList = [];
    // for (var i = 0; i < 7; i++) {
    //     let date = new Date();
    //     let day = date.setDate(date.getDate() + i);
    //     let dayFormat = format(day, 'yyyy-MM-dd');        
    //     let dayFormatToShow = format(day, 'dd/MM');

    //     let preDefinedDay = null;
    //     if (i===0) preDefinedDay = Translate.today;
    //     else if (i===1) preDefinedDay = Translate.tomorrow;
    //     else preDefinedDay = dayFormatToShow;

    //     dateList.push(
    //         <li key={i} className='date-filter__item pre-match-wrapper' onClick={(e) => handleClick(e, dayFormat)}>
    //             <a href className={`${!isHomeLeagueActive && dateFilter === dayFormat && 'active'}`}>{ preDefinedDay }</a>
    //         </li>,
    //     );
    // }
  return (
      <div className="d-flex flex-wrap links-block w-75">
          { !isHomeActive && !isExtraOddsActive && <div id='sport-filter' className="game-block w-100">
              { <ul className="d-flex">
                  <OwlCarousel
                        id='owl-demo'
                        options={ options }
                    >
                      { Object.values(sports).map(item => {
                      let sportId = item.sport_id;
                      let sportName = item.name;
                      const className = !isHomeLeagueActive && sportId == selectedSport ? 'active' : '';
                      return (
                        
                          <li onClick={ !isDisable ? (e) => handleChangeSport(sportId) : null } key={sportId}>
                              <a href className={ className }>
                                  {/* <div className='sports__counter'> 20 </div> */}
                                  {/* <img alt="stream-icon" className="nav-ico-dark" src={`/images/sports/${item.icon_name}-desktop.svg`}></img> */}
                                  <img alt="stream" className="nav-ico-light" src={`/images/sports/${item.icon_name}-desktop-white.svg`}></img>
                                  <span>{sportName}</span>
                                  <span id={`sport-filter-${ sportId }`} />
                              </a>
                          </li>
                          
                      );
                  })}
                  </OwlCarousel>
              </ul>
            }
          </div>
        }
         <div className="sort-links">
              <ul className="d-flex">
                  { !isLiveBets && dateList}
              </ul>
          </div>

      </div>
  );
};


const mapStateToProps = (state) => {
    return {
        dateFilter: state.today.dateFilter,
        selectedSport: state.today.selectedSport,
        mainEvents: state.today.mainEvents,
        noEvents: state.today.noEvents,
        language: state.general.language,
        isHomeLeagueActive: state.home.isHomeLeagueActive,
        inplayLoading: state.inplay.isLoading,	
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setDateFilter: (value) => dispatch(setDateFilter(value)),
        selectSportMobile: (sportId) => dispatch(selectSportMobile(sportId, true)),
        setTodaySportsWithDateRangeDesktop: () => dispatch(setTodaySportsWithDateRangeDesktop()),
        getSportEventsDesktop: (sportId) => dispatch(getSportEventsDesktop(sportId)),
        setHomeLeaguesActive: (value) => dispatch(setHomeLeaguesActive(value)),
        getPrematchLocations: () => dispatch(getPrematchLocations()),
        clearPartialLocations: () => dispatch(clearPartialLocations()),
        getPrematchLocationsDesktop: () => dispatch(getPrematchLocationsDesktop()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Filter));