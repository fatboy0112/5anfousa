import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import forEach from 'lodash.foreach';
import Util from '../../helper/Util';
import { Translate } from '../../localization';
import Button from '@material-ui/core/Button';
import BetslipList from './BetslipList';
import BetslipSingle from './BetslipSingle';
import ExtraOddsModalLive from './ExtraOddModal';
import ExtraOddsModal from '../Shared/ExtraOddsModal';
import FastBetPopup from './FastBetPopup';
import PlaceBetPopup from './PlaceBetPopup';
import Loading from '../Common/Loading';
import { CountdownComponent } from './CountdownComponent';
import Login from '../Login';
import {
    clearBets,
    checkSavedBets,
    getBetLimits,
    placeBet,
    setPlaceBetError,
    setPlaceBetSuccess,
    setPlaceBetCountdown,
    setLastBetslipId,
    getLastBetslip,
    updateBetslipEventsMarket,
    updateBetslipEventsLivescore,
    updateBetslipEventsStatus,
    placeBetWithOutLoader,
    removeBet,
    setPlaceBetDisabled,
    updateBetslipEvent,
} from '../../store/actions/betslip.actions';
import { selectExtraMarket, setCurrentEvent, setExtraMarkets } from '../../store/actions/lsports.global.actions';
import { isEqual } from 'lodash';
import map from 'lodash.map';
import find from 'lodash.find';
import { API, graphqlOperation } from 'aws-amplify';
import { onUpdateMatchMarkets } from '../../graphql/subscriptions';
import { dynamoClient } from '../../App';
import { getLiveMatchMarkets, getSingleMarketOfEvent, getLiveMatchIds, updatedgetLiveMatchMarkets, getLiveScore } from '../../dynamo/inplayParams';
import { lSportsConfig, maxWebsocketRetryCount } from '../../config';
import { paramsMarketDataIndex } from '../../dynamo/params';

let unsubscribe = {};
let timer;
let liveMatchSub;
let marketSubscription;
let websocket;
let websocketConnectionAttempts = 0;
let liveMatchSubConnectionAttempts = 0;
let liveMatchSubAppSync;
let setTimer;

