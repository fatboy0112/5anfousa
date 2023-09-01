import React, { Component } from 'react';
import PropTypes from 'prop-types';
import forEach from 'lodash.foreach';
import find from 'lodash.find';
import flattenDepth from 'lodash.flattendepth';
import { connect } from 'react-redux';
import { updateInplayEventsMarket, updateInplayEventsLivescore, updateInplayEventsStatus } from '../store/actions/inplayActions';
import { updatePrematchEventsMarket, updatePrematchEventsLivescore, updatePrematchEventsStatus } from '../store/actions/prematchActions';
import { updateLastMinuteEventsMarket, updateLastMinuteEventsStatus } from '../store/actions/lastMinuteActions';
import { updateTodayEventsMarket, updateTodayEventsStatus } from '../store/actions/todayActions';
import { updateHomeEventsMarket, updateHomeEventsStatus } from '../store/actions/home.actions';
import { updateExtraMarketsEventsMarket, updateExtraMarketsEventsLivescore } from '../store/actions/lsports.global.actions';
import { updateBetslipEventsMarket, updateBetslipEventsLivescore, updateBetslipEventsStatus } from '../store/actions/betslip.actions';
import { updateFavoritesEventsMarket, updateFavoritesEventsLivescore, updateFavoritesEventsStatus } from '../store/actions/favorites.actions';

