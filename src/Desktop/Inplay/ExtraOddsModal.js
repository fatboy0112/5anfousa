import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { lSportsConfig, maxWebsocketRetryCount } from '../../config';
import jwtService from '../../services/jwtService';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@material-ui/core';
import Markets from './Markets';
import { getExtraMarkets, clearExtraMarkets, selectExtraMarket, setStatistics, clearStatistics, setExtraMarketLocationName, setExtraMarketLeagueName } from '../../store/actions/lsports.global.actions';
import Statistics from '../Shared/Statistics';
import ExtraMarketSelector from '../Shared/ExtraMarketSelector';
import { filter, forEach, isEqual, uniqBy, isEmpty, map } from 'lodash';
import MatchDateTime from '../../Components/Shared/Match/MatchDateTime';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import withStyles from '@material-ui/core/styles/withStyles';
import FiveFeaturedMarkets from '../FiveFeaturedMarkets.js';
import Loading from '../../Components/Common/Loading';
import { dynamoClient } from '../../App';
import { getSingleLivePartialEvent, getLiveMatchMarkets } from '../../dynamo/inplayParams';
import find from 'lodash.find';
import { API, graphqlOperation } from 'aws-amplify';
import { onUpdateMatchMarkets } from '../../graphql/subscriptions';
import { withRouter } from 'react-router-dom';
const styles = {
    root: {
      position: 'absolute',
      right: '47px',
      overflow: 'auto',
      top: '56px',
      backgroundColor: '#f5f5f5',
      borderRadius: '10%', 
      elevation: 'above',
      boxShadow: '0px 0px 10px 3px #333',
      zIndex: '99'
     
    },
    listSection: {
      padding: '0',
      textAlign: 'center',
      backgroundColor: 'inherit',
    },
    ul: {
      backgroundColor: 'inherit',
      padding: 0,
      fontSize:'5vw',
    },
  };

let extraMarkets = {};
let marketSubscription;
let liveMatchSub;
let liveMatchSubConnectionAttempts = 0;
let liveMatchSubAppSync;

class ExtraOddsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            marketsUpdated: null,
            liveStreamGameId: null,
            showLiveStream: false,
            selectedUrl: 0,
            streamUrlData: [],
            showStreamDropdown: false,
            liveMatch: {},
            isLoading: false,
            showLogin: false,
            statsObj: {},
            noEvent: false,
            isDisconnected: false,
        };
    }

    componentDidMount() {
        let { extraMarketEvent, match, liveStreamData, event, language } = this.props;
        this.props.selectExtraMarket('All');
        let fixtureId = match.params.fixtureId;
        if(extraMarketEvent && false) {
            this.setExtraMarketData(extraMarketEvent);
        } else {
            // in case not from live page i.e. using refresh
            this.setState({isLoading: true});
        }
        
        this.subscribeExtraMarket(fixtureId);
        this.setLiveMatchData();

        // if(isEmpty(liveStreamData)) {
        //     this.fetchLiveStreamMatches().then(e => this.setLiveStream());
        // } else {
        //     this.setLiveStream();
        // }
        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
        
         
        // let fixtureId = extraMarketEvent.FixtureId;
       
        // this.props.setStatistics(fixtureId, 'forPopup', 'live');
    }

    setLiveStream =  () => {
        let { match, liveStreamData } =this.props;
        let authed = localStorage.getItem('jwt_access_token') || sessionStorage.getItem('jwt_access_token') ? true : false;
        let liveStreamAvailable = match.params.liveStreamAvailable;
        let fixtureId = match.params.fixtureId;

        let selectedEvents = filter(liveStreamData, (e) =>  e.matchId == fixtureId );
            selectedEvents = uniqBy(selectedEvents, (e) => e.iframe);
            if(selectedEvents.length && selectedEvents[0].live === '1') {
                this.setState({ streamUrlData:  selectedEvents});
            }
        
        // if(liveStreamAvailable === 'true' && authed) {
        //     this.setState({showLiveStream: true});
        // }
    } 

    setLiveMatchData = (startListener) => {
        const { match } = this.props;
        let sportId = match.params.sportId;
        let fixtureId = match.params.fixtureId;
        
        let matchEvent = {};
        this.getSingleMatchMarkets(fixtureId).then(e => {
            if(this.props.partialEvents[sportId] && this.props.partialEvents[sportId][fixtureId]) {
                matchEvent = {...e, ...this.props.partialEvents[sportId][fixtureId]};
                matchEvent.Markets = matchEvent.market;
                matchEvent.Livescore = matchEvent.livescore;
                this.setExtraMarketData(matchEvent);
            } else {
                // genrally in case of refresh
                this.getSingleMatchPartialEvent(fixtureId).then(partialEvent => {
                    if(!e || !partialEvent) {
                        this.setState({ noEvent: true});
                        return;
                    }
                    matchEvent = {...e, ...partialEvent?.Items[0]};
                    matchEvent.Markets = matchEvent.market;
                    matchEvent.Livescore = matchEvent.livescore;
                    this.setExtraMarketData(matchEvent);
                });
            }
            // this.setState({ isLoading: false });
            if(startListener && liveMatchSub._state !== 'ready') {
                this.subscribeExtraMarket(fixtureId);
            }
        });
    }

    handleConnectionChange = () => {
        const condition = navigator.onLine ? 'online' : 'offline';
        if (condition === 'online') {
          const webPing = setInterval(
            () => {
              fetch('//google.com', {
                mode: 'no-cors',
                })
              .then(() => {
                this.setState({ isDisconnected: false }, () => {
                  return clearInterval(webPing);
                });
              }).catch(() => this.setState({ isDisconnected: true }) );
            }, 2000);
          return;
        }
  
        return this.setState({ isDisconnected: true });
      }

    setExtraMarkets = (event) => {
        let { liveMatch } = this.state;
        let sportId = this.props.match.params.sportId;
        Util.getExtraMarketName(sportId).extraMarketNames.forEach( e => {
            extraMarkets[e] = {};
        });

        extraMarkets = Util.getExtraMarkets(extraMarkets, event, sportId);
        this.setState({ marketsUpdated: extraMarkets});
    }


    setExtraMarketData = (event) => {
        let { language } = this.props;
        this.setState({statsObj: event?.Livescore?.statistics || event?.livescore?.statistics || {}});
        this.setExtraMarkets(event);

        this.setState({ liveMatch: event, isLoading: false}, () => {
            // this.openStatistics();

            if(!this.state.noEvent) {
                this.props.setExtraMarketLeagueName(event?.league?.[language === 'en'? 'name_en' : `name_${ language.toLowerCase() }`]);
                this.props.setExtraMarketLocationName(event?.location?.[language === 'en'? 'name_en' : `name_${ language.toLowerCase() }`]);
            }
        });
    }

    componentDidUpdate(pp, prevState) {
        const { extraMarketEvent, userData, match } = this.props;
        let liveStreamAvailable= this.props.match.params.liveStreamAvailable;
        const { liveMatch, isDisconnected } = this.state;
        let fixtureId = match.params.fixtureId;
        let sportId = liveMatch.sport_id;
        if (!isEqual(prevState.liveMatch.Markets, liveMatch.Markets)) {
            extraMarkets = Util.getExtraMarkets(extraMarkets, liveMatch, sportId);
            this.setState({ marketsUpdated: extraMarkets});
        }
        
        if(pp.extraMarketEvent !== extraMarketEvent) {
            extraMarkets = Util.getExtraMarkets(extraMarkets, liveMatch, sportId);
            this.setState({ marketsUpdated: extraMarkets});
        }

        if (prevState.isDisconnected !== isDisconnected) {
            if (isDisconnected) { 
                this.unsubscribeEvents();
            }    else if(!isDisconnected){
                this.setLiveMatchData(true);
            };
        }

    }

    componentWillUnmount() {
        extraMarkets = {}; // Reset extra market category while un-mounting
        this.props.clearExtraMarkets();
        this.props.clearStatistics();
        this.unsubscribeEvents();
        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
    }

    toggleLiveStream = (streamIndex) => {
        let authed = localStorage.getItem('jwt_access_token') || sessionStorage.getItem('jwt_access_token') ? true : false;
        if(authed){
            this.setState({ showLiveStream: !this.state.showLiveStream});
            if(streamIndex >= 0) 
            {
                this.setState({selectedUrl : streamIndex, showStreamDropdown: false, showLiveStream: true});
                this.props.clearStatistics();
            }
        } else {
            this.props.showLogin();
        }
    }

    fetchLiveStreamMatches = async () => {
        try {
            let liveStreamData = await jwtService.getLiveStreamData();
            this.props.setLiveStreamData(liveStreamData);
            //this.setState({ liveStreamData: liveStreamData });
        }
        catch(error) {
            console.log(error);
            if (error && error.response && error.response.status && error.response.status === 401) {
                Util.handleRepeatedLogin(error.response);
            } else {
                // FIXME: Commenting the error temporarily
                //toastr.error('', 'Something went wrong.');
            }
        }
    }

    toggleDropdown = () => {
        let authed = localStorage.getItem('jwt_access_token') || sessionStorage.getItem('jwt_access_token') ? true : false;
        if(authed){
            this.setState({ showStreamDropdown: !this.state.showStreamDropdown });
        } else {
            this.props.showLogin();
        }
        
    }

    openStatistics = () => {
        let { match, statsData } = this.props;
        // if(statsData?.[+match.params.fixtureId] && ['live', 'finished'].indexOf(statsData[+match.params.fixtureId].status_type)> -1  ) {
        this.props.setStatistics(match.params.fixtureId, 'forPopup', 'live');
        this.setState({ showLiveStream : false, showStreamDropdown: false });
        // }
    };

    closeStatistics = () => {
        this.props.clearStatistics();
    };

    setExtraMarket = (marketName) => {
        this.props.selectExtraMarket(marketName);
    }

    hideLogin = () => {
        this.setState({ showLogin: false});
    }
    
    showLogin = () => {
        this.setState({ showLogin: true});
    }

    getSingleMatchMarkets = async (fixtureId , count) => {
        try {
            let event =  dynamoClient.query(getLiveMatchMarkets(fixtureId.toString())).promise();
            return await event.then(e => {
                const { Items } = e;
                let fixture = { market: null, livescore: null, fixture_status: null };
                if (Items.length > 0) {
                    let mktItems = [];
                    forEach(Items, (item) => {
                        if(item.outcomes) {
                            mktItems.push(item);
                        }
                        if(item.sport_event_status) {
                            let livescore = JSON.parse(item.sport_event_status);
                            fixture.livescore = livescore;
                            fixture.Livescore = livescore;
                        }
                    });
                    let mrktData = Util.marketFormatter(mktItems, fixtureId);
                    fixture.market = { ...fixture.market, ...mrktData };
                }
                return fixture || e.Items[0];
                
            });
        } catch (err) {
            console.log(err);
        }
    }

    getSingleMatchPartialEvent = async (fixtureId) => {
            try {
            const language = this.props;
            let event =  dynamoClient.query(getSingleLivePartialEvent(fixtureId)).promise();
            await event.then(e => {
                e.Items[0].participant_one_full = JSON.parse(e.Items[0].participant_one_full);
                e.Items[0].participant_two_full = JSON.parse(e.Items[0].participant_two_full);
                e.Items[0].participants = [e.Items[0].participant_one_full, e.Items[0].participant_two_full];
                if(e.Items[0].location && e.Items[0].location_id) {
                    e.Items[0].location = JSON.parse(e.Items[0].location);
                    e.Items[0].location = { ...e.Items[0].location, Id: e.Items[0].location_id };
                }
                if(e.Items[0].league && e.Items[0].league_id) {
                    e.Items[0].league = JSON.parse(e.Items[0].league);
                    e.Items[0].league = { ...e.Items[0].league, Id: e.Items[0].league_id };
                }
                if(e.Items[0].sport && e.Items[0].sport_id) {
                    e.Items[0].sport = JSON.parse(e.Items[0].sport);
                    e.Items[0].sport = { ...e.Items[0].sport, Id: e.Items[0].sport_id };
                }
            });
            return event;
            
        } catch (err) {
            console.log(err);
        }
    }

    marketDifference = (markets, prevMarkets) =>  {
        return map(markets, (market) => {   
            const { Bets, Id } = market;

            const oldMarket = find(prevMarkets, (mar) => mar.Id === Id);
            // If market not present previously no updated needed.
            if (!oldMarket) return market;
            if (!Bets) return market;
            const updatedBetsWithDiff = map(Bets, bet => {
                const { Price, Id: betId } = bet;

                const oldBet = find(oldMarket.Bets, (b) => b.Id === betId);
                // If bet not present previously no updated needed.
                if (!oldBet) return bet;

                const { Price: oldPriceStr } = oldBet;
                const price = parseFloat(Price);
                const oldPrice = parseFloat(oldPriceStr);

                const diff = oldPrice - price;
                return {
                    ...bet,
                    diff,
                };
            });

            return {
                ...market,
                Bets: updatedBetsWithDiff,
            };
        });
    }


    subscribeExtraMarket = (fixtureId) => {
        liveMatchSub = new WebSocket(`wss://socket.igamingbook.com/${process.env.REACT_APP_WEBSOCKET_CHANNEL}`);

        liveMatchSub.addEventListener('open', () => {
            liveMatchSubConnectionAttempts = 0;
        });

        liveMatchSub.addEventListener('message', (event) => {
            this.handleExtraMarketUpdates({value: event});
        });

        liveMatchSub.addEventListener('error', (error) => {
            console.warn(error);

            if (this.state.isDisconnected) return;  // Network is disconnected
            else liveMatchSubConnectionAttempts++;     // Network is not disconnected

            if (liveMatchSubConnectionAttempts < maxWebsocketRetryCount) {
                // Retry websocket connection
                this.unsubscribeEvents();
                this.setLiveMatchData(true);
            } else {
                // Open appsync connection
                this.subscribeExtraMarketAppSync(fixtureId);
            }
        });
    }

    subscribeExtraMarketAppSync = (fixtureId) => {
        marketSubscription = API.graphql(graphqlOperation(onUpdateMatchMarkets(fixtureId)));

        // Now whenever we need to subscribe just call: marketSubscription.subscribe as mentioned below.
        liveMatchSubAppSync = marketSubscription.subscribe({
            next: this.handleExtraMarketUpdates,
            error: (error) => {
                this.unsubscribeEvents();
                this.setLiveMatchData(true);
            },
        });
    }

    handleExtraMarketUpdates = ({value}) => {
        let updatedMatch = value.data.onUpdateLiveMarkets || value.data;
        if (typeof(updatedMatch) == 'string') updatedMatch = JSON.parse(updatedMatch);
        let {liveMatch} =this.state;
        let newFixture = {};

        if (!updatedMatch || !liveMatch || liveMatch.fixture_id != updatedMatch?.match_id) return null;
        
        if(updatedMatch.outcomes){
            let updatedMarket = Util.marketFormatter([updatedMatch], updatedMatch?.match_id);
            let marketValue = updatedMarket && Object.values(updatedMarket)[0];
            if (marketValue?.Bets && liveMatch.market[`id_${marketValue.Id}`]) {
                let currBets = liveMatch.market[`id_${marketValue.Id}`];
                let newBet = marketValue.Bets;
                if (currBets?.Bets) newBet = { ...currBets.Bets, ...newBet };
                updatedMarket[Object.keys(updatedMarket)[0]].Bets = newBet;
            }
            newFixture.market = { ...liveMatch.market, ...updatedMarket };
        }
        else {
            newFixture.market = liveMatch.market;
        }
        if(updatedMatch.sport_event_status){
            newFixture.Livescore = JSON.parse(updatedMatch.sport_event_status);
        }
        else {
            newFixture.Livescore = liveMatch.Livescore;
        }

        
        
        //const marketWithDiff1 =  this.marketDifference(newFixture.imp_market, this.state.event.imp_market);
        const marketWithDiff2 =  this.marketDifference(newFixture.market, this.state.liveMatch.market);
        newFixture.Markets = [ ...marketWithDiff2];
        newFixture = {...liveMatch, ...newFixture};
        // this.props.setCurrentEvent(newFixture);
        this.setState({ liveMatch: newFixture}, () => {
            //this.props.setExtraMarkets(newFixture.Markets)
        });

    }


    unsubscribeEvents = () => {
        if (liveMatchSub) liveMatchSub.close();
        if (liveMatchSubAppSync) liveMatchSubAppSync.unsubscribe();
        console.log('***** UnSubscribed all live matches. *****');
    };
    render() {
        const { closeModal, selectExtraMarket, extraSelectedMarket, match, statisticsType, language, statsData } = this.props;
        let liveStreamAvailable = this.props.match.params.liveStreamAvailable;
        liveStreamAvailable = liveStreamAvailable == 'true' ? true :false;
        let { streamUrlData, selectedUrl, statsObj, liveMatch, noEvent, isLoading } = this.state;
        let lang = `name_${ language?.toLowerCase() || 'en' }`;
        let sportId = +match.params.sportId;
       // let extraFiveMarkets = extraMarkets['All'];
        const { showLiveStream } = this.state;
        let type = 'live';
            // liveMatch.fixture_status === lSportsConfig.statuses.inplay
            //     ? 'live'
            //     : liveMatch.fixture_status === lSportsConfig.statuses.prematch
            //     ? 'sports'
            //     : 'last-minute';
        let leagueName = liveMatch.league && (liveMatch.league[lang] || liveMatch.league.name_en);
        let results =
            liveMatch.Livescore && liveMatch.Livescore.Scoreboard && liveMatch.Livescore.Scoreboard.Results
                ? liveMatch.Livescore.Scoreboard.Results
                : null;
        results = results && Object.values(results);
        let currentDate = liveMatch.start_date && Util.convertToLocalTimezone(liveMatch.start_date);
        let timeString = currentDate?.timeString;
        let hasStatistics = false;
        if (statsData?.[+liveMatch.fixture_id] && ['live', 'finished'].indexOf(statsData[+liveMatch.fixture_id].status_type) > -1) {
            hasStatistics = true;
        }
        let matchInfo = type === 'live' ? results ? results[0].Value + ' : ' + results[1].Value : '' : <time className="d-block lh-18">{timeString}</time>;
        let disbaledStatClass = !hasStatistics ? 'statistics_disabled' : '';

        let drawEventHeader = (
            !isEmpty(liveMatch) && !noEvent && <div className="team-name">
                {/* <span>{leagueName}</span> */}
                <div className="d-flex justify-content-center team-name-section">
                    <p className="name-one ellipsis text-right">{liveMatch.participants?.[0][lang] || liveMatch.participants?.[0].name_en}</p>
                    <p className="extra-odd__score score">
                        {matchInfo}
                        {/* <MatchDateTime fixture={liveMatch} showDate={false} /> */}
                    </p>
                    <p className="ellipsis name-two">{liveMatch.participants?.[1][lang] || liveMatch.participants?.[1].name_en}</p>
                </div>
            </div>
        );
        let currentlySelectedMarket = extraSelectedMarket ? extraSelectedMarket : 'All';
        let extraMarketEventsList = extraMarkets[currentlySelectedMarket];
        let fiveExtraMarket = extraMarkets['All'];
        // let sportId = liveMatch.sport_id;
        // check if all bets are settled
        let areBetsAllSettled = Util.checkSettledBets(extraMarketEventsList);
        let drawMarkets =
        extraMarketEventsList && Object.keys(extraMarketEventsList).length > 0 && !this.state.noEvent ? (
                areBetsAllSettled ? (
                    <div className="no-data fs-15 pt-3 pb-3">All the Odds are settled for this event.</div>
                 ) : 
                (
                    <Markets markets={extraMarketEventsList} fixture={liveMatch} type={type} leagueName={leagueName} currentlySelectedMarket={currentlySelectedMarket}/>
                )
            ) 
             : (
                 <div className="no-data fs-15 pt-3 pb-3">No data</div>
             );

        let streamingList = [];
        forEach(this.state.streamUrlData, (data, i) => 
            streamingList.push(<ListItem
                button
                selected={ this.state.selectedUrl  === i }
                onClick = {() => this.toggleLiveStream(i)}
                className={this.props.classes.listSection}
                >
                <ListItemText disableTypography 
                    secondary={<Typography type="body2" style={{ color: this.state.selectedUrl === i ? '#16663e' : '#000' ,padding: '0px 8px'}}> {`Stream ${i + 1}`}</Typography>}
                />
            </ListItem>)
        );
    
        return  isLoading ? (
            <Loading customClass='odds-panel w-100'/>
        ) : (
            // <Dialog onClose={closeModal} aria-labelledby="extra-odds-dialog-title" open={true} scroll="paper" maxWidth="lg" className="modal fade show d-block" PaperProps={ { classes: { root: 'paper-root' } }}>
            //     <div className='modal-dialog extra-mkt prematch modal-lg modal-dialog-centered m-0'>
            <div className='extra-mkt'>
                <div className='modal-header'>
                    {/* <DialogTitle id="extra-odds-dialog-title" className="modal-header" disableTypography> */}
                    <div className='head-right justify-content-between'>
                        <IconButton aria-label="close" className="close" onClick={(e)=> this.props.history.push('/d/live-betting')}>
                            <i className="material-icons icon-color"> keyboard_arrow_left </i>
                        </IconButton>
                        {drawEventHeader}
                        <div className = "'icons_statistics'">
                            {/* <IconButton className={`data-icon ${disbaledStatClass}`}>
                                    {statisticsEventId > 0 && statisticsType === 'forPopup' ? (
                                        <i className={`icon-statistics text-green ${disbaledStatClass}`} onClick={(e) => this.closeStatistics()} />
                                    ) : (
                                        <i className={`icon-statistics text-grey ${disbaledStatClass}`} onClick={(e) => this.openStatistics()} />
                                        )}
                            </IconButton> */}
                        </div>
                        {/* <div className='button-grp'>
                            {liveStreamAvailable ?
                                <IconButton className='live-stream pr-1 pl-0' onClick={this.toggleDropdown}>
                                    <div className="d-flex flex-column">
                                        <img className="stream-icon-extra-market" alt="stream-icon" src="/images/smart-tv-live-new.svg"></img>
                                        <div className="live-stream-triangle"/>
                                    </div>
                                </IconButton> :

                                <IconButton className='live-stream stream_disabled' >
                                    <img className="stream-icon-extra-market" alt="stream-icon" src="/images/smart-tv-new.svg"></img> 
                                </IconButton>}
                            {this.state.showStreamDropdown  && <List className={this.props.classes.root} component="nav" aria-label="Live Streams">
                                {streamingList}
                            </List>}
                            <IconButton className='data-icon'>
                                { hasStatistics && !showLiveStream && statisticsType === 'forPopup' ? (
                                    <i className={`icon-statistics text-green ${disbaledStatClass}`} onClick={(e) => this.closeStatistics()} />
                                            ) : (
                                                <i className={`icon-statistics text-grey ${disbaledStatClass}`} onClick={(e) => this.openStatistics()} />
                                        )}
                            </IconButton>
                        </div> */}
                    </div>
                    {/* <div className="d-flex w-100 text-white ml-50 market-result-section">
                                <ul className="extra-market-ul">
                                    <li>
                                        <span className="hr">  {statsObj['currentPeriod']} </span><span className={`min ${sportId === '54094' && 'extra-mrkt-tennis'}`}><MatchDateTime fixture={liveMatch} showDate={true} /> </span>
                                    </li>
                                </ul>
                            </div> */}
                    <div className = "d-flex w-100 market-result-section ">
                        <ul className = 'extra-market-ul justify-content-center text-white '>
                            <li>
                                {statsObj['currentPeriod']}
                            </li>
                            <li className = "ml-3">
                                {/* {matchInfo} */}
                                <MatchDateTime fixture={liveMatch} showDate={true} />
                            </li>
                                  
                        </ul>
                    </div>
                </div>
                {/* </DialogTitle>

                        <DialogContent className="modal-body"> */}
                <div className='modal-body'>
                    <div className='d-flex five_markets'> 
                        {/* { this.props.statisticsEventId !== -1 && <Statistics /> } */}
                        <FiveFeaturedMarkets markets={fiveExtraMarket} fixture={liveMatch} type={type} leagueName={leagueName} currentlySelectedMarket={currentlySelectedMarket} areBetsAllSettled={areBetsAllSettled} status = "Live"/>
                    </div>
                    {/* {hasStatistics && !showLiveStream && statisticsType === 'forPopup' && <Statistics />} */}
                    {/* {liveStreamAvailable && showLiveStream && streamUrlData.length && <iframe title='Live Stream' width='100%' height='300vw'  style={{ border:'none'}} src={streamUrlData[selectedUrl].iframe}></iframe>} */}
                    <div className="main-market-listing-header">
                        <ul>
                            <ExtraMarketSelector
                                selectExtraMarket={selectExtraMarket}
                                extraSelectedMarket={currentlySelectedMarket}
                                extraMarketNames={Util.getExtraMarketName(sportId).extraMarketNames}
                            />
                        </ul>
                    </div>
                    <div className='modal-content'>
                        {drawMarkets}
                    </div>
                </div>
                {/* </DialogContent> */}
            </div>
            // </Dialog>
        );
    }
}

