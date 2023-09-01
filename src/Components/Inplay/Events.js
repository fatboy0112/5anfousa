import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { filter, includes, find, forEach, orderBy, isEmpty, isEqual } from 'lodash';
import Locations from './Locations';
import Matches from './Matches';
import MainMarketSelector from '../Shared/MainMarketSelector';
import Loading from '../Common/NewLoading';
import ExtraOddsModal from './ExtraOddsModal';
import {
    selectMainMarket,
    getSportEvents,
    search,
    getInplayLocations,
    setInplayResetPage,
    clearSportEvents,
    clearLocations,
    setTotalEventCount,
    setCurrentEventCount,
    resetLiveMatches
} from '../../store/actions/inplayActions';
import { setCurrentEvent, clearStatistics, setStatistics, setExtraMarkets } from '../../store/actions/lsports.global.actions';
import SportsLive from './SportsLive';
import { locationSortingOrder, sportAndLocationData } from '../../config/sports';
import { MARKET_FOR_OUTER_SLIDER, liveMarketOnMain } from '../../config/markets';
import map from 'lodash.map';
import { remove } from 'lodash';
import { lSportsConfig, maxWebsocketRetryCount } from '../../config';
import Util from '../../helper/Util';
import Today from '../Today/index';
import { resetSelectedLocations, selectSportMobile, searchTodayEvents } from '../../store/actions/todayActions';
import { getStatsData } from '../../store/actions/general.actions';
import LiveStreamModal from '../Shared/LiveStramModal';
import jwtService from '../../services/jwtService';
import { onUpdateDeventMarkets }  from '../../graphql/subscriptions';
import { onUpdateLiveDeventMarkets, onUpdateMatchMarkets, onUpdateExtraMarket, }  from '../../graphql/subscriptions';
import { API, graphqlOperation } from 'aws-amplify';
import { dynamoClient } from '../../App';
import LoadingIcon from '../Common/LoadingIcon';
import { getLivePartialDEvents, getAllLiveFixtureMarkets, getSingleLivePartialEvent, getAllLiveMatches, getSingleLiveMarkets, getSingleMarketOfEvent, getLiveMatchMarkets, getLiveCount } from '../../dynamo/inplayParams';
// List of fixtures for which firebase events have been subscribed.
// let subscribedFixtures = [];
let unSub = [];
let allData = [];
let allLiveEvents = [];
let liveMatches = {};
let liveMatchSub;
let marketSubscription;
let liveEvents = {};
let liveEventsCount;
let liveMarketCount;
let liveMarkets = {};
let livescores = {};
let liveScoreCount;
let unsubscribe;
let timerAddDel;
let liveMatchesCheck = {};
let sportsCount = {};
let getDataFromDB = false;
let websocket;
let websocketConnectionAttempts = 0;
let liveMatchSubConnectionAttempts = 0;
let liveMatchSubAppSync;