class LsportsAMQ extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ws: null,
        };
    }

    componentDidMount() {
        this.connect();
    }

    timeout = 250;

    connect = () => {
        var ws = new WebSocket('wss://shop.turksbet.com/ws/socket.io/');
        // cache the this
        let that = this;
        var connectInterval;

        // websocket onopen event listener
        ws.onopen = () => {
            console.log('******CONNECTED LSPORTS SOCKET******');
            this.setState({ ws: ws });
            // reset timer to 250 on open of websocket connection
            that.timeout = 250;
            // clear Interval on on open of websocket connection
            clearTimeout(connectInterval);
        };

        // websocket onclose event listener
        ws.onclose = (e) => {
            console.log(
                `******CLOSED LSPORTS SOCKET******. Reconnect will be attempted in ${Math.min(10000 / 1000, (that.timeout + that.timeout) / 1000)} second.`,
                e.reason,
            );
            //increment retry interval
            that.timeout = that.timeout + that.timeout;
            //call check function after timeout
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout));
            ws.close();
        };

        // websocket onerror event listener
        ws.onerror = (err) => {
            console.error('******ERROR LSPORTS SOCKET******', err.message);
            ws.close();
        };

        ws.onmessage = function (e) {
            const data = JSON.parse(e.data);
            if (data.type === 'market.delta') {
                let messageType = JSON.parse(data.content).Header.Type;
                if (messageType === 2) {
                    // Livescore update
                } else if (messageType === 3) {
                    // Market update
                } else if (messageType === 1) {
                    // Fixture metadata update
                } else if (messageType === 7) {
                    // Markets
                } else if (messageType === 0) {
                    // Full event
                }

                let new_events = JSON.parse(data.content).Body.Events;
                let {
                    mainEventsInplay,
                    mainFilteredEventsInplay,
                    mainEventsPrematch,
                    mainEventsLastMinute,
                    mainFilteredEventsLastMinute,
                    mainEventsToday,
                    mainFilteredEventsToday,
                    mainEventsHome,
                    extraMarkets,
                    extraMarketEvent,
                    betslipEvents,
                    favorites,
                } = that.props;
                let inplayEvents = mainFilteredEventsInplay.length > 0 ? mainFilteredEventsInplay : mainEventsInplay;
                let lastMinuteEvents = mainFilteredEventsLastMinute.length > 0 ? mainFilteredEventsLastMinute : mainEventsLastMinute;
                let todayEvents = mainFilteredEventsToday.length > 0 ? mainFilteredEventsToday : mainEventsToday;

                // update Betslip events
                if (betslipEvents.length > 0) {
                    forEach(new_events, (event) => {
                        let changed_fixture = find(betslipEvents, { fixtureId: event.FixtureId });

                        if (changed_fixture) {
                            let new_markets = event.Markets;
                            let old_markets = Object.values(changed_fixture.markets);

                            let new_livescore = event.Livescore;

                            // Market update
                            if (new_markets) {
                                forEach(new_markets, (market) => {
                                    let changed_market = find(old_markets, { Id: market.Id });

                                    if (changed_market) {
                                        that.props.updateBetslipEventsMarket(new_events);
                                    }
                                });
                            }

                            // Livescore update
                            if (new_livescore) {
                                that.props.updateBetslipEventsLivescore(new_events);
                            }

                            // Fixture metadata update
                            if (messageType === 1) {
                                let new_status = event.Fixture && event.Fixture.Status;
                                if (new_status) {
                                    that.props.updateBetslipEventsStatus(new_events);
                                }
                            }
                        }
                    });
                }

                // update Inplay events
                if (inplayEvents.length > 0) {
                    forEach(new_events, (event) => {
                        let changed_fixture = find(inplayEvents, { fixture_id: event.FixtureId });

                        if (changed_fixture) {
                            let new_markets = event.Markets;
                            let old_markets = Object.values(changed_fixture.market);

                            let new_livescore = event.Livescore;

                            // Market update
                            if (new_markets) {
                                forEach(new_markets, (market) => {
                                    let changed_market = find(old_markets, { Id: market.Id });

                                    if (changed_market) {
                                        that.props.updateInplayEventsMarket(new_events);
                                    }
                                });
                            }

                            // Livescore update
                            if (new_livescore) {
                                that.props.updateInplayEventsLivescore(new_events);
                            }

                            // Fixture metadata update
                            if (messageType === 1) {
                                let new_status = event.Fixture && event.Fixture.Status;
                                if (new_status) {
                                    that.props.updateInplayEventsStatus(new_events);
                                }
                            }
                        }
                    });
                }

                // update Prematch events
                if (mainEventsPrematch.length > 0) {
                    forEach(new_events, (event) => {
                        let changed_fixture = find(mainEventsPrematch, { fixture_id: event.FixtureId });

                        if (changed_fixture) {
                            let new_markets = event.Markets;
                            let old_markets = Object.values(changed_fixture.market);

                            let new_livescore = event.Livescore;

                            // Market update
                            if (new_markets) {
                                forEach(new_markets, (market) => {
                                    let changed_market = find(old_markets, { Id: market.Id });

                                    if (changed_market) {
                                        that.props.updatePrematchEventsMarket(new_events);
                                    }
                                });
                            }

                            // Livescore update
                            if (new_livescore) {
                                that.props.updatePrematchEventsLivescore(new_events);
                            }

                            // Fixture metadata update
                            if (messageType === 1) {
                                let new_status = event.Fixture && event.Fixture.Status;
                                if (new_status) {
                                    that.props.updatePrematchEventsStatus(new_events);
                                }
                            }
                        }
                    });
                }

                // update Last Minute events
                if (lastMinuteEvents.length > 0) {
                    forEach(new_events, (event) => {
                        let changed_fixture = find(lastMinuteEvents, { fixture_id: event.FixtureId });

                        if (changed_fixture) {
                            let new_markets = event.Markets;
                            let old_markets = Object.values(changed_fixture.market);

                            // Market update
                            if (new_markets) {
                                forEach(new_markets, (market) => {
                                    let changed_market = find(old_markets, { Id: market.Id });

                                    if (changed_market) {
                                        that.props.updateLastMinuteEventsMarket(new_events);
                                    }
                                });
                            }

                            // Fixture metadata update
                            if (messageType === 1) {
                                let new_status = event.Fixture && event.Fixture.Status;
                                if (new_status) {
                                    that.props.updateLastMinuteEventsStatus(new_events);
                                }
                            }
                        }
                    });
                }

                // update Today events
                if (todayEvents.length > 0) {
                    forEach(new_events, (event) => {
                        let changed_fixture = find(todayEvents, { fixture_id: event.FixtureId });

                        if (changed_fixture) {
                            let new_markets = event.Markets;
                            let old_markets = Object.values(changed_fixture.market);

                            // Market update
                            if (new_markets) {
                                forEach(new_markets, (market) => {
                                    let changed_market = find(old_markets, { Id: market.Id });

                                    if (changed_market) {
                                        that.props.updateTodayEventsMarket(new_events);
                                    }
                                });
                            }

                            // Fixture metadata update
                            if (messageType === 1) {
                                let new_status = event.Fixture && event.Fixture.Status;
                                if (new_status) {
                                    that.props.updateTodayEventsStatus(new_events);
                                }
                            }
                        }
                    });
                }

                // update Home events
                if (mainEventsHome.length > 0) {
                    forEach(new_events, (event) => {
                        let changed_fixture = find(mainEventsHome, { fixture_id: event.FixtureId });

                        if (changed_fixture) {
                            let new_markets = event.Markets;
                            let old_markets = Object.values(changed_fixture.market);

                            // Market update
                            if (new_markets) {
                                forEach(new_markets, (market) => {
                                    let changed_market = find(old_markets, { Id: market.Id });

                                    if (changed_market) {
                                        that.props.updateHomeEventsMarket(new_events);
                                    }
                                });
                            }

                            // Fixture metadata update
                            if (messageType === 1) {
                                let new_status = event.Fixture && event.Fixture.Status;
                                if (new_status) {
                                    that.props.updateHomeEventsStatus(new_events);
                                }
                            }
                        }
                    });
                }

                // update Extra markets
                if (Object.keys(extraMarkets).length > 0) {
                    forEach(new_events, (event) => {
                        let changed_fixture = extraMarketEvent.fixture_id === event.FixtureId ? true : false;

                        if (changed_fixture) {
                            let new_markets = event.Markets;
                            let old_markets = Object.values(extraMarkets);
                            let old_markets_flattened = flattenDepth(old_markets, 2);

                            let new_livescore = event.Livescore;

                            if (new_markets) {
                                forEach(new_markets, (market) => {
                                    let changed_market = find(old_markets_flattened, { Id: market.Id });

                                    if (changed_market) {
                                        that.props.updateExtraMarketsEventsMarket(new_events);
                                    }
                                });
                            }

                            if (new_livescore) {
                                that.props.updateExtraMarketsEventsLivescore(new_events);
                            }
                        }
                    });
                }

                // update Favorites events
                if (favorites.length > 0) {
                    forEach(new_events, (event) => {
                        let changed_fixture = find(favorites, { fixture_id: event.FixtureId });

                        if (changed_fixture) {
                            let new_markets = event.Markets;
                            let old_markets = Object.values(changed_fixture.market);

                            let new_livescore = event.Livescore;

                            // Market update
                            if (new_markets) {
                                forEach(new_markets, (market) => {
                                    let changed_market = find(old_markets, { Id: market.Id });

                                    if (changed_market) {
                                        that.props.updateFavoritesEventsMarket(new_events);
                                    }
                                });
                            }

                            // Livescore update
                            if (new_livescore) {
                                that.props.updateFavoritesEventsLivescore(new_events);
                            }

                            // Fixture metadata update
                            if (messageType === 1) {
                                let new_status = event.Fixture && event.Fixture.Status;
                                if (new_status) {
                                    that.props.updateFavoritesEventsStatus(new_events);
                                }
                            }
                        }
                    });
                }
            }
        };
    };

    // utilited by the function connect to check if the connection is close, if so attempts to reconnect
    check = () => {
        const { ws } = this.state;
        // check if websocket instance is closed, if so call `connect` function.
        if (!ws || ws.readyState === WebSocket.CLOSED) {
            this.connect();
        }
    };

    render() {
        return <React.Fragment children={this.props.children} />;
    }
}

