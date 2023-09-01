import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Tooltip from '@material-ui/core/Tooltip';
import forEach from 'lodash.foreach';
import { Translate } from '../../localization';
import { 
    checkSavedBets,
    updateBetslipEventsLivescore,
    updateBetslipEventsMarket,
} from '../../store/actions/betslip.actions';
import { lSportsConfig } from '../../config/lsports.config';
import find from 'lodash.find';
import Util from '../../helper/Util';
import { dynamoClient } from '../../App';
import { getSingleMarketOfEvent } from '../../dynamo/inplayParams';
import { 
   getTenentStatus
} from '../../store/actions/general.actions';
import Login from '../Login';


let timeout;

class Navigator extends Component {
    constructor(props) {
        super(props);
        this.state = {
          redirectLink: '',
            showTooltip : false,
            showLogin:false
            
        };
    }

    componentDidMount() {
        this.props.checkSavedBets();
        this.props.getTenentStatus();
    }

    componentDidUpdate(prevProp, prevState) {
        if(this.props.count !== prevProp.count && this.props.count > 0 ) {
            // also check to clear timeout or not
            this.openTooltip(prevState.showTooltip);
        }
    }

      showLoginForm=(path)=>{
      if(Util.isLoggedIn()){
        this.setState({ showLogin: false });
        this.props.history.push(path);
        }
       else{
        this.setState({ showLogin: true ,
          redirectLink:path});
       ;
      }
    
    };

    hideLogin = () => {
   
      if(Util.isLoggedIn()){
      this.setState({ showLogin: false });
      this.props.history.push(this.state.redirectLink);
      }
     else{
      this.setState({ showLogin: false });
     }};

    toggleNavigation = (e, nav) => {
        this.GoTo(nav);
    };

    GoTo = (path) => {
        let newPath = '/' + path;
        this.props.history.push(newPath);
    }; 

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    openTooltip = (clearStripTimeout) => {
        this.checkLiveOddsUpdates(clearStripTimeout);
    }

    checkLiveOddsUpdates(clearStripTimeout) {
        const { fixtures } = this.props;
        let count = 0 ;
        forEach( fixtures , (fixture) => {
            if(fixture.fixture.fixture_status === 2) {
                forEach( fixture.markets, (market) => {
                    forEach( market.bets, (bet) => {
                        let event =  dynamoClient.query(getSingleMarketOfEvent(`${fixture.fixtureId}_market_${market.Id}`)).promise();
                        event.then(({  Items }) => {
                            if(!Items[0]) return;
                            let data = Items[0];
                            data = { ...data, market: JSON.parse(data.market)};
                            const betData = find(Object.values(data.market), (market) => market.Bets[`id_${bet.Id}`]).Bets[`id_${bet.Id}`];
                            if( betData.Price !== bet.Price ) {
                                let id = data.match_id;
                                let dataToSend = {};
                                dataToSend[id] = { FixtureId: data.match_id, Market: data.market };
                                this.props.updateBetslipEventsMarket(dataToSend);
                                this.props.updateBetslipEventsLivescore(dataToSend);
                            }
                            
                        }).then(() => {
                            count++;
                           if(count === fixtures.length) {
                               if(clearStripTimeout && timeout) {
                                   clearTimeout(timeout);
                               }
                               if(!this.state.showTooltip ) {
                                   this.setState({ showTooltip: true });
                               }
                               timeout = setTimeout(() => { 
                                   this.setState({ showTooltip: false });
                               }, lSportsConfig.oddsCalculatorTimer * 1000);
                           }
                           });
                    });
                });
            }
            else {
                count++;
                if(count === fixtures.length) {
                    if(clearStripTimeout && timeout) {
                        clearTimeout(timeout);
                    }
                    if(!this.setState.showTooltip) {
                        this.setState({ showTooltip: true });
                    }
                    timeout = setTimeout(() => { 
                        this.setState({ showTooltip: false });
                    }, lSportsConfig.oddsCalculatorTimer * 1000);
                }
            }
        });      
    }

