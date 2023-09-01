import React, { Component } from 'react';
import { connect } from 'react-redux';
import filter from 'lodash.filter';
import Matches from './Matches';
import ExtraOddsModal from '../Shared/ExtraOddsModal';
import LiveExtraOddsModal from '../Inplay/ExtraOddsModal';
import StatisticsModal from '../../Components/Shared/StatisticsModal';
import Loading from '../../Components/Common/NewLoading';
import { setCurrentEvent, clearStatistics, setStatistics, setExtraMarkets, selectExtraMarket } from '../../store/actions/lsports.global.actions';
import { getFavorites } from '../../store/actions/favorites.actions';
import { getStatsData } from '../../store/actions/general.actions';
import { find, forEach, isEmpty, isEqual } from 'lodash';
import { map, sortBy } from 'lodash';
import LiveStreamModal from '../../Components/Shared/LiveStramModal';
import jwtService from '../../services/jwtService';
import Util from '../../helper/Util';
import { onUpdateMatchMarkets } from '../../graphql/subscriptions';
import API, { graphqlOperation } from '@aws-amplify/api';
import { dynamoClient } from '../../App';
import { getLiveMatchMarkets } from '../../dynamo/inplayParams';
import { lSportsConfig, maxWebsocketRetryCount } from '../../config';
import { MARKET_FOR_OUTER_SLIDER_PREMATCH } from '../../config/markets';
import MarketHeader from '../Shared/MarketHeader';
import TopLinks from '../TopLinks';
import Betslip from '../Betslip';
import { staticPrematchSports } from '../../config/sports';
import { setDateFilter, selectSportMobile } from '../../store/actions/todayActions';


let unSub = {};
let liveMatchSub;
let marketSubscription;
let websocket;
let websocketConnectionAttempts = 0;
let liveMatchSubConnectionAttempts = 0;
let liveMatchSubAppSync;