class Events extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showExtraOddsModal: false,
            event: {},
            showStatisticsModal: false,
            liveMatches: {},
            todayMatches: {},
            fixedData: {},
            isLoading: true,
            locationAndSportsObj: {},
            currentSelectedLeague: 'all',
            currentSelectedSport: lSportsConfig.inplay.selectedSport, //Football
            searchVal: '',
            liveMatchesObj: {},
            liveStreamAvailable: false,
            liveStreamData: [],
            liveStreamUrl: null,
            showLiveStream: false,
            fixturesLoaded: false,
            marketsLoaded: false,
            isDisconnected: false,
            partialEvents: {},
            showToday: false,
            runningFetch: false,
            disbleSportsSwitch: false
        };
    }

    componentDidMount() {
        // TODO: Fetch all the live Matches and there Market data
        //this.loadAllDataForLiveMatches();
        // const { getStatsData } = this.props;
        // getStatsData();
        // this.fetchLiveStreamMatches();
        liveMatches = {};
        this.setState({disbleSportsSwitch: true})
        this.getLiveMatches();
        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
        
      
    }

    componentDidUpdate(prevProps, prevState) {
        const { fixedData, liveMatchesArray, fixturesLoaded, marketsLoaded, isDisconnected, currentSelectedSport  } = this.state;
        
        if (prevState.isDisconnected !== isDisconnected) {
            if (isDisconnected) { 
                this.unsubscribe();
                this.unsubscribeEvents();
            }    else if(!isDisconnected){
                liveMatches = {}
                this.setState({disbleSportsSwitch: true})
                this.getLiveMatches();
            };
        }

        if(prevState.currentSelectedSport !== currentSelectedSport) {
            this.unsubscribe();
            this.unsubscribeEvents();
            this.setState({isLoading: true, disbleSportsSwitch: true });
            liveMatches = {};
            this.getLiveMatches();
            
        }
    }

    componentWillUnmount() {
        liveMatches = {};
        getDataFromDB = false;
        sportsCount={};
        this.props.clearSportEvents();
        this.props.clearLocations();
        this.unsubscribe();
        this.unsubscribeEvents();
        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
    }

    startTimer = () => {
        timerAddDel = setInterval(() => {
            liveMatchesCheck={};
            this.getLiveMatchCount();
            this.checkLiveMatches();
        } , 20000);
    }

    getLiveMatches = ( nextToken ) => {
        dynamoClient.scan(getAllLiveMatches(nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if(!data.Items.length) {
                    this.setSportsAndLocations()
                }
                forEach(data.Items, (item) => {
                    if(item.fixture_status === lSportsConfig.statuses.inplay) {
                        if(!liveMatches[item.sport_id]){
                            liveMatches[item.sport_id] = [];
                        }
                        liveMatches[item.sport_id].push(item.fixture_id);
                    }
                })
                if(data.LastEvaluatedKey) {  
                    this.getLiveMatches( data.LastEvaluatedKey );
                } else {
                    this.setState({liveMatchesObj: liveMatches}, () => 
                    {
                        this.getLiveMatchCount();
                        this.getAllLiveFixtureDevents();
                    });
                }
        }
    })
    }

    checkLiveMatches = (nextToken) => {
        dynamoClient.scan(getAllLiveMatches(nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if(!data.Items.length) {
                    this.setSportsAndLocations()
                }
                forEach(data.Items, (item) => {
                    if(item.fixture_status === lSportsConfig.statuses.inplay) {
                        if(!liveMatchesCheck[item.sport_id]){
                            liveMatchesCheck[item.sport_id] = [];
                        }
                        liveMatchesCheck[item.sport_id].push(item.fixture_id);
                    }
                })
                if(data.LastEvaluatedKey) {  
                    this.checkLiveMatches( data.LastEvaluatedKey );
                } else {
                    if(!isEqual(this.state.liveMatchesObj, liveMatchesCheck)){
                        this.setState({liveMatchesObj: liveMatchesCheck}, () => 
                        {
                            this.getAllLiveFixtureDevents();
                            //this.props.getStatsData();
                        });
                    }
                }
        }
    })
    }

    getLiveMatchCount = async () => {
        const { liveMatchesObj } = this.state;
        for (let id in liveMatchesObj) {
            if (!sportsCount[id]) {
                sportsCount[id]={counter:0};
            } 
        }
        for (let sportId in liveMatchesObj) {
            let fixture = Object.values(liveMatchesObj[sportId]);
            let objSize = fixture.length;
            
            try {
                let totalCount = 0;
                //batchGet can fetch max 100 items at a time, therefore spliting the fixtures in segments
                if (objSize > 100) {
                    let segments =  Math.ceil(objSize/100);
                    let j = 0;
                    for (let i = 1; i <= segments; i++){
                        let arr=[]
                        if(i==segments){
                            arr=fixture.slice(j,objSize);
                        }else{
                            arr =fixture.slice(j,i*100);
                        }
                       
                        let fixtureIds = arr.map((element) => {
                            return element = { fixture_id: element.toString() + '^sport_event_status' };
                        })

                        const promise_1 = dynamoClient.batchGet(getLiveCount(fixtureIds)).promise();
                        await promise_1.then(res => {
                            let { Responses: { LiveMarkets } } = res;
                            if (LiveMarkets?.length) {
                                totalCount = totalCount + LiveMarkets.length;
                            }
                        }).catch(err => {
                        console.log(err);
                        });
                        j = i * 100;
                    }
                    sportsCount[sportId]={counter:totalCount}
                }//If items are less than 100
                else {
                    let fixtureIds = fixture.map((element) => {
                        return element = { fixture_id:element.toString() + '^sport_event_status' };
                     });
                    const promise_1 = dynamoClient.batchGet(getLiveCount(fixtureIds)).promise();
                    await promise_1.then(res => {
                        let { Responses: { LiveMarkets } } = res;
                        if (LiveMarkets?.length) {
                            sportsCount[sportId] = { counter: LiveMarkets.length };
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                }
            } catch (error) {
                console.log('err:' ,error);
            } 
        }
        this.setState({ sportsCountObj: sportsCount }, () => {
            getDataFromDB = true;
            this.setSportsAndLocations();
        });
    }

    getLiveMatchesMarkets = (clear) => {
        let {partialEvents, currentSelectedSport, liveMatches} = this.state;

        let data = !isEmpty(partialEvents[currentSelectedSport]) && Object.values(partialEvents[currentSelectedSport])
            liveMarketCount = 0;
            liveScoreCount = 0;
            if(clear) {
            liveMarkets = {}
        }

        forEach(data, (e) => {
            liveMarkets[e.fixture_id] = {};
            this.getSingleMatchMarkets(e.fixture_id, data.length);
        });
        return;
        
    }

    getSingleLiveMatchMarket = async(market, isLiveScore, totalLiveScore, totalCount) => {
        //let {partialEvents} = this.state;
        const { currentSelectedSport, partialEvents } = this.state;
        try {

        let event =  dynamoClient.query(getSingleMarketOfEvent(market)).promise();
        return await event.then(e => {
            if(isLiveScore) {
                e.Items[0].livescore = JSON.parse(e.Items[0].livescore);
                livescores[e.Items[0].match_id] = e.Items[0].livescore;
                liveScoreCount++;
            }
            let market = {};
            if(liveMarkets[e.Items[0].match_id])
                market = liveMarkets[e.Items[0].match_id];
                if(!isLiveScore) {
            e.Items[0].market = JSON.parse(e.Items[0].market);
            let newMrkt = Object.values(e.Items[0].market)[0];
            liveMarkets[e.Items[0].match_id] = {...market, [newMrkt.Id]: newMrkt}
            liveMarketCount++;
                }
            if(liveMarketCount === totalCount && liveScoreCount === totalLiveScore)
            {
                let finalMatches = {}
                for(let id in liveMarkets) {
                    finalMatches[id] = {...partialEvents[currentSelectedSport][id],Markets: liveMarkets[id], Livescore: livescores[id]};
                }
                this.setState({liveMatches: finalMatches, isLoading: false, runningFetch: false}, ()=> this.startListener());
            }
            
        });
    } catch (err) {
        //reset logic to be added here
        if(!isLiveScore)
        liveMarketCount++;
        if(isLiveScore)
        liveScoreCount++;
        if(liveMarketCount === totalCount)
            {
                let finalMatches = {}
                for(let id in liveMarkets) {
                    finalMatches[id] = {...partialEvents[currentSelectedSport][id],Markets: liveMarkets[id], Livescore: livescores[id]};
                }

                this.setState({liveMatches: finalMatches, isLoading: false, runningFetch: false}, ()=> this.startListener());
            }
        console.log(err);
    }
    }

    unsubscribe =() => {
        console.log(" *******  Unsubscribe live matches **********")
        if(unsubscribe) {
            unsubscribe.unsubscribe();
        }
        if(websocket) {
            websocket.close();
        }

        
        clearInterval(timerAddDel);
        unsubscribe = null;
    }

    
    startListener = () => {
        this.unsubscribe();
        this.startTimer();

        // // Uncomment this part if websocket should not retry to connect when appsync connection has already been created
        // if (websocketConnectionAttempts >= maxWebsocketRetryCount) {
        //     // Open appsync connection
        //     this.startListenerAppSync();
        //     return;
        // }

        websocket = new WebSocket(`wss://socket.igamingbook.com/${process.env.REACT_APP_WEBSOCKET_CHANNEL}`);

        websocket.addEventListener('open', () => {
            websocketConnectionAttempts = 0;
        });

        websocket.addEventListener('message', (event) => {
            this.handleFirebaseUpdates({value: event});
        });

        websocket.addEventListener('error', (error) => {
            console.warn(error);

            if (this.state.isDisconnected) return;  // Network is disconnected
            else websocketConnectionAttempts++;     // Network is not disconnected

            if (websocketConnectionAttempts < maxWebsocketRetryCount) {
                // Retry websocket connection
                this.unsubscribe();
                liveMatches = {};
                this.setState({disbleSportsSwitch: true});
                this.getLiveMatches();
            } else {
                // Open appsync connection
                this.startListenerAppSync();
            }
        });
    }

    startListenerAppSync = () => {
        let marketSubscription = API.graphql(graphqlOperation(onUpdateLiveDeventMarkets));

        // Now whenever we need to subscribe just call: marketSubscription.subscribe as mentioned below. 
        let unsub = marketSubscription.subscribe({
            next: this.handleFirebaseUpdates,
            error: (error) => {
                this.unsubscribe();
                liveMatches = {};
                this.setState({disbleSportsSwitch: true})
                this.getLiveMatches();
            },
        });
        
        unsubscribe = unsub;
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
                  return clearInterval(webPing)
                });
              }).catch(() => this.setState({ isDisconnected: true }) )
            }, 2000);
          return;
        }
  
        return this.setState({ isDisconnected: true });
      }

    fetchLiveStreamMatches = async () => {
        try {
            let liveStreamData = await jwtService.getLiveStreamData();
            this.setState({ liveStreamData: liveStreamData });
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


    getAllLiveFixtureDevents = () => {
        let {liveMatchesObj, currentSelectedSport} = this.state;
        liveEventsCount = 0;
        liveEvents = {};

        if(!liveMatchesObj[currentSelectedSport] && !isEmpty(liveMatchesObj)) {
            this.setState({currentSelectedSport: Object.keys(liveMatchesObj)[0]});
            liveMatches = {};
            this.getLiveMatches();
        } else if (isEmpty(liveMatchesObj)) {
            this.setSportsAndLocations();
        }else {
            forEach(liveMatchesObj[currentSelectedSport], (match) => 
                this.getSingleMatchPartialEvent(match)
            ) 
        }
    }

    getSingleMatchPartialEvent = async (fixtureId) => {
        
        let {liveMatchesObj, currentSelectedSport, partialEvents} = this.state;
            try {
            let event =  dynamoClient.query(getSingleLivePartialEvent(fixtureId)).promise();
            return await event.then(e => {
                e.Items[0].participant_one_full = JSON.parse(e.Items[0].participant_one_full);
                e.Items[0].participant_two_full = JSON.parse(e.Items[0].participant_two_full);
                e.Items[0].participants = [e.Items[0].participant_one_full, e.Items[0].participant_two_full];
                if(e.Items[0].location && e.Items[0].location_id) {
                    e.Items[0].location = JSON.parse(e.Items[0].location);
                    e.Items[0].location = { ...e.Items[0].location, Id: e.Items[0].location_id?.toString() };
                }
                if(e.Items[0].league && e.Items[0].league_id) {
                    e.Items[0].league = JSON.parse(e.Items[0].league);
                    e.Items[0].league = { ...e.Items[0].league, Id: e.Items[0].league_id };
                }
                if(e.Items[0].sport && e.Items[0].sport_id) {
                    e.Items[0].sport = JSON.parse(e.Items[0].sport);
                    e.Items[0].sport = { ...e.Items[0].sport, Id: e.Items[0].sport_id };
                }

                liveEvents[fixtureId] = e.Items[0];
                liveEventsCount++;
                if(liveEventsCount === liveMatchesObj[currentSelectedSport].length) {

                    partialEvents[currentSelectedSport] = liveEvents;
                    this.setState({partialEvents: partialEvents}, () => {
                            this.setSportsAndLocations();
                            this.getLiveMatchesMarkets(true);
                    })
                }
            });
        } catch (err) {
            //reset logic to be added here
            liveEventsCount++;
            if(liveEventsCount === liveMatchesObj[currentSelectedSport].length) {

                    partialEvents[currentSelectedSport] = liveEvents;
                    this.setState({partialEvents: partialEvents}, () => {
                       
                            this.setSportsAndLocations();
                            this.getLiveMatchesMarkets(true);
            
                    })
            }
            console.log(err);
        }
    }

    setSportsAndLocations = () => {
        
        const { partialEvents, currentSelectedSport, liveMatchesObj } = this.state;
        let selectedSport;
        
        let sports = sportAndLocationData();

        if(isEmpty(partialEvents[currentSelectedSport])) {
            sports = orderBy(sports, ['priority', 'Count'], ['asc','desc']);
            this.setState({ locationAndSportsObj : sports,
                isLoading: false, runningFetch: false
            });
            return;
        }
        
        for (let id in liveMatchesObj) {
            // let sport = liveMatchesObj[id];
            //         sports[id].Count = sport.length;
            if (!getDataFromDB) {
                let sport = liveMatchesObj[id];
                if (sports[id]) sports[id].Count = sport.length;
            }
            else if (getDataFromDB && this.state.sportsCountObj[id]) {
                if (sports[id]) sports[id].Count = this.state.sportsCountObj[id].counter;
            }
        }

        
        for(let event of Object.values(partialEvents[currentSelectedSport])) {
            sports[event.sport_id].Locations[event.location.Id] = event.location; 
        }


        this.getSortedLocations(sports);
        let sortedSports;
        if (sports[lSportsConfig.sports.football.id].Count === 0) {
            // If no football matches present sort by counts
            sortedSports = orderBy(sports, ['Count', 'Id'], ['desc', 'asc']);
        }        
        else {
            // If there is football match then priorities it and rest sorted by count
            sortedSports = orderBy(sports, ['priority', 'Count'], ['asc','desc']);
        } 
        if(!currentSelectedSport) {
            for (let i in sortedSports) {
                selectedSport = sortedSports[i];
                break;
            }
        }
        else selectedSport = find(sortedSports,(e) =>  e.Id == currentSelectedSport );
        this.setState({ locationAndSportsObj : sortedSports, currentSelectedSport: selectedSport.Id });
    }

    getSortedLocations = (sports) => {
        forEach(sports, elem => {
           elem.Locations = this.sortLogic(elem.Locations);
        })
    }

    sortLogic = (locations) => {
        const sortingOrder = locationSortingOrder;
        let preSortedList = [];
        for(let s in sortingOrder) {
            let elem = remove(locations, l => {
                if (l) return l.Name === sortingOrder[s]
            });
            if (elem.length > 0) preSortedList.push(elem[0]);
        }
        return preSortedList.concat(locations.sort((a,b) => Util.compareStrings(a.Name, b.Name)))

    }
    
    groupMatchesByStatus = () => {
        let { fixedData } = this.state;
        if(!fixedData) return;
        
        const matchesByStatus = {
            '_2': {},
            '_today': {},
        };
        Object.values(fixedData).forEach((item) => {
            // If Fixture/Markets/Livescore is not available skip that match
            if (item.Fixture && (item.Markets && !isEmpty(item.Markets) ) && item.Livescore) {
                if (item.Fixture.Status === lSportsConfig.statuses.inplay && item.Livescore.Scoreboard.Status === lSportsConfig.statuses.inplay) {
                    matchesByStatus['_2'][item.FixtureId] = item;
                } 
            }
        });
        return matchesByStatus;
    };

    // subscribeEvents = (liveMatches) => {
    //     marketSubscription = API.graphql(graphqlOperation(onUpdateLiveDeventMarkets));

    //     // Now whenever we need to subscribe just call: marketSubscription.subscribe as mentioned below. 

    //     liveMatchSub = marketSubscription.subscribe({
    //         next: this.handleFirebaseUpdates,
    //         error: (error) => {
    //             this.unsubscribeEvents();
    //             this.loadAllDataForLiveMatches();
    //         }
            
    //     });

    // };

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
                this.subscribeExtraMarket(fixtureId);
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
                this.subscribeExtraMarket(fixtureId);
            },
        });
    }

    unsubscribeEvents = () => {
        if (liveMatchSub) liveMatchSub.close();
        if (liveMatchSubAppSync) liveMatchSubAppSync.unsubscribe();

        console.log("***** UnSubscribed all live matches. *****");
    };

    // handleLiveMatchUpdates = (snap) => {
    //     const liveMatches = snap.data().live_events;
    //     if (!liveMatches) return;
    //     this.setState({ liveMatchesArray : liveMatches });
    // }

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
                }
            });

            return {
                ...market,
                Bets: updatedBetsWithDiff,
            };
        });
    }

    handleExtraMarketUpdates = ({value}) => {
        let updatedMatch = value.data.onUpdateLiveMarkets || value.data;
        if (typeof(updatedMatch) == 'string') updatedMatch = JSON.parse(updatedMatch);
        let {event} =this.state;
        let newFixture = {};
        if (!updatedMatch || !event || event.fixture_id != updatedMatch.match_id) {
            return null;
        };
    
        if(updatedMatch.outcomes){
            let updatedMarket = Util.marketFormatter([updatedMatch], updatedMatch?.match_id);
            let marketValue = updatedMarket && Object.values(updatedMarket)[0];

            if (marketValue?.Bets && event?.market?.[`id_${marketValue.Id}`]) {
                let currBets = event.market[`id_${marketValue.Id}`];
                let newBet = marketValue.Bets;
                if (currBets?.Bets) newBet = { ...currBets.Bets, ...newBet };
                updatedMarket[Object.keys(updatedMarket)[0]].Bets = newBet;
            }
            newFixture.market = { ...event.market, ...updatedMarket };
        }
        else {
            newFixture.market = event.market;
        }
        if(updatedMatch.sport_event_status){
            newFixture.Livescore = JSON.parse(updatedMatch.sport_event_status);
        }
        else {
            newFixture.Livescore = event.Livescore;
        }

        
        
        //const marketWithDiff1 =  this.marketDifference(newFixture.imp_market, this.state.event.imp_market);
        const marketWithDiff2 =  this.marketDifference(newFixture.market, this.state.event.market);
        newFixture.Markets = [ ...marketWithDiff2];
        newFixture = {...event, ...newFixture};
        this.props.setCurrentEvent(newFixture);
        this.setState({ event: newFixture}, () => {this.props.setExtraMarkets(newFixture.Markets);});

    }

    handleFirebaseUpdates = ({value}) => {

        // const updatedMatch = value.data.onUpdateLiveMarkets;
        let updatedMatch = value.data.onUpdateLiveMarkets || value.data;
        if (typeof(updatedMatch) == 'string') updatedMatch = JSON.parse(updatedMatch);
        const id = updatedMatch.match_id;
        let marketId = updatedMatch.fixture_id;
        marketId = marketId?.split('^')[1];
        if (!updatedMatch.sport_event_status && marketId && liveMarketOnMain.indexOf(marketId) === -1) return;

        const { liveMatches: { [id]: oldMatches } } = this.state;

        // const { fixture_status: status } = updatedMatch; //_livescore 
        // let { liveMatches } = this.state;

        if (updatedMatch.outcomes){
        // if (!updatedMatch.livescore) return;
        
         if (!oldMatches) {
            // temp return statement TO fix infinite loader
            return;
         }
        

         const marketWithDiff = map(Object.values(Util.marketFormatter([updatedMatch], id)), (market) => {
            let { Bets, Id } = market;
            const oldMarket = find(oldMatches.Markets, (mar) => mar.Id === Id);
            // If market not present previously no updated needed.
            if (!oldMarket) return market;
            if (!Bets) return market;
            if (oldMarket.Bets?.length && Bets) {
                let temp = {};
                oldMarket.Bets.map( (bet) => temp[ bet.Id ] = bet );
                Bets = { ...temp, ...Bets };
                Bets = Object.values(Bets);
                // Bets = temp;
            }
            const updatedBetsWithDiff = map(Bets, bet => {
                const { Price, Id: betId } = bet;

                const oldBet = find(oldMarket.Bets, (b) => b?.Id === betId);
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
                ...oldMarket,
                Bets: updatedBetsWithDiff,
            };
        });
        let liveScore = oldMatches.Livescore;
        if (updatedMatch.sport_event_status) {
            liveScore = JSON.parse(updatedMatch.sport_event_status);
        }

        let newLiveMatches = {
            ...this.state.liveMatches,
            [id]: { ...oldMatches, Livescore: liveScore, Markets: { ...oldMatches.Markets, [`id_${marketWithDiff[0].Id}`]: marketWithDiff[0] } },
        };
        
        this.setState({
            liveMatches: newLiveMatches });        
    }
    else if(updatedMatch.sport_event_status){
        let newLiveMatches = {
                ...this.state.liveMatches,
                [id]: { ...oldMatches, Livescore: JSON.parse(updatedMatch.sport_event_status)},
            };
        this.setState({
            liveMatches: newLiveMatches
            }
        );
    }
    };

    getSingleMatchMarkets = async (fixtureId , count) => {
        // let {partialEvents} = this.state;
        let { currentSelectedSport, partialEvents } = this.props;
        try {
            let event =  dynamoClient.query(getLiveMatchMarkets(fixtureId.toString())).promise();
            return await event.then(e => {
                
                const { Items } = e;
                let fixture = { market: null, livescore: null, fixture_status: null };
                if (Items.length > 0) {
                    let mktItems = [];
                    forEach(Items, (item) => {
                        if(item.outcomes) {
                            // let mrktData = JSON.parse(item.market);
                            mktItems.push(item);
                        }
                        if(item.sport_event_status) {
                            let livescore = JSON.parse(item.sport_event_status);
                            fixture.livescore = livescore;
                        }
                    });
                    let mrktData = Util.marketFormatter(mktItems, fixtureId);
                    fixture.market = { ...fixture.market, ...mrktData };
                }
                // FIXME: set false temporarily need to update once Betradar setup
                if(!count)
                return fixture || e.Items[0];
                else {
                    
                    liveMarkets[fixtureId] = fixture.market;
                    livescores[fixtureId] = fixture.livescore || {};
                    liveMarketCount++;
                    if(liveMarketCount === count)
                    {
                        
                        let finalMatches = {};
                        let { liveMatchesObj, currentSelectedSport, partialEvents } = this.state;
                        // let toReset= [];

                        // for(let id in liveMatchesObj[currentSelectedSport]) {
                        //     let fixtureId = liveMatchesObj[currentSelectedSport][id];
                        //     if(!partialEvents[currentSelectedSport][fixtureId] || !livescores[fixtureId]){
                        //         toReset.push(+fixtureId);
                        //     }
                        // }
                        // console.log(toReset);
                        // if (toReset.length) this.props.resetLiveMatches(toReset);

                        for(let id in liveMarkets) {
                            if(liveMarkets[id] && livescores[id] && Object.keys(liveMarkets[id]).length) {
                                finalMatches[id] = {...partialEvents[currentSelectedSport][id],Markets: liveMarkets[id], Livescore: livescores[id]};
                            }
                        }

                        this.setState({liveMatches: finalMatches, isLoading: false, runningFetch: false, disbleSportsSwitch:false}, ()=> this.startListener());
                    }
                }
            });
        } catch (err) {
            liveMarketCount++;
                    if(liveMarketCount === count)
                    {
            
                        let finalMatches = {};
                        let { liveMatchesObj, currentSelectedSport } = this.state;
                        // let toReset= [];

                        // for(let id in liveMatchesObj[currentSelectedSport]) {
                        //     let fixtureId = liveMatchesObj[currentSelectedSport][id];
                        //     if(!partialEvents[currentSelectedSport][fixtureId] || !livescores[fixtureId]){
                        //         toReset.push(+fixtureId);
                        //     }
                        // }
                        // console.log(toReset);
                        // if (toReset.length) this.props.resetLiveMatches(toReset);

                        for(let id in liveMarkets) {
                            finalMatches[id] = {...partialEvents[currentSelectedSport][id],Markets: liveMarkets[id], Livescore: livescores[id]};
                        }
                        this.setState({liveMatches: finalMatches, isLoading: false, runningFetch: false, disbleSportsSwitch:false}, ()=> this.startListener());
                    }
            console.log(err);
        }
    }

    openExtraOddsModal = (fixture, liveStreamAvailable) => {
        this.unsubscribe();
            this.getSingleMatchMarkets(fixture.fixture_id).then(e => {
                fixture = {...fixture, Markets: e.market, Livescore: e.livescore}
                this.subscribeExtraMarket(fixture.fixture_id);
                
                this.setState({ event: fixture, liveStreamAvailable: liveStreamAvailable }, () => {
                this.props.setCurrentEvent(fixture);
                this.setState({ showExtraOddsModal: true });
            })
                
                
                
                // const collection = this.props.language === `en`? `d_event` : `d_event_${this.props.language}`;
                // unSub.push(firebaseDB.collection(collection).doc(`${fixture.FixtureId}`).onSnapshot(this.handleFirebaseUpdates));
                });

    };

    closeExtraOddsModal = () => {
        this.unsubscribeEvents();
        this.getLiveMatchesMarkets();
        // this.getLiveMatches();
        this.setState({ showExtraOddsModal: false });
    };

    openStatisticsModal = (fixture) => {
        let statsTemplateType = 'live';
        this.setState({ showStatisticsModal: true });
        this.props.setStatistics(fixture.fixture_id, 'forMatch', statsTemplateType);
    };

    openLiveStreamModal = (streamURL) => {
        this.unsubscribe();
        this.setState({ liveStreamUrl : streamURL }, () => this.setState({ showLiveStream: true }));
    }

    closeLiveStreamModal = () => {
        this.unsubscribe();
        liveMatches = {};
        this.setState({disbleSportsSwitch: true})
        this.getLiveMatches();
        this.setState({ liveStreamUrl : null, showLiveStream: false });
    }

    closeStatisticsModal = () => {
        this.setState({ showStatisticsModal: false });
        this.props.clearStatistics();
    };

    fetchMoreData = () => {
        if (this.props.hasNextPage) {
            if (!this.props.searchStarted) {
                // if is in main page
                this.props.getSportEvents(this.props.selectedSport);
            } else {
                // if is in search page
                this.props.search(this.props.searchValue);
            }
        }
    };

    groupBySport = (matches) => { 
        const { currentSelectedSport } = this.state;
        const sportWiseMatch = {};
        
        for (let key in matches) {
            if (!matches.hasOwnProperty(key)) continue;

            const match = matches[key];
            if (!sportWiseMatch[match.fixture_status]) {
                sportWiseMatch[match.fixture_status] = [];
            }
            sportWiseMatch[match.fixture_status].push(match);
        }
        return sportWiseMatch;
    };

    renderMarketAndMatches =  (liveMatches) => {
        const elems = [];
        for (let sportId in liveMatches) {
            if (!liveMatches.hasOwnProperty(sportId)) continue;

            const matches = liveMatches[sportId];
            if (matches[0].fixture_status === lSportsConfig.statuses.inplay) { 
            elems.push(
                <div key={`random`}> 
                    <Matches events={matches} liveStreamData={this.state.liveStreamData} openLiveStreamModal={this.openLiveStreamModal} openMarketsModal={this.openExtraOddsModal} openStatisticsModal={this.openStatisticsModal} />
                </div>,
            );
               
            } 
         }
        return elems;
    };

    selectLocation = (locationId) => {
        this.setState({ currentSelectedLeague: locationId });
    }

    selectSport = (sportId) => {
        this.setState({ currentSelectedSport: sportId }, () => {
            // this.props.selectTodaySport(sportId);
        })
    }

    resetSelectedLocations = () => {
        this.setState({ currentSelectedLeague: 'all' });
        //this.props.resetSelectedLocations();
    }

    handleSearch = (value) => {
        this.setState({searchVal : value });
        this.props.searchTodayEvents(value);
    }


    render() {
        let {
            showExtraOddsModal,
            event,
            showStatisticsModal,
            liveMatches,
            isLoading,
            locationAndSportsObj,
            currentSelectedLeague,
            searchVal,
            currentSelectedSport,
            showLiveStream,
            liveStreamUrl,
            liveStreamData,
            todayMatches
        } = this.state;
        let { statisticsType, selectMainMarket, mainSelectedMarket, language } = this.props;
        let lang = `name_${ language.toLowerCase() }`;
        let matchForModal, filteredLiveMatches = {};
        let liveMatchesFilteredBySports = filter(liveMatches , (e => e.sport?.Id === currentSelectedSport));
        // debugger;
        if (currentSelectedLeague !== 'all') {
            filteredLiveMatches = filter(liveMatchesFilteredBySports, function(o) { return o.location.Id ==  Number.parseInt(currentSelectedLeague) });
        }

        if( searchVal !== '') {
            filteredLiveMatches = filter(liveMatchesFilteredBySports, function(o) {
                let searchParam =  `${o.participants[0][ lang ] || o.participants[0]?.name_en} ${o.participants[1][ lang ] || o.participants[1]?.name_en}` ;
                return includes( searchParam.toLowerCase(), searchVal.toLowerCase());
            });
        }
        // debugger;
        const groupedLiveEvents = this.groupBySport( currentSelectedLeague !== 'all' || searchVal !== '' ? filteredLiveMatches : liveMatchesFilteredBySports);
        const groupedTodayEvents = this.groupBySport(todayMatches);

        let matches = this.renderMarketAndMatches(groupedLiveEvents);
        matches = matches.concat(this.renderMarketAndMatches(groupedTodayEvents));



        // Filter out the single match for extraOddsModal
        if (showExtraOddsModal) {
            // let items = groupedLiveEvents['2'];
            // for (let sportId in items) {
            //     if (!items.hasOwnProperty(sportId)) continue;
            //     if (event.fixture_id === items[sportId].fixture_id) {
            //         matchForModal = items[sportId];
            //     }
            // }
            matchForModal = this.state.event;
        }
        let drawContent =
            matches.length > 0 ? (
                <div>
                    <MainMarketSelector
                        selectMainMarket={selectMainMarket}
                        mainMarket={MARKET_FOR_OUTER_SLIDER[currentSelectedSport]}
                        mainSelectedMarket={MARKET_FOR_OUTER_SLIDER[currentSelectedSport][0].Id !== mainSelectedMarket ? mainSelectedMarket : MARKET_FOR_OUTER_SLIDER[currentSelectedSport][0].Id }
                    />
                    {matches}
                    {/* <div className="pb-4" /> */}
                    {showExtraOddsModal &&
                    <ExtraOddsModal 
                        event={event}
                        liveStreamAvailable={this.state.liveStreamAvailable}
                        closeModal={this.closeExtraOddsModal}
                        liveMatch={event}
                        // liveMatchURL= {find(liveStreamData,(e) => e.matchId == event.fixture_id)?.iframe}
                        />}
                    {/* {showStatisticsModal && statisticsType === 'forMatch' && <StatisticsModal closeModal={this.closeStatisticsModal} />} */}
                    {/* {showLiveStream  && <LiveStreamModal closeModal={this.closeLiveStreamModal} liveStreamMatch={liveStreamUrl} />} */}
                </div>

            ) : (
                null
                //<div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
            );

        return (
            <div className="events__wrap">
                <SportsLive 
                        sports={locationAndSportsObj}
                        selectSport={this.selectSport}
                        selectedSport={currentSelectedSport}
                        resetSelectMainMarket={selectMainMarket}
                        resetSelectedLocations={this.resetSelectedLocations}
                        isDisable = {this.state.disbleSportsSwitch}
                    />
                {isLoading ? <Loading /> :
                    <>
                    
                    <Locations
                        fromLivePage={true}
                        locationsObj={find(locationAndSportsObj, { Id : currentSelectedSport })} // send current selected sport from array of objects
                        searchVal={searchVal}
                        handleSearch={this.handleSearch}
                        selectLocation={this.selectLocation}
                        currentSelectedLeague={currentSelectedLeague}
                        resetSelectedLocations={this.resetSelectedLocations}
                    />
                    {drawContent}
                    <div className={`pre-match-wrapper non-centre-loader`}>
                        {/* <p className="header-live-today" >Upcoming Events</p> */}
                    <Today
                        fromLivePage={true}
                        noLoading={true}
                        noSports={true}
                        currentSelectedSport={currentSelectedSport}
                        currentSelectedMarket={MARKET_FOR_OUTER_SLIDER[currentSelectedSport][0].Id !== mainSelectedMarket ? mainSelectedMarket : MARKET_FOR_OUTER_SLIDER[currentSelectedSport][0].Id }
                        currentSelectedLeague={currentSelectedLeague}
                    />
                    </div>
                    </>
                    }
            </div>
        );
    }
}

