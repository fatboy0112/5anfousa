import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { filter, includes, find, forEach, orderBy, isEmpty, isEqual,  } from 'lodash';
import Matches from './Matches';
import Loading from '../../Components/Common/NewLoading';
import ExtraOddsModal from './ExtraOddsModal';
import StatisticsModal from '../../Components/Shared/StatisticsModal';
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
    resetLiveMatches,
    setLiveMatchesObject,
    setCurrentSelectedSport,
    setPartialEvents,
    removeLiveEvents,
    setLiveMatches,
    setSelectedLocation
} from '../../store/actions/inplayActions';
import { setCurrentEvent, clearStatistics, setStatistics, setExtraMarkets } from '../../store/actions/lsports.global.actions';
import { locationSortingOrder, sportAndLocationData, staticPrematchSports } from '../../config/sports';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH, liveMarketOnMain } from '../../config/markets';
import map from 'lodash.map';
import { remove } from 'lodash';
import { lSportsConfig, maxWebsocketRetryCount } from '../../config';
import Util from '../../helper/Util';
import { resetSelectedLocations, searchTodayEvents } from '../../store/actions/todayActions';
import { getStatsData } from '../../store/actions/general.actions';
// import LiveStreamModal from '../../Components/Shared/LiveStramModal';
import Locations from './Locations';
import jwtService from '../../services/jwtService';
import { onUpdateMatchMarkets, onUpdateLiveDeventMarkets } from '../../graphql/subscriptions';
import { API, graphqlOperation } from 'aws-amplify';
import { dynamoClient } from '../../App';
import { getSingleLivePartialEvent, getAllLiveMatches, getLiveMatchMarkets, getLiveCount } from '../../dynamo/inplayParams';
import Login from '../../Components/Login';
import MarketHeader from '../Shared/MarketHeader';
// import Upcoming from '../Today';
// import { format } from 'date-fns';
// import groupBy from 'lodash.groupby';
import SportsLive from './SportsLive';
import { Translate } from '../../localization';
import { Link } from 'react-router-dom';
// List of fixtures for which firebase events have been subscribed.
// let subscribedFixtures = [];
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
let nextExtraMarkets = false;
let xtraHeight;
let extraMarketEventId;
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
            currentSelectedSport: lSportsConfig.inplay.selectedSport,
            showExtraOddsModal: false,
            event: {},
            showStatisticsModal: false,
            liveMatches: {},
            fixedData: {},
            isLoading: true,
            locationAndSportsObj: {},
            currentSelectedLeague: null,
            currentSelectedLocation: 'all',
            searchVal: '',
            liveMatchesObj: {},
            liveStreamAvailable: false,
            liveStreamData: [],
            liveStreamUrlData: null,
            showLiveStream: false,
            fixturesLoaded: false,
            marketsLoaded: false,
            isDisconnected: false,
            partialEvents: {},
            showToday: false,
            runningFetch: false,
            disbleSportsSwitch: false,
            showLogin: false,
            expandTable: false,
        };
    }

    componentDidMount() {
        // TODO: Fetch all the live Matches and there Market data
        //this.loadAllDataForLiveMatches();
        const { getStatsData, statsData, liveMatchesObj, partialEvents } = this.props;
        const lastUrl = localStorage.getItem('lastUrl');
        const fromExtraMarket = includes(lastUrl, '/extra-market/');
        const secondLastUrl = localStorage.getItem('secondLastUrl');
        const checkLive = includes(secondLastUrl, 'live');
        if(false && !isEmpty(liveMatchesObj) && !isEmpty(this.props.partialEvents) && fromExtraMarket){
            this.setSportsAndLocations();
            this.getLiveMatchesMarkets();
            this.setState({ isLoading: false }, () => {
                extraMarketEventId = localStorage.getItem('eventId');
                xtraHeight = localStorage.getItem('xtraHeight');
                const fromExtraMarketLive = includes(lastUrl, '/live/extra-market/');
                if (extraMarketEventId) {
                    let divHeight = document.getElementById('scrollableDivMatch').offsetTop;
                    var yOffset = document.getElementById(extraMarketEventId);
                    if (yOffset) {
                        document.getElementById('scrollableDivMatch').scrollTop = xtraHeight;
                    }
                    xtraHeight = null;
                    extraMarketEventId = null;
                }
            });

        }
        else {
            this.props.setSelectedLocation('all');
            liveMatches = {};
            this.props.setLiveMatches({});
            this.setState({ disbleSportsSwitch: true });
            this.getLiveMatches();
        }

        //this.fetchLiveStreamMatches();

        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
    }

    componentDidUpdate(prevProps, prevState) {
        const { isDisconnected, currentSelectedSport } = this.state;
        if (prevState.isDisconnected !== isDisconnected) {
            if (isDisconnected) {
                this.unsubscribe();
                this.unsubscribeEvents();
            } else if (!isDisconnected) {
                liveMatches = {};
                this.setState({ disbleSportsSwitch: true });
                this.getLiveMatches();
            };
        }

        if (prevState.currentSelectedSport && prevState.currentSelectedSport !== currentSelectedSport) {
            this.unsubscribe();
            this.unsubscribeEvents();
            this.setState({ isLoading: true, disbleSportsSwitch: true, currentSelectedLeague: 'all', });
            liveMatches = {};
            this.getLiveMatches();
            const sections = document.querySelectorAll('.collapse');
            for (let i = 0; i < sections.length; i++) {
                sections[i].classList.remove('show');
            }
        }

        if (prevProps.dateFilter !== this.props.dateFilter) {
            const sections = document.querySelectorAll('.collapse');
            for (let i = 0; i < sections.length; i++) {
                sections[i].classList.remove('show');
            }
            this.resetSelectedLocations();
        }
    }

    componentWillUnmount() {
        liveMatches = {};
        sportsCount = {};
        getDataFromDB = false;
        extraMarketEventId = null;
        xtraHeight = null;
        if (!nextExtraMarkets) {
            this.props.clearSportEvents();
            this.props.clearLocations();
            this.props.removeLiveEvents();
            nextExtraMarkets = false;
        }
        this.unsubscribe();
        // this.unsubscribeEvents();
        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.selectedSport !== state.currentSelectedSport) {
            return {
                currentSelectedSport: props.selectedSport,
            };
        }
        return null;
    }

    startTimer = () => {
        timerAddDel = setInterval(() => {
            liveMatchesCheck = {};
            this.getLiveMatchCount();
            this.checkLiveMatches();
        }, 20000);
    }

    getLiveMatches = (nextToken) => {
        dynamoClient.scan(getAllLiveMatches(nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if (!data.Items.length) {
                    this.setSportsAndLocations();
                }
                forEach(data.Items, (item) => {
                    if (item.fixture_status === lSportsConfig.statuses.inplay) {
                        if (!liveMatches[item.sport_id]) {
                            liveMatches[item.sport_id] = [];
                        }
                        liveMatches[item.sport_id].push(item.fixture_id);
                    }
                });
                if (data.LastEvaluatedKey) {
                    this.getLiveMatches(data.LastEvaluatedKey);
                } else {
                    this.props.setLiveMatchesObject(liveMatches).then(() => {
                        this.getLiveMatchCount();
                        this.getAllLiveFixtureDevents();
                    });
                }
            }
        });
    }

    checkLiveMatches = (nextToken) => {
        dynamoClient.scan(getAllLiveMatches(nextToken), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if (!data.Items.length) {
                    this.setSportsAndLocations();
                }
                forEach(data.Items, (item) => {
                    if (item.fixture_status === lSportsConfig.statuses.inplay) {
                        if (!liveMatchesCheck[item.sport_id]) {
                            liveMatchesCheck[item.sport_id] = [];
                        }
                        liveMatchesCheck[item.sport_id].push(item.fixture_id);
                    }
                });
                if (data.LastEvaluatedKey) {
                    this.checkLiveMatches(data.LastEvaluatedKey);
                } else {
                    if (!isEqual(this.props.liveMatchesObj, liveMatchesCheck)) {
                        this.props.setLiveMatchesObject(liveMatchesCheck).then(() => {
                            this.getAllLiveFixtureDevents();
                            // this.props.getStatsData();
                        });
                    }
                }
            }
        });
    }

    getLiveMatchesMarkets = (clear) => {
        const { currentSelectedSport } = this.state;
        let { partialEvents, liveMatchesObj } = this.props;
        let data = !isEmpty(partialEvents[currentSelectedSport]) && Object.values(partialEvents[currentSelectedSport]);
        liveMarketCount = 0;
        liveScoreCount = 0;
        if (clear) {
            liveMarkets = {};
        }
        // const missingData = difference(liveMatchesObj[currentSelectedSport], Object.keys(partialEvents[currentSelectedSport]));  
        // console.info('>>>>> Missing Match from UI >>>>>>>: ', missingData);
        forEach(data, (e) => {
            liveMarkets[e.fixture_id] = {};
            this.getSingleMatchMarkets(e.fixture_id, data.length);
        });
        return;

    }

    unsubscribe = () => {
        console.log(' *******  Unsubscribe live matches **********');
        if(unsubscribe) {
            unsubscribe.unsubscribe();
        }
        if (websocket) {
            websocket.close();
        }
        clearInterval(timerAddDel);
        unsubscribe = null;
    }


    startListener = () => {
        this.unsubscribe();
        this.startTimer();

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
                                return clearInterval(webPing);
                            });
                        }).catch(() => this.setState({ isDisconnected: true }));
                }, 2000);
            return;
        }

        return this.setState({ isDisconnected: true });
    }

    fetchLiveStreamMatches = async () => {
        try {
            let liveStreamData = await jwtService.getLiveStreamData();
            this.props.setLiveStreamData(liveStreamData);
            // this.setState({ liveStreamData: liveStreamData });
        }
        catch (error) {
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
        let { currentSelectedSport } = this.state;
        let { liveMatchesObj } = this.props;
        liveEventsCount = 0;
        liveEvents = {};

        if (!liveMatchesObj[currentSelectedSport] && !isEmpty(liveMatchesObj)) {
            this.setState({ currentSelectedSport: Object.keys(liveMatchesObj)[0], isLoading: false });
            liveMatches = {};
            // this.getLiveMatches();
        } else if (isEmpty(liveMatchesObj)) {
            this.setSportsAndLocations();
        } else {
            forEach(liveMatchesObj[currentSelectedSport], (match) =>
                this.getSingleMatchPartialEvent(match)
            );
        }
    }

    getSingleMatchPartialEvent = async (fixtureId) => {
        const { currentSelectedSport } = this.state;
        let { liveMatchesObj, partialEvents } = this.props;
        try {
            let event = dynamoClient.query(getSingleLivePartialEvent(fixtureId)).promise();
            return await event.then(e => {
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

                liveEvents[fixtureId] = e.Items[0];
                liveEventsCount++;
                if (liveEventsCount === liveMatchesObj[currentSelectedSport].length) {
                    partialEvents[currentSelectedSport] = liveEvents;
                    this.props.setPartialEvents(partialEvents);
                    // this.setState({partialEvents: partialEvents}, () => {
                    this.setSportsAndLocations();
                    this.getLiveMatchesMarkets(true);
                    // });
                }
            });
        } catch (err) {
            //reset logic to be added here
            liveEventsCount++;
            if (liveEventsCount === liveMatchesObj[currentSelectedSport].length) {

                partialEvents[currentSelectedSport] = liveEvents;
                this.props.setPartialEvents(partialEvents);

                // this.setState({partialEvents: partialEvents}, () => {                       
                this.setSportsAndLocations();
                this.getLiveMatchesMarkets(true);

                // });
            }
            console.log(err);
        }
    }

    setSportsAndLocations = () => {
        // const { currentSelectedSport } = this.state;
        const { partialEvents, liveMatchesObj, selectedSport: currentSelectedSport } = this.props;
        let selectedSport;
        let sports = sportAndLocationData();
        let checkIsPartialEventEmpty = true;
        forEach(Object.values(partialEvents), (e) => {
            if (!isEmpty(e)) {
                checkIsPartialEventEmpty = false;
            }
        });
        if (checkIsPartialEventEmpty) {
            sports = orderBy(sports, ['priority', 'Count'], ['asc', 'desc']);
            this.setState({
                locationAndSportsObj: sports,
                isLoading: false, runningFetch: false
            });
            return;
        }
        for (let id in liveMatchesObj) {
            // let sport = liveMatchesObj[id];
            // sports[id].Count = sport.length;
            if (!getDataFromDB) {
                let sport = liveMatchesObj[id];
                if (sports[id]) sports[id].Count = sport.length;
            }
            else if (getDataFromDB && this.state.sportsCountObj[id]) {
                if (sports[id]) sports[id].Count = this.state.sportsCountObj[id].counter;
            }
        }
        for (let event of Object.values(partialEvents[currentSelectedSport] || {})) {
            let leagueData = {
                live_count: (sports[event.sport_id]?.Locations?.[event.location.Id]?.[event.league.Id]?.live_count || 0) + 1,
                ...event.league,
            };
            sports[event.sport_id].Locations[event.location.Id] = {
                ...sports[event.sport_id].Locations[event.location.Id],
                ...event.location,
                [event.league.Id]: { ...leagueData }
            };
        }


        this.getSortedLocations(sports);
        let sortedSports;
        if (sports[lSportsConfig.sports.football.id].Count === 0) {
            // If no football matches present sort by counts
            sortedSports = orderBy(sports, ['Count', 'Id'], ['desc', 'asc']);
        }
        else {
            // If there is football match then priorities it and rest sorted by count
            sortedSports = orderBy(sports, ['priority', 'Count'], ['asc', 'desc']);
        }
        if (!currentSelectedSport) {
            for (let i in sortedSports) {
                selectedSport = sortedSports[i];
                break;
            }
        }
        else selectedSport = find(sortedSports, (e) => e.Id == currentSelectedSport);
        // this.setState({ locationAndSportsObj : sortedSports, currentSelectedSport: selectedSport.Id });
        this.setState({ locationAndSportsObj: sortedSports });
    }

    getLiveMatchCount = async () => {
        const { liveMatchesObj } = this.props;
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

    getSortedLocations = (sports) => {
        forEach(sports, elem => {
            elem.Locations = this.sortLogic(elem.Locations);
        });
    }

    sortLogic = (locations) => {
        const sortingOrder = locationSortingOrder;
        let preSortedList = [];
        for (let s in sortingOrder) {
            let elem = remove(locations, l => {
                if (l) return l.name_en === sortingOrder[s];
            });
            if (elem.length > 0) preSortedList.push(elem[0]);
        }
        return preSortedList.concat(locations.sort((a, b) => Util.compareStrings(a.name_en, b.name_en)));

    }

    groupMatchesByStatus = () => {
        let { fixedData } = this.state;
        if (!fixedData) return;

        const matchesByStatus = {
            '_2': {},
            '_today': {},
        };
        Object.values(fixedData).forEach((item) => {
            // If Fixture/Markets/Livescore is not available skip that match
            if (item.Fixture && (item.Markets && !isEmpty(item.Markets)) && item.Livescore) {
                if (item.Fixture.Status === lSportsConfig.statuses.inplay && item.Livescore.Scoreboard.Status === lSportsConfig.statuses.inplay) {
                    matchesByStatus['_2'][item.FixtureId] = item;
                }
            }
        });
        return matchesByStatus;
    };

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
                this.openExtraOddsModal({fixture_id: fixtureId});
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
                this.openExtraOddsModal({fixture_id: fixtureId});
            },
        });
    }

    unsubscribeEvents = () => {
        if (liveMatchSub) liveMatchSub.close();
        if (liveMatchSubAppSync) liveMatchSubAppSync.unsubscribe();
        console.log('***** UnSubscribed all live matches. *****');
    };

    marketDifference = (markets, prevMarkets) => {
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

    handleExtraMarketUpdates = ({ value }) => {
        let updatedMatch = value.data.onUpdateLiveMarkets || value.data;
        if (typeof(updatedMatch) == 'string') updatedMatch = JSON.parse(updatedMatch);
        let { event } = this.state;
        let newFixture = {};

        if (!updatedMatch || !event || event.fixture_id != updatedMatch?.match_id) return null;

        if (updatedMatch.market) {
            let updatedMarket = JSON.parse(updatedMatch.market);
            newFixture.market = { ...event.market, ...updatedMarket };
        }
        else {
            newFixture.market = event.market;
        }
        if (updatedMatch.livescore) {
            newFixture.Livescore = JSON.parse(updatedMatch.livescore);
        }
        else {
            newFixture.Livescore = event.Livescore;
        }



        //const marketWithDiff1 =  this.marketDifference(newFixture.imp_market, this.state.event.imp_market);
        const marketWithDiff2 = this.marketDifference(newFixture.market, this.state.event.market);
        newFixture.Markets = [...marketWithDiff2];
        newFixture = { ...event, ...newFixture };
        this.props.setCurrentEvent(newFixture);
        this.setState({ event: newFixture }, () => { this.props.setExtraMarkets(newFixture.Markets); });

    }

    handleFirebaseUpdates = ({ value }) => {
        let updatedMatch = value.data.onUpdateLiveMarkets || value.data;
        if (typeof(updatedMatch) == 'string') updatedMatch = JSON.parse(updatedMatch);
        const id = updatedMatch.match_id;
        const { liveMatches: { [id]: oldMatches } } = this.props;
        let marketId = updatedMatch.fixture_id;
        marketId = marketId?.split('^')[1];
        if (!updatedMatch.sport_event_status && marketId && liveMarketOnMain.indexOf(marketId) === -1) return;


        if (updatedMatch.outcomes) {
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
                ...this.props.liveMatches,
                [id]: { ...oldMatches, Livescore: liveScore, Markets: { ...oldMatches.Markets, [`id_${marketWithDiff[0].Id}`]: marketWithDiff[0] } },
            };
            this.props.setLiveMatches(newLiveMatches);
        }
        else if (updatedMatch.sport_event_status) {
            let newLiveMatches = {
                ...this.props.liveMatches,
                [id]: { ...oldMatches, Livescore: JSON.parse(updatedMatch.sport_event_status) },
            };
            this.props.setLiveMatches(newLiveMatches);
        }
    };

    

    getSingleMatchMarkets = async (fixtureId, count) => {
        let { partialEvents } = this.props;
        try {
            let event = dynamoClient.query(getLiveMatchMarkets(fixtureId.toString())).promise();
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
                if (!count && false)
                    return fixture || e.Items[0];
                else {
                    liveMarkets[fixtureId] = fixture.market;
                    livescores[fixtureId] = fixture.livescore;
                    liveMarketCount++;
                    if (liveMarketCount === count) {
                        let finalMatches = {};
                        let { currentSelectedSport } = this.state;
                        // let toReset= [];

                        // for(let id in liveMatchesObj[currentSelectedSport]) {
                        //     let fixtureId = liveMatchesObj[currentSelectedSport][id];
                        //     if(!partialEvents[currentSelectedSport][fixtureId] || !livescores[fixtureId]){
                        //         toReset.push(+fixtureId);
                        //     }
                        // }
                        // console.log(toReset);
                        // if (toReset.length) this.props.resetLiveMatches(toReset);

                        for (let id in liveMarkets) {
                            if (liveMarkets[id] && livescores[id] && Object.keys(liveMarkets[id]).length)
                                finalMatches[id] = { ...partialEvents[currentSelectedSport][id], Markets: liveMarkets[id], Livescore: livescores[id] };
                        }
                        this.props.setLiveMatches(finalMatches).then(() => {
                            this.setState({ liveMatches: finalMatches, isLoading: false, runningFetch: false, disbleSportsSwitch: false }, () => this.startListener());
                        });
                    }
                }
            });
        } catch (err) {
            liveMarketCount++;
            if (liveMarketCount === count) {
                let finalMatches = {};
                let { currentSelectedSport } = this.state;
                // let toReset= [];

                // for(let id in liveMatchesObj[currentSelectedSport]) {
                //     let fixtureId = liveMatchesObj[currentSelectedSport][id];
                //     if(!partialEvents[currentSelectedSport][fixtureId] || !livescores[fixtureId]){
                //         toReset.push(+fixtureId);
                //     }
                // }
                // console.log(toReset);
                // if (toReset.length) this.props.resetLiveMatches(toReset);

                for (let id in liveMarkets) {
                    finalMatches[id] = { ...partialEvents[currentSelectedSport][id], Markets: liveMarkets[id], Livescore: livescores[id] };
                }
                this.props.setLiveMatches(finalMatches).then(() => {
                    this.setState({ liveMatches: finalMatches, isLoading: false, runningFetch: false, disbleSportsSwitch: false }, () => this.startListener());
                });
            }
            console.log(err);
        }
    }

    openExtraOddsModal = (fixture, liveStreamAvailable) => {
        this.unsubscribe();
        nextExtraMarkets = true;
        this.getSingleMatchMarkets(fixture.fixture_id).then(e => {
            fixture = { ...fixture, Markets: e?.market || {}, Livescore: e?.livescore || {}};
            this.subscribeExtraMarket(fixture.fixture_id);

            this.setState({ event: fixture, liveStreamAvailable: liveStreamAvailable }, () => {
                this.props.setCurrentEvent(fixture);
                this.setState({ showExtraOddsModal: true });
            });
            this.props.setStatistics(fixture.fixture_id, 'forPopup', 'live');
            // const collection = this.props.language === `en`? `d_event` : `d_event_${this.props.language}`;
            // unSub.push(firebaseDB.collection(collection).doc(`${fixture.FixtureId}`).onSnapshot(this.handleFirebaseUpdates));
        });

    };

    openUpcomingExtraModal = () => {
        // check to detect if xtra market is opened 
        nextExtraMarkets = true;
    }

    closeExtraOddsModal = () => {
        this.unsubscribeEvents();
        // this.getLiveMatchesMarkets();
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
        let authed = localStorage.getItem('jwt_access_token') || sessionStorage.getItem('jwt_access_token') ? true : false;
        if (!authed) {
            this.setState({ showLogin: true });
        }
        else {
            this.setState({ liveStreamUrlData: streamURL }, () => this.setState({ showLiveStream: true }));
        }
    }

    hideLogin = () => {
        this.setState({ showLogin: false });
    };

    showLogin = () => {
        this.setState({ showLogin: true });
    }

    selectLocation = (locationId) => {
        this.props.setSelectedLocation(locationId);
        this.setState({ currentSelectedLocation: locationId });
    }

    resetSelectedLeague = () => {
        this.setState({ currentSelectedLeague: null });
    }

    resetSelectedLocations = () => {
        this.props.setSelectedLocation('all');
        this.setState({ currentSelectedLeague: 'all' });
    }

    handleSearch = (value) => {
        this.setState({ searchVal: value });
        this.props.searchTodayEvents(value);
    }

    closeLiveStreamModal = () => {
        this.unsubscribe();
        liveMatches = {};
        this.setState({ disbleSportsSwitch: true });
        this.getLiveMatches();
        this.setState({ liveStreamUrlData: null, showLiveStream: false });
    }

    closeStatisticsModal = () => {
        this.setState({ showStatisticsModal: false });
        this.props.clearStatistics();
    };

    groupBySport = (matches) => {
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

    selectLeague = (leagueId) => {
        this.setState({ currentSelectedLeague: leagueId });
    }


    renderMarketAndMatches = (liveMatches) => {
        const elems = [];
        const { limit: fromHomeLimit } = this.props;
        for (let sportId in liveMatches) {
            if (!liveMatches.hasOwnProperty(sportId)) continue;

            let matches = liveMatches[sportId];
            if (fromHomeLimit) matches = matches.slice(0,fromHomeLimit);
            if (matches[0].fixture_status === lSportsConfig.statuses.inplay) {
                elems.push(
                    <Matches events={matches} liveStreamData={this.state.liveStreamData} openLiveStreamModal={this.openLiveStreamModal} openMarketsModal={this.openExtraOddsModal} openStatisticsModal={this.openStatisticsModal} />
                );

            }
        }
        return elems;
    };


    handleTableExpand = () => {
        this.setState((prevState) => ({ expandTable: !prevState.expandTable }),
            () => {
                const { expandTable } = this.state;
                if (expandTable) document.getElementById('side-navbar').classList.add('expand-nav');
                else document.getElementById('side-navbar').classList.remove('expand-nav');
            });
    }

    render() {
        let {
            showExtraOddsModal,
            event,
            showStatisticsModal,

            isLoading,
            currentSelectedLeague,
            searchVal,
            currentSelectedSport,
            showLiveStream,
            liveStreamUrlData,
            liveStreamData,
            showLogin,
            locationAndSportsObj,
            expandTable,
            currentSelectedLocation
        } = this.state;
        let { statisticsType, dateFilter,liveMatches,selectedLocationList, upcomingEvents, limit: fromHomeLimit ,selectedLeagueList, language } = this.props;
        let liveMatchesFilteredBySports = filter(liveMatches, (e => e.sport?.Id === currentSelectedSport));
        let filteredLiveMatches = liveMatchesFilteredBySports;
        let currentLocationObj = find(locationAndSportsObj, { Id: currentSelectedSport });
        const lan = `name_${ language.toLowerCase() }`;
        if (selectedLocationList.length || selectedLeagueList.length) {
            filteredLiveMatches = filter(filteredLiveMatches, function (o) { return (selectedLocationList.indexOf(`${o.location.Id}`) > -1 || selectedLeagueList.indexOf(`${o.league.Id}`) > -1); });
        }

        if (currentSelectedLeague) {
            filteredLiveMatches = filter(filteredLiveMatches, function (o) { return (currentSelectedLeague == o.league.Id)});
        }

        
        if ((currentSelectedLeague !== 'all' && !filteredLiveMatches.length) || !liveMatchesFilteredBySports.length) {
            let sessionFixture = sessionStorage.getItem('fixture_list');
            if (sessionFixture) {
                sessionFixture = JSON.parse(sessionFixture);
                sessionFixture = sessionFixture.filter((item) => item.fixtureStatus != lSportsConfig.statuses.inplay);
                sessionStorage.setItem('fixture_list', JSON.stringify(sessionFixture));
            }
        }

        if (searchVal !== '') {
            filteredLiveMatches = filter(filteredLiveMatches, function (o) {
                let searchParam = `${o.participants[0][ lan ] || o.participants[0]?.name_en} ${o.participants[1][ lan ] || o.participants[1]?.name_en}` ;
                return includes(searchParam.toLowerCase(), searchVal.toLowerCase());
            });
        }

        const groupedLiveEvents = this.groupBySport(currentSelectedLeague !== 'all' || searchVal !== '' || selectedLeagueList.length ? filteredLiveMatches : liveMatchesFilteredBySports);

        let matches = this.renderMarketAndMatches(groupedLiveEvents);



        // Filter out the single match for extraOddsModal
        if (showExtraOddsModal) {
            // let items = groupedLiveEvents['2'];
            // for (let sportId in items) {
            //     if (!items.hasOwnProperty(sportId)) continue;
            //     if (event.fixture_id === items[sportId].fixture_id) {
            //         matchForModal = items[sportId];
            //     }
            // }
        }
        let drawContent =
            matches.length > 0 ? (
                <React.Fragment>

                    {matches}
                    {/* <div className="pb-4" /> */}
                    {showExtraOddsModal &&
                        <ExtraOddsModal
                            showLogin={this.showLogin}
                            event={event}
                            liveStreamAvailable={this.state.liveStreamAvailable}
                            closeModal={this.closeExtraOddsModal}
                            liveMatch={event}
                            liveStreamData={liveStreamData}
                        />}
                    {showStatisticsModal && statisticsType === 'forMatch' && <StatisticsModal closeModal={this.closeStatisticsModal} />}
                    {/* {showLiveStream  && <LiveStreamModal closeModal={this.closeLiveStreamModal} liveStreamMatch={liveStreamUrlData} />} */}
                    {showLogin && <Login hideLogin={this.hideLogin}/>}
                </React.Fragment>
                
                ) : (
                    null
                    //<div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
                );
        return (
            <React.Fragment>
                {/* <div id="scrollableDiv" className={ `odds-panel ${expandTable ? 'mid-expand' : ''}`}> */}
                { !isLoading && <SportsLive
                        sports={locationAndSportsObj}
                        // selectSport={this.props.selectSportMobile}
                        selectedSport={currentSelectedSport}
                    />}
                {/* <BannerCarousel /> */}
                <div className="table-responsive position-relative">
                    <span className="drawer" href >
                        <i className="icon-color" onClick={ this.handleTableExpand }>
                            <img src="/images/rounded.svg" className='w-75'/>
                        </i>
                        { fromHomeLimit ? Translate.inplay : 
                        <span className='ml-3'>{staticPrematchSports()[currentSelectedSport]?.name}</span>
                        }
                    </span>
                    { !isLoading && 
                    <Locations
                        fromLivePage={true}
                        locationsObj={find(locationAndSportsObj, { Id : currentSelectedSport })} // send current selected sport from array of objects
                        searchVal={searchVal}
                        handleSearch={this.handleSearch}
                        selectLocation={this.selectLocation}
                        selectLeague={this.selectLeague}
                        currentSelectedLeague={currentSelectedLocation}
                        selectedTournament={currentSelectedLeague}
                        resetSelectedLocations={this.resetSelectedLocations}
                    />
                    }
                    <table className='table mb-0'>
                        <thead>
                            <tr>
                                <th scope="col">&nbsp;</th>
                                <th scope="col">&nbsp;</th>
                                <th scope="col">&nbsp;</th>
                                <th scope="col">&nbsp;</th>
                                <MarketHeader mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[currentSelectedSport]} />
                                <th scope="col">&nbsp;</th>
                            </tr>
                        </thead>
                        {isLoading ? 
                            <tbody>
                                <tr>
                                    <td colspan='9' className='p-0'><Loading customClass='odds-panel w-100 pt-0 mx-0'/> </td>
                                </tr>
                            </tbody>
                            : matches.length > 0 ?  
                                <>
                                    {drawContent}
                                </>
                            :
                                <tbody>
                                    <tr>
                                        <td colspan='9'>
                                            <div className='no-data fs-15 pt-3 pl-3 pb-3'>
                                                { Translate.noLiveMatch }
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            }
                    </table>
                    {fromHomeLimit && matches.length > 5 && <Link className='see-more-btn' to='/d/live-betting'>See more</Link>}
                    {/* <Upcoming
                            fromLivePage={true}
                            noLoading={true}
                            noSports={true}
                            currentSelectedSport={currentSelectedSport}
                            currentSelectedLeague={currentSelectedLocation}
                            isLivePresent={ matches.length > 0 && dateFilter === format(new Date(), 'yyyy-MM-dd')}
                            // currentSelectedMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[currentSelectedSport][0].Id !== mainSelectedMarket ? mainSelectedMarket : MARKET_FOR_OUTER_SLIDER[currentSelectedSport][0].Id }
                        /> */}
                </div>
                {/* </div> */}
            </React.Fragment>
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
        // selectedSport: state.inplay.selectedSport,
        selectedLocationList: state.today.selectedLocationList,
        selectedLeagueList: state.today.selectedLeagues,
        selectedSport: state.today.selectedSport,
        mainEvents: state.inplay.mainEvents,
        mainSelectedMarket: state.inplay.mainSelectedMarket,
        noSearchResults: state.inplay.noSearchResults,
        noEvents: state.inplay.noEvents,
        upcomingEvents: state.today.mainEvents,
        hasNextPage: state.inplay.hasNextPage,
        searchStarted: state.inplay.searchStarted,
        searchValue: state.inplay.searchValue,
        language: state.general.language,
        statisticsType: state.lsportsGlobal.statisticsType,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,   
        totalEventCount: state.inplay.totalEventCount,
        lastIndex: state.inplay.lastIndex,
        statsData: state.general.statsData,
        dateFilter: state.today.dateFilter,
        liveMatchesObj: state.inplay.liveMatchesObj,
        partialEvents: state.inplay.partialEvents,
        liveStreamData: state.inplay.liveStreamData,
        liveMatches: state.inplay.liveMatches,
        currentSelectedLeague: state.inplay.locationId,
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
        // selectTodaySport: (sportId) => dispatch(selectSportMobile(sportId)), 
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        searchTodayEvents: (value) => dispatch(searchTodayEvents(value)),
        setCurrentEventCount: (count) => dispatch(setCurrentEventCount(count)),
        setTotalEventCount: (count) => dispatch(setTotalEventCount(count)),
        resetLiveMatches: (payload) => dispatch(resetLiveMatches(payload)),
        getStatsData: () => dispatch(getStatsData()),
        // setInplayLoading: (bool) => dispatch(setInplayLoading(bool)),
        setLiveMatchesObject: (liveMatchesObj) => dispatch(setLiveMatchesObject(liveMatchesObj)),
        setCurrentSelectedSport: (sportId) => dispatch(setCurrentSelectedSport(sportId)),
        setPartialEvents: (events) => dispatch(setPartialEvents(events)),
        removeLiveEvents: () => dispatch(removeLiveEvents()),
        setLiveMatches: (liveMatches) => dispatch(setLiveMatches(liveMatches)),
        setSelectedLocation: (locationId) => dispatch(setSelectedLocation(locationId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
    