ExtraOddsModal.propTypes = {
    closeModal: PropTypes.func,
    event: PropTypes.object,
    extraSelectedMarket: PropTypes.string,
    extraMarketsLoading: PropTypes.bool,
    selectExtraMarket: PropTypes.func,
    getExtraMarkets: PropTypes.func,
    clearExtraMarkets: PropTypes.func,
    extraMarketEvent: PropTypes.object,
    setStatistics: PropTypes.func,
    statisticsEventId: PropTypes.number,
    statisticsType: PropTypes.string,
    clearStatistics: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        extraMarketsLoading: state.lsportsGlobal.extraMarketsLoading,
        extraSelectedMarket: state.lsportsGlobal.extraSelectedMarket,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,
        statisticsEventId: state.lsportsGlobal.statisticsEventId,
        statisticsType: state.lsportsGlobal.statisticsType,
        language: state.general.language,
        statsData: state.general.statsData,
        userData: state.user.data,
        partialEvents: state.inplay.partialEvents,
        liveStreamData: state.inplay.liveStreamData
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getExtraMarkets: (eventId) => dispatch(getExtraMarkets(eventId)),
        selectExtraMarket: (marketName) => dispatch(selectExtraMarket(marketName)),
        clearExtraMarkets: () => dispatch(clearExtraMarkets()),
        setStatistics: (eventId, statsType, statsTemplateType) => dispatch(setStatistics(eventId, statsType, statsTemplateType)),
        clearStatistics: () => dispatch(clearStatistics()),
        setExtraMarketLocationName: (location) => dispatch(setExtraMarketLocationName(location)),
        setExtraMarketLeagueName: (league) => dispatch(setExtraMarketLeagueName(league)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExtraOddsModal)));