Events.propTypes = {
    selectedSport: PropTypes.number,
    mainEvents: PropTypes.array,
    selectMainMarket: PropTypes.func,
    mainSelectedMarket: PropTypes.string,
    noSearchResults: PropTypes.bool,
    noEvents: PropTypes.bool,
    getSportEvents: PropTypes.func,
    getInplayLocations: PropTypes.func,
    setInplayResetPage: PropTypes.func,
    clearSportEvents: PropTypes.func,
    clearLocations: PropTypes.func,
    setCurrentEvent: PropTypes.func,
    hasNextPage: PropTypes.bool,
    search: PropTypes.func,
    searchStarted: PropTypes.bool,
    searchValue: PropTypes.string,
    language: PropTypes.string,
    statisticsType: PropTypes.string,
    clearStatistics: PropTypes.func,
    setStatistics: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        selectedSport: state.inplay.selectedSport,
        mainEvents: state.inplay.mainEvents,
        mainSelectedMarket: state.inplay.mainSelectedMarket,
        noSearchResults: state.inplay.noSearchResults,
        noEvents: state.inplay.noEvents,
        hasNextPage: state.inplay.hasNextPage,
        searchStarted: state.inplay.searchStarted,
        searchValue: state.inplay.searchValue,
        language: state.general.language,
        statisticsType: state.lsportsGlobal.statisticsType,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,   
        totalEventCount: state.inplay.totalEventCount,
        lastIndex: state.inplay.lastIndex,
        statsData: state.general.statsData   
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectMainMarket: (marketId) => dispatch(selectMainMarket(marketId)),
        setCurrentEvent: (event) => dispatch(setCurrentEvent(event)),
        getSportEvents: (sportId) => dispatch(getSportEvents(sportId)),
        search: (value) => dispatch(search(value)),
        getInplayLocations: (sportId) => dispatch(getInplayLocations(sportId)),
        setInplayResetPage: () => dispatch(setInplayResetPage()),
        clearSportEvents: () => dispatch(clearSportEvents()),
        clearLocations: () => dispatch(clearLocations()),
        clearStatistics: () => dispatch(clearStatistics()),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        resetSelectedLocations: (locationId) => dispatch(resetSelectedLocations(locationId)), 
        selectTodaySport: (sportId) => dispatch(selectSportMobile(sportId)), 
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        searchTodayEvents: (value) => dispatch(searchTodayEvents(value)),
        setCurrentEventCount: (count) => dispatch(setCurrentEventCount(count)),
        setTotalEventCount: (count) => dispatch(setTotalEventCount(count)),
        resetLiveMatches: (payload) => dispatch(resetLiveMatches(payload)),
        getStatsData: () => dispatch(getStatsData()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
    