class Favorites extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showNonLiveExtraOddsModal: false,
            showLiveExtraOddsModal: false,
            event: {},
            showStatisticsModalForNonLive: false,
            showStatisticsModalForLive: false,
            loading: false,
            liveMatches: {},
            nonLiveMatches: {},
            showLiveStream: false,
            liveStreamFixtureId : null,
            liveStreamData: [],
            liveStreamUrl: null,
            expandTable: false,
        };
    }

    componentDidMount() {
        this.setState({ loading: true });
        if (!this.props.loadingFavorites) this.props.getFavorites();
       // this.fetchLiveStreamMatches();
        // if (!this.props.statsData) this.props.getStatsData();
        const matchesByStatus = this.groupMatchesByStatus();
        if (!matchesByStatus) return;
        this.setState({
            liveMatches: matchesByStatus['live'],
            nonLiveMatches: matchesByStatus['nonLive'],
            loading: false,
        }, () => {
            this.subscribeEvents(matchesByStatus['live']);
        });
    }
    
    componentDidUpdate(prevProps, prevState) {
        let { favorites, favoritesLiveMatches, dateFilter, selectedSport} = this.props;
        favorites = [...favorites , ...favoritesLiveMatches];
        let preFav = [ ...prevProps.favorites, ...prevProps.favoritesLiveMatches];
        if (!isEqual(preFav, favorites) || !isEqual(prevProps.dateFilter, dateFilter) || !isEqual(prevProps.selectedSport, selectedSport)) {
            const matchesByStatus = this.groupMatchesByStatus();
            if (!matchesByStatus) return;
            this.setState({
                liveMatches: matchesByStatus['live'],
                nonLiveMatches: matchesByStatus['nonLive'],
                loading: false,
            }, () => {
                this.subscribeEvents(matchesByStatus['live']);
            });
        }
    }

    componentWillUnmount() {
        this.unsubscribeEvents();
        this.props.selectSportMobile(1);
        //this.props.setDateFilter(format(new Date(), 'yyyy-MM-dd'));
    }
    
    groupMatchesByStatus = () => {
        let { favorites, favoritesLiveMatches, selectedSport, dateFilter } = this.props;
        favorites = [...favorites , ...favoritesLiveMatches];
        if(!favorites) return;
        // const events = favorites;
        
        // if (!events) return;
        
        const matchesByStatus = {
            'live': {},
            'nonLive': {},
        };
        if (dateFilter && false) { }
        else favorites = favorites.filter(fixture => fixture.sport_id == selectedSport);
        favorites.forEach((item) => {
            if (item.fixture_status === 1) {
                matchesByStatus['live'][item.fixture_id] = item;
            } 
            else {
                matchesByStatus['nonLive'][item.fixture_id] = item;
            }
        });
        return matchesByStatus;
    };

    subscribeEvents = (liveMatches) => {
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
                this.subscribeEvents(liveMatches);
            } else {
                // Open appsync connection
                this.subscribeEventsAppSync(liveMatches);
            }
        });
    };

    subscribeEventsAppSync = (liveMatches) => {
        if (isEmpty(liveMatches)) return;
        this.unsubscribeEvents();
        forEach( liveMatches, item => {
            let marketSubscription = API.graphql(graphqlOperation(onUpdateMatchMarkets(item.fixture_id))); 
    
            unSub[item.fixture_id] = marketSubscription.subscribe({
                next: this.handleFirebaseUpdates,
                error: (error) => console.warn(error),
            });
        });
    }

    handleFirebaseUpdates = ({value}) => {
        if (!value?.data) return null;

        let updatedMatch = value.data.onUpdateLiveMarkets || value.data;
        if (typeof(updatedMatch) == 'string') updatedMatch = JSON.parse(updatedMatch);
        if (!updatedMatch) return null;

        let { liveMatches } = this.state;
        if (!liveMatches[updatedMatch.match_id]) return null;

        let { match_id: fixtureId, outcomes: market, sport_event_status: livescore, fixture_status: status } = updatedMatch;
        if (!market && !livescore && !status) return null;

        const id = fixtureId;
        if (status == lSportsConfig.statuses.results && liveMatches[id]) {
            delete unSub[id];
            delete liveMatches[id];
            return this.setState({liveMatches});
        }

        const { liveMatches: { [id]: oldMatches } } = this.state;
         if (!oldMatches) {
        // TODO: Add the match in the list
            return;
        };

        market = market && Util.marketFormatter([updatedMatch], fixtureId);
        if (livescore) {
            livescore = JSON.parse(livescore);
            this.setState({
                liveMatches: {
                    ...this.state.liveMatches,
                    [id]: { ...oldMatches, Livescore: livescore, fixture_status: +status },
                },
            });
            return;
        }
        
        if (!market) {
            this.setState({
                liveMatches: {
                    ...this.state.liveMatches,
                    [id]: {...oldMatches},
                },
            });
            return;
        };

        const marketWithDiff = (() => {   
            const { Bets, Id } = market;
            //console.log(Bets);  
            const oldMarket = find(oldMatches.Markets, (mar) => mar.Id === Id);
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
                ...oldMatches,
                ...market,
                Bets: updatedBetsWithDiff,
            };
        })();
        this.setState({
            liveMatches: {
                ...this.state.liveMatches,
                [id]: { ...oldMatches, market: { ...oldMatches.market, ...marketWithDiff} },
            },
        });
}

    unsubscribeEvents = () => {
        Object.values(unSub).forEach(element => element.unsubscribe());
        // (let e in Object.values(unSub)) {
        //     unSub[e].unsubscribe();
        // }
        if(websocket) websocket.close();
    };

    unsubscribeSingleEvents = (id) => {
        //     unSub[id]();
        // console.log(`***** UnSubscribed fixture Id: ${id} *****`);
        
        //liveMatchSub && liveMatchSub();
        //console.log("***** UnSubscribed all live matches. *****");
    };

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
        this.unsubscribeEvents();
        let newFixture = fixture;
        this.getSingleMatchMarkets(fixture.fixture_id).then(data => {
            if(data)
            {
                this.subscribeExtraMarket(fixture.fixture_id);
                newFixture.market = data.market;
                newFixture.Markets = { ...data.market};
                newFixture.Livescore = data.Livescore;
                
                this.setState({ event: newFixture, liveStreamAvailable: liveStreamAvailable }, () => {
                this.props.setCurrentEvent(newFixture);
                this.setState({ showLiveExtraOddsModal: true });
                
                
                // const collection = this.props.language === `en`? `d_event` : `d_event_${this.props.language}`;
                // unSub.push(firebaseDB.collection(collection).doc(`${fixture.FixtureId}`).onSnapshot(this.handleFirebaseUpdates));
                });
            }
        });
    }

    getSingleMatchMarkets = async (fixtureId, nextToken, fixture) => {
        try {
            let event =  dynamoClient.query(getLiveMatchMarkets(fixtureId.toString(), nextToken)).promise();
            return await event.then(e => {
                const { Items } = e;
                if (!fixture) fixture = { market: null, livescore: null, fixture_status: null };
                if (Items.length > 0) {
                    forEach(Items, (item) => {
                        if(item.market) {
                            let mrktData = JSON.parse(item.market);
                            fixture.market = { ...fixture.market, ...mrktData };
                        }
                        if(item.livescore) {
                            let livescore = JSON.parse(item.livescore);
                            fixture.Livescore = livescore;
                        }
                    });
                }
                return fixture || e.Items[0];
            });
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

    handleExtraMarketUpdates = ({value}) => {
        if (!value?.data) return null;

        let updatedMatch = value.data.onUpdateLiveMarkets || value.data;
        if (typeof(updatedMatch) == 'string') updatedMatch = JSON.parse(updatedMatch);
        if (!updatedMatch) return null;
        let { event } = this.state;
        let newFixture = {};
        if (!updatedMatch || !event || event.fixture_id != updatedMatch.match_id) return null;

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
        else if(updatedMatch.livescore){
            newFixture.Livescore = JSON.parse(updatedMatch.livescore);
        }
        else {
            newFixture.Livescore = event.Livescore;
        }

        const marketWithDiff2 =  this.marketDifference(newFixture.market, this.state.event.market);

        newFixture.Markets = { ...marketWithDiff2 };
        newFixture = {...event, ...newFixture};
        this.props.setCurrentEvent(newFixture);
        this.setState({ event: newFixture}, () => {this.props.setExtraMarkets(newFixture.Markets);});

    }

    openExtraOddsModal = (fixture, liveStreamAvailable) => {
        // TODO: add the same logic from the Live Page
        
        let liveStatus = fixture.fixture_status;
        this.setState({ event: fixture }, () => {
            if (liveStatus === 2) {
                // this.unsubscribeEvents();
                // this.setState({  });
                this.openExtraOddsModalLiveMatch(fixture, liveStreamAvailable);
                // const collection = this.props.language === `en` ? `d_event` : `d_event_${this.props.language}`;
                // unSub[fixture.FixtureId] = (firebaseDB.collection(collection).doc(`${fixture.FixtureId}`).onSnapshot(this.handleFirebaseUpdates));

            } else {
                this.setState({ showNonLiveExtraOddsModal: true });
            }
            this.props.setCurrentEvent(fixture);
        });
    };

    closeExtraOddsModal = () => {
        const matchesByStatus = this.groupMatchesByStatus();
        if(liveMatchSub) liveMatchSub.close();
        if(liveMatchSubAppSync) liveMatchSubAppSync.unsubscribe();
        this.setState({ showNonLiveExtraOddsModal: false, showLiveExtraOddsModal: false  }, () => {
            this.subscribeEvents(matchesByStatus['live']);
        });
    };

    openStatisticsModal = (fixture) => {
        let isLive = fixture.fixture_status === 2 ? true : false;
        let id = fixture.fixture_id;
        //let statsTemplateType = !isLive ? 'prematch' : 'live';
        if (isLive) this.setState({ showStatisticsModalForLive: true });
        else this.setState({ showStatisticsModalForNonLive: true }); 
        this.props.setStatistics(id, 'forMatch', (isLive ? 'live' : 'prematch'));
    };

    closeStatisticsModal = () => {
        this.setState({ showStatisticsModalForNonLive: false, showStatisticsModalForLive: false });
        this.props.clearStatistics();
    };

    openLiveStreamModal = (streamURL) => {
        this.unsubscribeEvents();
        this.setState({ liveStreamUrl : streamURL }, () => this.setState({ showLiveStream: true }));
    }

    closeLiveStreamModal = () => {
        const matchesByStatus = this.groupMatchesByStatus();
        this.unsubscribeEvents();
        this.subscribeEvents(matchesByStatus['live']);
        this.setState({ liveStreamUrl : null, showLiveStream: false });
    }

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
            showNonLiveExtraOddsModal,
            showLiveExtraOddsModal,
            event,
            showStatisticsModalForNonLive,
            loading,
            liveMatches,
            nonLiveMatches,
            showStatisticsModalForLive,
            showLiveStream,
            liveStreamUrl,
            liveStreamData,
        } = this.state;
        let { favorites, loadingFavorites, statisticsType, selectExtraMarket, setExtraMarkets, favoritesLiveMatches, selectedSport } = this.props;
        favorites = [ ...favorites , ...favoritesLiveMatches];
        let favoritesList, liveFavoritesList = null;
        let matchForModal = {};
        let liveMatchesLength = Object.keys(liveMatches).length;
        let nonLiveMatchesLength = Object.keys(nonLiveMatches).length;
        let filteredLiveMatches = filter(liveMatches, (match) => { return !!match.fixture_id; });
        // Filter out the single match for extraOddsModal
        if (showLiveExtraOddsModal) {
            let items = filteredLiveMatches;
            for (let sportId in items) {
                if (!items.hasOwnProperty(sportId)) continue;
                
                if (event.FixtureId === items[sportId].FixtureId) {
                    matchForModal = items[sportId];
                }
            }
        }
        if (favorites && favorites.length > 0) {
            let incompleteList = filter(favorites, (f) => !f.fixture_id);
           // console.log(">>>>>>>>>>> Incomlete length >>>", filteredLiveMatches)
            if (incompleteList.length === 0) {
                //loading = false;
                favoritesList =
                    nonLiveMatchesLength > 0 ? (
                        <React.Fragment>
                            <Matches liveStreamData={this.state.liveStreamData} selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} events={nonLiveMatches} openMarketsModal={this.openExtraOddsModal} openStatisticsModal={this.openStatisticsModal} />

                            {showNonLiveExtraOddsModal && (
                                <ExtraOddsModal event={event} closeModal={this.closeExtraOddsModal} openStatisticsModal={this.openStatisticsModal} />
                            )}

                            {showStatisticsModalForNonLive && statisticsType === 'forMatch' && <StatisticsModal closeModal={this.closeStatisticsModal} />}
                        </React.Fragment>
                    ) : null;
               liveFavoritesList = 
                    liveMatchesLength > 0 ? (
                        <React.Fragment>
                            <Matches liveStreamData={this.state.liveStreamData}  selectExtraMarket={selectExtraMarket} setExtraMarkets={setExtraMarkets} events={filteredLiveMatches} openMarketsModal={this.openExtraOddsModal} openStatisticsModal={this.openStatisticsModal} unsubscribeSingleEvents={this.unsubscribeSingleEvents} openLiveStreamModal={this.openLiveStreamModal} />
                        
                            {showLiveExtraOddsModal && (
                                <LiveExtraOddsModal liveMatchURL= {find(this.state.liveStreamData,(e) => e.matchId == event.fixture_id)?.iframe} liveStreamAvailable={this.state.liveStreamAvailable} event={event} closeModal={this.closeExtraOddsModal} openStatisticsModal={this.openStatisticsModal} liveMatch={event} liveStreamData={liveStreamData}/>
                            )}
                            {showLiveStream  && <LiveStreamModal closeModal={this.closeLiveStreamModal} liveStreamMatch={liveStreamUrl} />}
                            {showStatisticsModalForLive && statisticsType === 'forMatch' && <StatisticsModal closeModal={this.closeStatisticsModal} />}
                        </React.Fragment>
                    ) : null;                
            }
        }

        let drawFavorites =
            loadingFavorites || loading ? <Loading customClass='odds-panel w-100'/> :
            favorites && favorites.length > 0 && (liveMatchesLength > 0 || nonLiveMatchesLength > 0) ? (
                <>
                    {liveFavoritesList}
                    {favoritesList}
                </>
            ) : (
                <tbody>
                    <tr>
                        <td colSpan='9'>
                            <div className='no-data fs-15 pt-3 pl-3 pb-3'>
                                No favorites added
                            </div>
                        </td>
                    </tr>
                </tbody>
            );
        
        let sportsList = Object.values(staticPrematchSports()).filter(sport => !sport.k_sport && !sport.e_sport);
        sportsList = sortBy(sportsList, ['sort']);
        return <React.Fragment>
            <TopLinks sports={ sportsList }/>            
            <div className="middle-part sport-middle d-flex">
                <div id='side-navbar' className="side-navbar fade1 expand-nav">
                    <nav className="side-multilevel">
                        <div id='item-search' style={{ height: '45px' }}/>
                        {/* <TopLeague /> */}
                        <div id='location-filter' className='' />
                    </nav>
                </div>
                <div id="scrollableDiv" className = "odds-panel mid-expand" >
                    <div className="table-responsive">
                        <a className='drawer' href>
                            <i className="icon-color" >
                                <img src="/images/rounded.svg" className='w-75' alt="rounded" />
                            </i>
                            {<span className='ml-3'>{staticPrematchSports()[selectedSport]?.name}</span>}
                        </a>
                        <table className='table mb-0'>
                            <thead>
                                <tr >
                                    <th scope="col">&nbsp;</th>
                                    <th scope="col">&nbsp;</th>
                                    <th scope="col">&nbsp;</th>
                                    <th scope="col">&nbsp;</th>
                                    <MarketHeader mainMarket={MARKET_FOR_OUTER_SLIDER_PREMATCH[selectedSport]} />
                                    <th scope="col">&nbsp;</th>
                                </tr>
                            </thead>
                            {drawFavorites}
                        </table>
                    </div>
                </div>
                <Betslip />
            </div>
        </React.Fragment>;
    }
}


const mapStateToProps = (state) => {
    return {
        favorites: state.favorites.favorites,
        favoritesLiveMatches: state.favorites.favoritesLiveMatches,
        loadingFavorites: state.favorites.loadingFavorites,
        statisticsType: state.lsportsGlobal.statisticsType,
        language: state.general.language,
        statsData: state.general.statsData,
        selectedSport: state.today.selectedSport,
        dateFilter: state.today.dateFilter,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setDateFilter: (value) => dispatch(setDateFilter(value)),
        selectSportMobile: (sportId) => dispatch(selectSportMobile(sportId, true)),
        setCurrentEvent: (event) => dispatch(setCurrentEvent(event)),
        getFavorites: () => dispatch(getFavorites()),
        clearStatistics: () => dispatch(clearStatistics()),
        setExtraMarkets: (market) => dispatch(setExtraMarkets(market)),
        selectExtraMarket: (marketName) => dispatch(selectExtraMarket(marketName)),
        setStatistics: (fixtureId, statsType, statsTemplateType) => dispatch(setStatistics(fixtureId, statsType, statsTemplateType)),
        getStatsData: () => dispatch(getStatsData())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Favorites);