LsportsAMQ.propTypes = {
    updateInplayEventsMarket: PropTypes.func,
    updateInplayEventsLivescore: PropTypes.func,
    updateInplayEventsStatus: PropTypes.func,
    updatePrematchEventsMarket: PropTypes.func,
    updatePrematchEventsLivescore: PropTypes.func,
    updatePrematchEventsStatus: PropTypes.func,
    updateLastMinuteEventsMarket: PropTypes.func,
    updateLastMinuteEventsStatus: PropTypes.func,
    updateTodayEventsMarket: PropTypes.func,
    updateTodayEventsStatus: PropTypes.func,
    updateHomeEventsMarket: PropTypes.func,
    updateHomeEventsStatus: PropTypes.func,
    updateExtraMarketsEventsMarket: PropTypes.func,
    updateExtraMarketsEventsLivescore: PropTypes.func,
    updateBetslipEventsMarket: PropTypes.func,
    updateBetslipEventsLivescore: PropTypes.func,
    updateBetslipEventsStatus: PropTypes.func,
    updateFavoritesEventsMarket: PropTypes.func,
    updateFavoritesEventsLivescore: PropTypes.func,
    updateFavoritesEventsStatus: PropTypes.func,
    mainEventsInplay: PropTypes.array,
    mainFilteredEventsInplay: PropTypes.array,
    mainEventsPrematch: PropTypes.array,
    mainEventsLastMinute: PropTypes.array,
    mainFilteredEventsLastMinute: PropTypes.array,
    mainEventsToday: PropTypes.array,
    mainFilteredEventsToday: PropTypes.array,
    mainEventsHome: PropTypes.array,
    extraMarkets: PropTypes.object,
    extraMarketEvent: PropTypes.object,
    betslipEvents: PropTypes.array,
    favorites: PropTypes.array,
};