class Betslip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTabId: this.props.count > 1 ? '2' : '1',
            showExtraOddsModal: false,
            currentEvent: {},
            fastBetChecked: localStorage.getItem('fast_bet') ? (localStorage.getItem('fast_bet') === 'on' ? true : false) : true,
            fastBetOff: false, // off the fast bet switch after placing a bet
            betType: null,
            showFastBetModal: false,
            showPlaceBetModal: false,
            showLogin: false,   
            fixtureIdArray: [],
            liveMatches: {},
        };
    }

    componentDidMount() {
        let { fixtures, getBetLimits } = this.props;
        this.props.checkSavedBets();
        if (fixtures.length) this.getLiveMatches().then(data => this.checkBetsValidity(fixtures, data));
        if (this.isLoggedIn()) {
            getBetLimits();
        }
    }

    componentDidUpdate(prevProps) {
        const { fixtures, count, singleStake, multiStake, canNotBeCombined, userData, setPlaceBetError, getBetLimits, language } = this.props;
        if (prevProps.count !== count) {
            this.setState({ activeTabId: count > 1 ? '2' : '1' });
        }

        if (prevProps.singleStake !== singleStake || prevProps.multiStake !== multiStake) {
            setPlaceBetError(null);
        }

        if (prevProps.canNotBeCombined !== canNotBeCombined) {
            if (!canNotBeCombined) {
                setPlaceBetError(null);
            }
        }

        if (prevProps.userData !== userData) {
            if (this.isLoggedIn()) {
                getBetLimits();
            }
        }

        if(!isEqual(prevProps.fixtures.length, fixtures.length)) {
            this.getLiveMatches().then(data => this.checkBetsValidity(fixtures, data));
        }
    }

    componentWillUnmount() {
        this.props.setPlaceBetCountdown(false);
        this.props.setPlaceBetSuccess(false);
        this.props.setLastBetslipId(false);
        this.unsubscribe();
        clearInterval(setTimer);
    }

    startListener = () => {
        // websocket = new WebSocket(`wss://socket.igamingbook.com/${process.env.REACT_APP_WEBSOCKET_CHANNEL}`);

        // websocket.addEventListener('open', () => {
        //     websocketConnectionAttempts = 0;
        // });

        // websocket.addEventListener('message', (event) => {
        //     this.handleFirebaseUpdates({value: event});
        // });

        // websocket.addEventListener('error', (error) => {
        //     console.warn(error);

        //     if (this.state.isDisconnected) return;  // Network is disconnected
        //     else websocketConnectionAttempts++;     // Network is not disconnected

        //     if (websocketConnectionAttempts < maxWebsocketRetryCount) {
        //         // Retry websocket connection
        //         this.startListener();
        //     } else {
        //         // Open appsync connection
        //         this.startListenerAppSync();
        //     }
        // });

        const fixtures = this.props.fixtures;
        let liveFixtureId = fixtures.filter((f) => f.fixture.fixture_status == 1);
        let fixtureIdArray = [];
        let obj = {};
        let liveObj = {};
        liveFixtureId.map((liveFix) => {
            liveFix.markets.map((mar) => {
                mar.bets.map((bet) => {
                    let id = bet.actualFixtureId.split('^')[0];
                    obj = { ...obj, [bet.actualFixtureId]: { fixture_id: bet.actualFixtureId.toString() } };
                    liveObj = { ...liveObj, [bet.actualFixtureId]: { fixture_id: id.toString() + '^sport_event_status' } };
                });
            });
        });
        if(liveFixtureId.length){
            setTimer = setInterval(() => {
                this.updatedgetSingleMatchMarkets(obj);
                this.setLiveScore(liveObj);
            }, 3000);
        }
    }

    startListenerAppSync = () => {
        const { fixtureIdArray } = this.state;

        forEach(fixtureIdArray, async (fixtureId ) => {
            let marketSubscription = API.graphql(graphqlOperation(onUpdateMatchMarkets(fixtureId)));
            // Now whenever we need to subscribe just call: marketSubscription.subscribe as mentioned below. 
            let unsub = marketSubscription.subscribe({
                next: this.handleFirebaseUpdates,
                error: (error) => console.warn(error),
            });
            unsubscribe[fixtureId] = unsub;

            // Stop receiving data updates from the subscription
            // setTimeout(() => {
            //     unsub.unsubscribe();
            // }, 30000);
        });
    }

    getLiveMatches = async () => {
        try {
            let event =  dynamoClient.scan(getLiveMatchIds()).promise();
            return await event.then(e => {
                let { Items } = e;
                if (Items.length) return Items.map(item => item.fixture_id);
                return []; 
            });
        } catch (err) {
            console.log(err);
        }
    }

    checkBetsValidity = (fixtures, data) => {
        // fixtures = fixtures.filter(f => data.indexOf(f.fixtureId) > -1);
        fixtures = fixtures.filter(f => {
            const { fixture, fixtureId } = f;
            let status = fixture.fixture_status;
            let isEventLive = data && data.indexOf(fixtureId) > -1;
            if ((fixture.fixture_status == lSportsConfig.statuses.inplay && isEventLive) || (fixture.fixture_status != lSportsConfig.statuses.inplay && !isEventLive)) {
                return f;
            }
            status = isEventLive ? lSportsConfig.statuses.inplay : fixture.fixture_status == lSportsConfig.statuses.inplay ? lSportsConfig.statuses.results : lSportsConfig.statuses.prematch;
            this.props.updateBetslipEventsStatus({[f.fixtureId]: {FixtureId: f.fixtureId, Status: status }});
            delete unsubscribe[fixtureId];
        });
        if (fixtures.length > 0) {
            let fixtureIdArray = map(fixtures, (f) => {
                let isLive = f.fixture.fixture_status == lSportsConfig.statuses.inplay;
                this.getSingleMatchMarkets(f.fixtureId, isLive).then(data => {
                    if(data)
                    {
                        let { market, livescore } = data;
                        if (!market && !livescore) return null;
                        if (market) {
                            this.props.updateBetslipEventsMarket({[f.fixtureId]: { FixtureId: f.fixtureId, Market: market }});
                            // update fixture data for prematch bets
                            if(!isLive) this.props.updateBetslipEvent({ FixtureId: f.fixtureId, Market: market });
                        }
                        if (livescore) this.props.updateBetslipEventsLivescore({[f.fixtureId]: { FixtureId: f.fixtureId, Livescore: livescore }});
                    }
                });
                if (isLive) return f.fixtureId;
            });
            fixtureIdArray = fixtureIdArray.filter(f => f);
            this.setState({ fixtureIdArray: fixtureIdArray }, () => {
                this.unsubscribe();
                this.startListener();
            });
        }
    }

    handleFirebaseUpdates = ({value}) => {
        if (!value?.data) return null;

        const { updateBetslipEventsMarket, updateBetslipEventsLivescore, updateBetslipEventsStatus } = this.props;
        let updatedMatch = value.data.onUpdateLiveMarkets || value.data;
        if (typeof(updatedMatch) == 'string') updatedMatch = JSON.parse(updatedMatch);

        let { match_id: fixtureId, outcomes: market, sport_event_status: livescore, fixture_status: status } = updatedMatch;
        if (!market && !livescore && !status) return null;
        market = market ? Util.marketFormatter([updatedMatch], fixtureId) : {};
        updateBetslipEventsMarket({[fixtureId]: { FixtureId: fixtureId, Market: market }});
        if (livescore) {
            livescore = JSON.parse(livescore);
            updateBetslipEventsLivescore({[fixtureId]: { FixtureId: fixtureId, Livescore: livescore }});
        }
        if (status && status == lSportsConfig.statuses.results) {
            delete unsubscribe[fixtureId];
            updateBetslipEventsStatus({[fixtureId]: {FixtureId: fixtureId, Status: status }});
        }
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
                this.subscribeExtraMarket(fixtureId);
            } else {
                // Open appsync connection
                this.subscribeExtraMarketAppSync(fixtureId);
            }
        });

        liveMatchSub.addEventListener('error', (error) => console.warn(error));
    }

    subscribeExtraMarketAppSync = (fixtureId) => {
        marketSubscription = API.graphql(graphqlOperation(onUpdateMatchMarkets(fixtureId)));

        // Now whenever we need to subscribe just call: marketSubscription.subscribe as mentioned below.
        liveMatchSubAppSync = marketSubscription.subscribe({
            next: this.handleExtraMarketUpdates,
            error: (error) => console.warn(error),
        });
    }

    openExtraOddsModalLiveMatch = (fixture, liveStreamAvailable) => {
        this.unsubscribe();
        this.getSingleMatchMarkets(fixture.fixture_id, true).then(data => {
            if(data)
            {
                this.subscribeExtraMarket(fixture.fixture_id);
                const newFixture = {...fixture};
                newFixture.market = data.market;
                newFixture.Markets = {...data.market};
                newFixture.Livescore = data.livescore || {};
                this.setState({ currentEvent: newFixture, liveStreamAvailable: liveStreamAvailable }, () => {
                this.props.setCurrentEvent(newFixture);
                this.setState({ showExtraOddsModal: true });
                });
            }
        });        
    }

    setLiveScore = async (fixtureId) => {
        try {
            let event;
            event = dynamoClient.batchGet(getLiveScore(fixtureId)).promise();
            return await event.then((e) => {
                const { updateBetslipEventsLivescore } = this.props;
                let {
                    Responses: { LiveMarkets },
                } = e;
                LiveMarkets.map((item) => {
                    let { match_id: fixtureId, sport_event_status: livescore, fixture_status: status } = item;
                    if (livescore) {
                        livescore = JSON.parse(livescore);
                        updateBetslipEventsLivescore({ [fixtureId]: { FixtureId: fixtureId, Livescore: livescore } });
                    }
                });
            });
        } catch (err) {
            console.log(err);
        }
    };

    updatedgetSingleMatchMarkets = async (fixtureId) => {
        try {
            let event;
            event = dynamoClient.batchGet(updatedgetLiveMatchMarkets(fixtureId)).promise();
            return await event.then((e) => {
                const { updateBetslipEventsMarket, updateBetslipEventsLivescore, updateBetslipEventsStatus } = this.props;
                let {
                    Responses: { LiveMarkets },
                } = e;
                LiveMarkets.map((item) => {
                    let { match_id: fixtureId, outcomes: market, fixture_status: status } = item;
                    if (!market && !status) return null;
                    market = market ? Util.marketFormatter([item], fixtureId) : {};
                    updateBetslipEventsMarket({ [fixtureId]: { FixtureId: fixtureId, Market: market } });
                    if (status && status == lSportsConfig.statuses.results) {
                        delete unsubscribe[fixtureId];
                        updateBetslipEventsStatus({ [fixtureId]: { FixtureId: fixtureId, Status: status } });
                    }
                });
            });
        } catch (err) {
            console.log(err);
        }
    };

    getSingleMatchMarkets = async (fixtureId, isLive) => {
        try {
            let event;
            if (isLive) {
                event = dynamoClient.query(getLiveMatchMarkets(fixtureId.toString())).promise();
            } else {
                event = dynamoClient.query(paramsMarketDataIndex(fixtureId.toString())).promise();
            }
            return await event.then(e => {
                const { Items } = e;
                let fixture = { market: null, livescore: null, fixture_status: null };
                if (Items.length > 0) {
                    let mktItems = [];
                    forEach(Items, (item) => {
                        // If match is already over Update the status to 3 so it will be removed from UI
                        if (item.fixture_status == lSportsConfig.statuses.results) {
                            this.props.updateBetslipEventsStatus({[item.fixture_id]: {FixtureId: item.fixture_id, Status: item.fixture_status }});
                            return;
                        }

                        if(item.outcomes) {
                            mktItems.push(item);
                        }
                        if(item.sport_event_status) {
                            let livescore = JSON.parse(item.sport_event_status);
                            fixture.livescore = livescore;
                        }
                    });
                    let mrktData = Util.marketFormatter(mktItems, fixtureId);
                    fixture.market = { ...fixture.market, ...mrktData };
                } else {
                    // If not present in any table consider it as finished event.
                    this.props.updateBetslipEventsStatus({[fixtureId]: {FixtureId: fixtureId, Status: lSportsConfig.statuses.results }});
                    delete unsubscribe[fixtureId];
                }
                return fixture || e.Items[0];
            });
        } catch (err) {
            console.log(err);
        }
    }

    getSingleMarketOfMatch = async (fixtureMarketId) => {
        try {
            let event =  dynamoClient.query(getSingleMarketOfEvent(fixtureMarketId.toString())).promise();
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
                        }
                    });
                    let mrktData = Util.marketFormatter(mktItems);
                    fixture.market = { ...fixture.market, ...mrktData };
                }
                return fixture || e.Items[0];
            });
        } catch (err) {
            console.log(err);
        }
    }

    marketDifference = (markets, prevMarkets) =>  {
        return map(markets, (market) => {   
            const { Bets, Id, Name } = market;

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
        if (!updatedMatch) return null;
        // this.handleFirebaseUpdates({value});
        let {currentEvent} = this.state;
        let newFixture = {};

        if (!updatedMatch || !currentEvent || currentEvent.fixture_id != updatedMatch.match_id) {
            return null;
        };

        if(updatedMatch.outcomes){
            let updatedMarket = Util.marketFormatter([updatedMatch], updatedMatch?.match_id);
            let marketValue = updatedMarket && Object.values(updatedMarket)[0];
            if (marketValue?.Bets && currentEvent?.market?.[`id_${marketValue.Id}`]) {
                let currBets = currentEvent.market[`id_${marketValue.Id}`];
                let newBet = marketValue.Bets;
                if (currBets?.Bets) newBet = { ...currBets.Bets, ...newBet };
                updatedMarket[Object.keys(updatedMarket)[0]].Bets = newBet;
            }
            newFixture.market = { ...currentEvent.market, ...updatedMarket };
        }
        else {
            newFixture.market = currentEvent.market;
        }
        if(updatedMatch.sport_event_status){
            newFixture.Livescore = JSON.parse(updatedMatch.sport_event_status);
        }
        else {
            newFixture.Livescore = currentEvent.Livescore;
        }

        // const marketWithDiff1 =  this.marketDifference(newFixture.imp_market, this.state.currentEvent.imp_market);
        const marketWithDiff2 =  this.marketDifference(newFixture.market, this.state.currentEvent.market);
        newFixture.Markets = {...marketWithDiff2};
        newFixture = {...currentEvent, ...newFixture};
        this.props.setCurrentEvent(newFixture);
        this.setState({ currentEvent: newFixture}, () => {this.props.setExtraMarkets(newFixture.Markets)});

    }

    unsubscribe =() => {
        console.log(" *******  Unsubscribe live matches **********")
        if(websocket) websocket.close();
        Object.values(unsubscribe).forEach(e => e.unsubscribe());
        if(liveMatchSub) liveMatchSub.close();
        if(liveMatchSubAppSync) liveMatchSubAppSync.unsubscribe();
        unsubscribe = {};
    }

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    openExtraOddsModal = (fixture) => {
        if(fixture.fixture_status === lSportsConfig.statuses.inplay) {
            this.openExtraOddsModalLiveMatch(fixture);
        }
        else {
            this.setState({ currentEvent: fixture }, () => {
                this.props.setCurrentEvent(fixture);
                this.setState({ showExtraOddsModal: true });
                this.getSingleMatchMarkets(fixture.fixture_id, false).then((data) => {
                    if (data) {
                        const newFixture = { ...fixture };
                        newFixture.market = data.market;
                        newFixture.Markets = { ...data.market };
                        newFixture.Livescore = data.livescore || {};
                        this.setState({ currentEvent: newFixture }, () => {
                            this.props.setCurrentEvent(newFixture);
                            this.setState({ showExtraOddsModal: true });
                        });
                    }
                });
            });
        }
    };

    closeExtraOddsModal = () => {
        if(liveMatchSub) liveMatchSub.close();
        if(liveMatchSubAppSync) liveMatchSubAppSync.unsubscribe();
        this.setState({ showExtraOddsModal: false });
        this.startListener();
    };

    // Change Single/Multiple tabs
    setActiveTab = (e) => {
        this.setState({ activeTabId: e });
    };

    // Remove all bets
    clearBets = (e) => {
        this.props.clearBets();
        this.props.setLastBetslipId(false);
        this.setState({ activeTabId: '1' });
        this.unsubscribe();
    };

    // On Fast bet switch change
    onFastBetChange = (e) => {
        if (this.state.fastBetChecked) {
            this.openFastBetModal();
        } else {
            this.setState({ fastBetChecked: e.target.checked });
            localStorage.setItem('fast_bet', 'on');
        }
    };

    // Set option choosed from popup
    setFastBetOption = (value) => {
        this.setState({ showFastBetModal: false });

        if (value === 'turn-off') {
            this.setState({ fastBetChecked: false });
            localStorage.setItem('fast_bet', 'off');
        }
    };

    // Set option choosed from popup
    setPlaceBetOption = (value) => {
        this.setState({ showPlaceBetModal: false });

        if (value === 'accept-changes') {
            this.setState({
                fastBetChecked: true,
                fastBetOff: true,
            });
            localStorage.setItem('fast_bet', 'on');
        }
    };

    openFastBetModal = () => {
        this.setState({ showFastBetModal: true });
    };

    closeFastBetModal = () => {
        this.setState({ showFastBetModal: false });
    };

    openPlaceBetModal = () => {
        this.setState({ showPlaceBetModal: true });
    };

    closePlaceBetModal = () => {
        this.setState({ showPlaceBetModal: false });
    };

    showLoginForm = (e) => {
        this.setState({ showLogin: true });
    };

    hideLogin = () => {
        this.setState({ showLogin: false });
    };

    clearCountdown = () => {
        if (this.state.fastBetOff) {
            this.setState({ fastBetChecked: false });
            localStorage.setItem('fast_bet', 'off');
        }
    };

    // Get confirmation if fast bet switch is off after user clicks on Place bet button
    placeBetCheck = (type) => {
        this.setState({ betType: type }, () => {
            // if switch is turned off show popup
            if (!this.state.fastBetChecked) {
                this.openPlaceBetModal();
            } else {
                this.placeBet();
            }
        });
    };

    // Place a bet
    placeBet = () => {
        let {
            fixtures,
            limits,
            singleStake,
            multiStake,
            count,
            totalOdds,
            totalMultiOdds,
            canNotBeCombined,
            userData,
            setPlaceBetError,
            placeBet,
            placeBetWithOutLoader,
            placeBetError,
            language,
        } = this.props;
        let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';
        let type = this.state.betType;
        let amount = type === 'single' ? singleStake : multiStake;
        // If user is not logged in
        if (!this.isLoggedIn()) {
            this.setState({ showLogin: true });
            return;
        }

        // If bet cannot be combined
        if (canNotBeCombined) {
            setPlaceBetError(Translate.canNotBeCombined);
            return;
        }

        // If bet is settled or suspended
        let canNotBePlaced = false;
        let canNotBePlacedMessage = '';
        forEach(fixtures, (fixture) => {
            forEach(fixture.markets, (m) => {
                forEach(m.bets, (b) => {
                    if (b.Status !== lSportsConfig.betStatus.active) {
                        canNotBePlaced = true;
                        canNotBePlacedMessage = b.Status === lSportsConfig.betStatus.suspended ? `${Translate.betSuspended} (Bet can not be placed)` : `${Translate.betSettled} (Bet can not be placed)`;
                    }
                });
            });
        });
        if (canNotBePlaced) {
            setPlaceBetError(canNotBePlacedMessage);
            return;
        }

        // If user balance = 0 or user balance < stake amount
        if (userData.balance === 0 || userData.balance < parseFloat(amount)) {
            setPlaceBetError(`${Translate.insufficientBalance}!`);
            return;
        }

        // If stake amount is 0
        if (!parseFloat(amount)) {
            setPlaceBetError(`${Translate.stakeGreaterThen1} 0.`);
            return;
        }

        // Need sport Id for single bet sport wise
        let sportId;
        if (type === 'single') {
            sportId = fixtures[0].fixture.sport_id ? fixtures[0].fixture.sport_id : fixtures[0].fixture.Fixture.Sport.Id;
        }

        // Bet limits
        let limitValidation = Util.betLimitsValidation(limits, type, count, amount, totalOdds, totalMultiOdds, currency, userData, sportId);
        if (limitValidation) {
            setPlaceBetError(limitValidation);
            return;
        }

        let typeId = type === 'single' ? 1 : 2;
        let data = Util.convertToPlaceBetData(fixtures, typeId, amount, language);

        // Check if in next 5 second any bet is getting suspended
        let isChanged = false;
        let betStatus = this.getDiff();
        
        let containsLiveEvent = find(fixtures, (fixture) => {
            if (fixture.fixture.fixture_status !== undefined) return fixture.fixture.fixture_status === lSportsConfig.statuses.inplay
            else return fixture.fixture.Fixture.Status === lSportsConfig.statuses.inplay
        });

        if (containsLiveEvent) {
            this.props.setPlaceBetCountdown(true);
            timer = setTimeout(() => {
                let { fixtures: latestFixtures } = this.props;
                let betStatusAfterTime = this.getDiff();
                isChanged = !isEqual(betStatus, betStatusAfterTime);
                if (isChanged) {
                    // stop processing if bet is suspended/settled in 5 seconds
                    this.props.setPlaceBetCountdown(false); 
                    this.props.setPlaceBetDisabled(false);
                    return;
                }
                else {
                    this.props.setPlaceBetCountdown(false);
                    data = Util.convertToPlaceBetData(latestFixtures, typeId, amount, language);
                    placeBet(data, this.unsubscribe);
                    
                }
            }, 5000);
        }

        // Check if repeated Bet
        placeBetWithOutLoader(data, timer);
    };
    
    getDiff = () => {
        const {fixtures} = this.props;
        let status = [];
        forEach(fixtures, (fixture) => {
            forEach(fixture.markets, (market) => {
                forEach(market.bets, (bet) => {
                    status.push(bet.Status);
                });
            });
        });
        return status;
    }

    replaceSameBets = () => {
        this.props.getLastBetslip(this.props.lastBetId);
    };

    calculateModalOption = () => {
        const { currentEvent } = this.state;
        let isLive = currentEvent.fixture_status !== undefined ? (currentEvent.fixture_status === lSportsConfig.statuses.inplay  ? true : false ) : true;
        return (isLive ? <ExtraOddsModalLive event={currentEvent} liveMatch={currentEvent} closeModal={this.closeExtraOddsModal} /> : <ExtraOddsModal event={currentEvent} closeModal={this.closeExtraOddsModal} />)
    }

    render() {
        let { activeTabId, showExtraOddsModal, currentEvent, fastBetChecked, showFastBetModal, showPlaceBetModal, showLogin, liveMatches } = this.state;
        let { count, placeBetCountdown, betPlacedMessage, lastBetId, betslipLoading, selectExtraMarket, setExtraMarkets, placeBetDisabled } = this.props;
        let tabsHeader =
            count > 0 ? (
                <div className="betslip__header mx-auto">
                    <div className={`betslip__tab ${activeTabId === '1' ? 'betslip__tab_active text-green' : ''}`}>
                        <div id="1" className="betslip__tab-link active">
                            {Translate.single}
                        </div>
                    </div>

                    <div className={`betslip__tab ${activeTabId === '2' ? 'betslip__tab_active text-green' : ''}`}>
                        <div id="2" className="betslip__tab-link">
                            {Translate.multiple}
                        </div>
                    </div>

                    <div className="betslip__delete">
                        <div id="3" className="betslip__tab-link" onClick={this.clearBets}>
                            <i className="icon-trash-1"></i>
                            {/* <img src="./images/trash.png" width="22"></img> */}
                        </div>
                    </div>

                    <div className="betslip__toggle">
                        <div className="mr-1 fastbet">
                            <span className="d-block">{Translate.fastBet}</span>
                            {/* <span className="d-block text-gray"></span> */}
                        </div>
                        <label className="switch">
                            <input type="checkbox" className="switch__input" checked={fastBetChecked} onChange={this.onFastBetChange} />
                            <span className="switch__slider switch__input_round"></span>
                        </label>
                    </div>
                </div>
            ) : (
                <div className="betslip__no-bets-wrap">
                    {lastBetId && (
                        <div className={`betslip__bet-placed ${betPlacedMessage ? 'betslip__bet-placed_active' : ''}`}>
                            <i className="material-icons">check</i>
                            <p className='text-yellow'>
                                <span className="font-weight-bold">Bet</span> Placed
                            </p>
                        </div>
                    )}

                    <div className={`betslip__placeholder ${betPlacedMessage ? 'betslip__placeholder_hidden' : ''}`}>
                        <div className="no-data__img">
                            <img src="./images/no-odds.png" alt="No data" />
                        </div>
                        {lastBetId && (
                            <Button variant="contained" className="betslip__same-bet" type="button" onClick={this.replaceSameBets}>
                                { Translate.repeatBet }
                            </Button>
                        )}
                    </div>
                </div>
            );

        return (
            <div className="main-container bg-f7">
                {tabsHeader}
                {activeTabId === '1' && (
                    <BetslipSingle setExtraMarkets={setExtraMarkets} selectExtraMarket={selectExtraMarket} openExtraOddsModal={this.openExtraOddsModal} placeBetCheck={this.placeBetCheck} showCountdown={placeBetCountdown} placeBetDisableFromAdmin={placeBetDisabled} />
                )}
                {activeTabId === '2' && (
                    <BetslipList
                        setExtraMarkets={setExtraMarkets}
                        selectExtraMarket={selectExtraMarket}
                        switchBetslipType={this.setActiveTab}
                        openExtraOddsModal={this.openExtraOddsModal}
                        placeBetCheck={this.placeBetCheck}
                        showCountdown={placeBetCountdown}
                        placeBetDisableFromAdmin={placeBetDisabled}
                    />
                )}

                {showExtraOddsModal && this.calculateModalOption()}

                {showFastBetModal && <FastBetPopup closeModal={this.closeFastBetModal} setFastBetOption={this.setFastBetOption} />}

                {showPlaceBetModal && <PlaceBetPopup closeModal={this.closePlaceBetModal} setPlaceBetOption={this.setPlaceBetOption} />}

                {placeBetCountdown && (
                    <div className="betslip__countdown-overlay">
                        <CountdownComponent clearCountdown={this.clearCountdown} placeBetCountdown={placeBetCountdown} />
                    </div>
                )}

                {betslipLoading && <Loading customClass='betslip-loader' />}

                {showLogin && <Login hideLogin={this.hideLogin} />}
            </div>
        );
    }
}

Betslip.propTypes = {
    count: PropTypes.number,
    language: PropTypes.string,
    clearBets: PropTypes.func,
    setCurrentEvent: PropTypes.func,
    checkSavedBets: PropTypes.func,
    placeBet: PropTypes.func,
    placeBetWithOutLoader: PropTypes.func,
    multiStake: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    singleStake: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fixtures: PropTypes.array,
    userData: PropTypes.object,
    setPlaceBetError: PropTypes.func,
    setPlaceBetSuccess: PropTypes.func,
    setPlaceBetCountdown: PropTypes.func,
    getBetLimits: PropTypes.func,
    placeBetError: PropTypes.string,
    placeBetSuccess: PropTypes.bool,
    placeBetCountdown: PropTypes.bool,
    betPlacedMessage: PropTypes.bool,
    canNotBeCombined: PropTypes.bool,
    betslipLoading: PropTypes.bool,
    limits: PropTypes.object,
    totalOdds: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalMultiOdds: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lastBetId: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
};

const mapStateToProps = (state) => {
    return {
        count: state.betslip.count,
        language: state.general.language,
        multiStake: state.betslip.multiStake,
        singleStake: state.betslip.singleStake,
        fixtures: state.betslip.fixtures,
        userData: state.user.data,
        placeBetError: state.betslip.placeBetError,
        placeBetSuccess: state.betslip.placeBetSuccess,
        placeBetCountdown: state.betslip.placeBetCountdown,
        betPlacedMessage: state.betslip.betPlacedMessage,
        canNotBeCombined: state.betslip.canNotBeCombined,
        limits: state.betslip.limits,
        totalOdds: state.betslip.totalOdds,
        totalMultiOdds: state.betslip.totalMultiOdds,
        lastBetId: state.betslip.lastBetId,
        betslipLoading: state.betslip.betslipLoading,
        placeBetDisabled: state.betslip.placeBetDisabled,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearBets: () => dispatch(clearBets()),
        setCurrentEvent: (event) => dispatch(setCurrentEvent(event)),
        checkSavedBets: () => dispatch(checkSavedBets()),
        placeBet: (data, unsubscribe) => dispatch(placeBet(data, unsubscribe)),
        placeBetWithOutLoader: (data, timer) => dispatch(placeBetWithOutLoader(data, timer)),
        setPlaceBetError: (error) => dispatch(setPlaceBetError(error)),
        setPlaceBetSuccess: (value) => dispatch(setPlaceBetSuccess(value)),
        setPlaceBetCountdown: (value) => dispatch(setPlaceBetCountdown(value)),
        setLastBetslipId: (value) => dispatch(setLastBetslipId(value)),
        getBetLimits: () => dispatch(getBetLimits()),
        getLastBetslip: (id) => dispatch(getLastBetslip(id)),
        updateBetslipEventsMarket: (events) => dispatch(updateBetslipEventsMarket(events)),
        updateBetslipEventsLivescore: (events) => dispatch(updateBetslipEventsLivescore(events)),
        removeBet: (fixture, market, bet, provider) => dispatch(removeBet(fixture, market, bet, provider)),
        setPlaceBetDisabled: (value) => dispatch(setPlaceBetDisabled(value)),
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        selectExtraMarket: (type) => dispatch(selectExtraMarket(type)),
        updateBetslipEventsStatus: (events) => dispatch(updateBetslipEventsStatus(events)),
        updateBetslipEvent: (event) => dispatch(updateBetslipEvent(event)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Betslip);