    render() {
        let { location, count, totalMultiOdds, totalOdds, isHomeLeagueActive } = this.props;
        let { showTooltip } = this.state;
        let myBets = this.isLoggedIn() ? (
            <div className={`menu-item ripple ${location.pathname === '/my-bets' ? 'active' : ''}`} onClick={(e) => this.toggleNavigation(e, 'my-bets')}>
                <div className="menu-item__content">
                    <div className="menu-item__wrap">
                        <img src= "/images/mybetf.svg" alt="mybetf" />
                        <img src= "/images/mybetf.svg" alt="mybetf" />
                        <div className="menu-item__text">{Translate.myBets}</div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="menu-item ripple disabled">
                <div className="menu-item__content">
                    <div className="menu-item__wrap">
                        {/* <i className="icon-my-bets"></i> */}
                        <img src= "/images/mybetf.svg" alt="mybetf" />
                        <img src= "/images/mybetf.svg" alt="mybetf" />
                        <div className="menu-item__text">{Translate.myBets}</div>
                    </div>
                </div>
            </div>
        );
        let casinoClass = '';
        
        if(this.props.userData) {
            casinoClass = this.props.userData.is_casino_enabled ? '': 'disabled';
        }

        let drawBetslipCount = count > 0 ? <span className="navigator__tooltip-bit navigator__tooltip-text">{count}</span> : null;

        const BetslipTooltip = withStyles({
            tooltip: {
              color: '#1e140d',
              background: '#f2b705',
              fontSize: '15px',
              minWidth: 'calc(100vw - 5px)',
              textAlign: 'center',              
              borderRadius: '16px 16px 0px 0px',
              margin: '34px 0',
            },
            arrow: {
                color: '#f2b705',
                bottom: 0,
                marginLeft: '4px',
                marginRight: '-6px',
                marginBottom: '-0.71em',
                fontSize: 15,
                '&::before' : {
                    transformOrigin: '100% 0',
                }
            },

            
            
          })(Tooltip);
          
        return (
            <div className="navbar mui-fixed">
                <div className={`menu-item ripple ${location.pathname === '/sports' ? 'active' : ''}`} onClick={(e) => this.toggleNavigation(e, 'sports')}>
                    <div className="menu-item__content">
                        <div className="menu-item__wrap">
                            <img src="/images/sportsf.svg" alt="Home" />
                            <img src="/images/sportsf.svg" alt="Home" />
                            <div className="menu-item__text">{Translate.sports}</div>
                        </div>
                    </div>
                </div>

                <div className={`menu-item ripple ${location.pathname === '/live' ? 'active' : ''}`} onClick={(e) => this.toggleNavigation(e, 'live')}>
                    <div className="menu-item__wrap menu-item__content menu-item__content_live">
                        <img src="/images/liveF.svg" alt="live" />
                        <img src="/images/liveF.svg" alt="live" />
                        <span className="menu-item__text">{Translate.live}</span>
                    </div>
                </div>



                <div className={`menu-item ripple ${location.pathname === '/' ? 'active' : ''}`} onClick={(e) => this.toggleNavigation(e, '')}>
                    <div className="menu-item__content">
                        <div className="menu-item__wrap">
                            <a className="main-mobile-menu__logo" href="/"><span
                                className="main-mobile-menu__logo-text">Accueil</span></a>

                        </div>
                    </div>
                </div>




                {myBets}

                <div
                    className={`menu-item ripple pl-0 pr-0 ${count > 0 ? '' : 'disabled'} ${location.pathname === '/betslip' && count > 0 ? 'active' : ''}`}
                    onClick={(e) => this.toggleNavigation(e, 'betslip')} 
                >
                    <BetslipTooltip
                        placement="top"
                        open = { showTooltip && count > 0 && ( location.pathname === '/upcoming' || location.pathname === '/tomorrow' || location.pathname === '/sports' || location.pathname === '/live' || location.pathname === '/favorites' || ( location.pathname === '/' && isHomeLeagueActive) ) ? true : false }
                        arrow
                        leaveDelay={1000}
                        interactive
                        title={`${count} X Comb. ${count > 1 ? totalMultiOdds : totalOdds}`}
                        PopperProps={{
                            popperOptions: {
                                positionFixed: true,
                            },
                    
                            modifiers: {
                                computeStyle: {
                                    gpuAcceleration: false,
                                    fn: (data => {
                                        data.styles = {
                                            position : 'fixed',
                                            bottom: '4vh',
                                            left: '0',
                                            right: '0',
                                            display: 'flex',
                                            justifyContent: 'center',
                                        };
                                        data.arrowStyles = {
                                            right: '8vw'
                                        };
                                        return data;
                                    })
                                },
                                applyStyle: {
                                    onLoad: ((data) => data),                                 
                                },
                            },
                              
                        }}  
                        disableHoverListener
                    >
                   
                        <div className="menu-item__content navigator navigator__tooltip">
                            <div className="menu-item__wrap">
                                {drawBetslipCount}
                                {/* <i className="material-icons menu-item__betslip-icon" >receipt</i> */}
                                <img src="/images/betslipf.svg" alt="betsslipf" />
                                <img src="/images/betslipf.svg" alt="betsslipf" />
                                <div className="menu-item__text">{Translate.betslip}</div>
                            </div>
                        </div>           
                    </BetslipTooltip>    
                </div>
                {this.state.showLogin && <Login hideLogin={this.hideLogin} />}


            </div>
        );
    }
}

Navigator.propTypes = {
    userData: PropTypes.object,
    count: PropTypes.number,
    language: PropTypes.string,
    checkSavedBets: PropTypes.func,
    totalMultiOdds: PropTypes.string,
    fixtures: PropTypes.array,
    totalOdds: PropTypes.string,
    isHomeLeagueActive: PropTypes.bool,
    updateBetslipEventsLivescore: PropTypes.func,
    updateBetslipEventsMarket: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        count: state.betslip.count,
        language: state.general.language,
        totalMultiOdds: state.betslip.totalMultiOdds,
        totalOdds: state.betslip.totalOdds,
        fixtures: state.betslip.fixtures,
        isHomeLeagueActive: state.home.isHomeLeagueActive,
        isShowCasino:state.general.isShowCasino
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        checkSavedBets: () => dispatch(checkSavedBets()),
        updateBetslipEventsLivescore: (events) => dispatch(updateBetslipEventsLivescore(events)),
        updateBetslipEventsMarket: (events) => dispatch(updateBetslipEventsMarket(events)),
        getTenentStatus:()=>dispatch(getTenentStatus())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);