const mapStateToProps = (state) => {
    return {
        mainEventsInplay: state.inplay.mainEvents,
        mainFilteredEventsInplay: state.inplay.filteredEvents,
        mainEventsPrematch: state.prematch.mainEvents,
        mainEventsLastMinute: state.lastMinute.mainEvents,
        mainFilteredEventsLastMinute: state.lastMinute.filteredEvents,
        mainEventsToday: state.today.mainEvents,
        mainFilteredEventsToday: state.today.filteredEvents,
        mainEventsHome: state.home.mainEvents,
        extraMarkets: state.lsportsGlobal.extraMarkets,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,
        betslipEvents: state.betslip.fixtures,
        favorites: state.favorites.favorites,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateInplayEventsMarket: (events) => dispatch(updateInplayEventsMarket(events)),
        updateInplayEventsLivescore: (events) => dispatch(updateInplayEventsLivescore(events)),
        updateInplayEventsStatus: (events) => dispatch(updateInplayEventsStatus(events)),
        updatePrematchEventsMarket: (events) => dispatch(updatePrematchEventsMarket(events)),
        updatePrematchEventsLivescore: (events) => dispatch(updatePrematchEventsLivescore(events)),
        updatePrematchEventsStatus: (events) => dispatch(updatePrematchEventsStatus(events)),
        updateLastMinuteEventsMarket: (events) => dispatch(updateLastMinuteEventsMarket(events)),
        updateLastMinuteEventsStatus: (events) => dispatch(updateLastMinuteEventsStatus(events)),
        updateTodayEventsMarket: (events) => dispatch(updateTodayEventsMarket(events)),
        updateTodayEventsStatus: (events) => dispatch(updateTodayEventsStatus(events)),
        updateHomeEventsMarket: (events) => dispatch(updateHomeEventsMarket(events)),
        updateHomeEventsStatus: (events) => dispatch(updateHomeEventsStatus(events)),
        updateExtraMarketsEventsMarket: (events) => dispatch(updateExtraMarketsEventsMarket(events)),
        updateExtraMarketsEventsLivescore: (events) => dispatch(updateExtraMarketsEventsLivescore(events)),
        updateBetslipEventsMarket: (events) => dispatch(updateBetslipEventsMarket(events)),
        updateBetslipEventsLivescore: (events) => dispatch(updateBetslipEventsLivescore(events)),
        updateBetslipEventsStatus: (events) => dispatch(updateBetslipEventsStatus(events)),
        updateFavoritesEventsMarket: (events) => dispatch(updateFavoritesEventsMarket(events)),
        updateFavoritesEventsLivescore: (events) => dispatch(updateFavoritesEventsLivescore(events)),
        updateFavoritesEventsStatus: (events) => dispatch(updateFavoritesEventsStatus(events)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LsportsAMQ);
