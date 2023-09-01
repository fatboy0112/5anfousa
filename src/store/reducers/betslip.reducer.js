import map from 'lodash.map';
import find from 'lodash.find';
import assign from 'lodash.assign';
import sum from 'lodash.sum';
import cloneDeep from 'lodash.clonedeep';
import filter from 'lodash.filter';
import flattenDepth from 'lodash.flattendepth';
import forEach from 'lodash.foreach';
import Util from '../../helper/Util';
import * as Actions from '../actions/actionTypes';
import { lSportsConfig } from '../../config';

const initialState = {
    fixtures: [],
    multiStake: 0,
    singleStake: 0,
    totalOdds: 0,
    totalMultiOdds: 0,
    count: 0, // count of fixtures in betslip
    canNotBeCombined: false,
    limits: {},
    placeBetError: null,
    placeBetSuccess: false,
    placeBetDisabled: false,
    placeBetCountdown: false,
    betPlacedMessage: false,
    lastBetId: false,
    betslipLoading: false,
};

const betslipReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.SET_PLACE_BET_ERROR: {
            return {
                ...state,
                placeBetError: action.error,
            };
        }

        case Actions.SET_PLACE_BET_SUCCESS: {
            return {
                ...state,
                placeBetSuccess: action.value,
            };
        }

        case Actions.SET_PLACE_BET_DISABLED: {
            return {
                ...state,
                placeBetDisabled: action.value,
            };
        }

        case Actions.SET_PLACE_BET_COUNTDOWN: {
            return {
                ...state,
                placeBetCountdown: action.value,
            };
        }

        case Actions.SET_BETSLIP_LOADING: {
            return {
                ...state,
                betslipLoading: action.value,
            };
        }

        case Actions.SET_BET_PLACED_MESSAGE: {
            return {
                ...state,
                betPlacedMessage: action.value,
            };
        }
        // add bet to betslip page
        case Actions.ADD_BET: {
            let fixtures = [];
            let foundFixture = find(state.fixtures, {
                fixtureId: action.fixture.FixtureId ? action.fixture.FixtureId : action.fixture.fixture_id,
            });

            if (foundFixture) {
                let foundMarket = find(foundFixture.markets, {
                    Id: action.market.Id,
                });

                if (foundMarket) {
                    let foundBet = find(foundMarket.bets, {
                        Id: action.bet.Id,
                    });

                    if (foundBet) {
                    } else {
                        foundMarket.bets = [
                            ...foundMarket.bets,
                            assign({}, action.bet, {
                                Stake: 0,
                                provider: action.provider,
                            }),
                        ];
                    }
                } else {
                    foundFixture.markets = [
                        ...foundFixture.markets,
                        {
                            Id: action.market.Id,
                            market: action.market,
                            bets: [
                                assign({}, action.bet, {
                                    Stake: 0,
                                    provider: action.provider,
                                }),
                            ],
                        },
                    ];
                }

                fixtures = state.fixtures;
            } else {
                let fixtureWithoutMkt = { ...action.fixture, market: {} };
                fixtures = [
                    ...state.fixtures,
                    {
                        fixtureId: action.fixture.FixtureId ? action.fixture.FixtureId : action.fixture.fixture_id,
                        fixture: fixtureWithoutMkt,
                        leagueName: action.leagueName,
                        markets: [
                            {
                                Id: action.market.Id,
                                market: action.market,
                                bets: [
                                    assign({}, action.bet, {
                                        Stake: 0,
                                        provider: action.provider,
                                    }),
                                ],
                            },
                        ],
                    },
                ];
            }

            let allBets = map(fixtures, (f) => {
                return map(f.markets, (m) => {
                    return map(m.bets, (b) => {
                        return b;
                    });
                });
            });

            allBets = flattenDepth(allBets, 2);

            let totalMultiOdds = 0;
            let totalOdds = sum(
                map(allBets, (b) => {
                    if (totalMultiOdds === 0) {
                        totalMultiOdds = Util.toFixedDecimal(b.Price);
                    } else {
                        totalMultiOdds *= Util.toFixedDecimal(b.Price);
                    }
                    return Util.toFixedDecimal(b.Price);
                }),
            );

            totalMultiOdds = Util.toFixedDecimal(totalMultiOdds + 0.00001);

            let canNotBeCombined = false;
            forEach(fixtures, (fixture) => {
                if (fixture.markets.length > 1 || fixture.markets[0].bets.length > 1) {
                    canNotBeCombined = true;
                }
            });

            // Remove from localstorage in 30 minutes
            // let expire_date = addMinutes(new Date(), 530);

            let saved_bets = {
                fixtures: fixtures,
                count: allBets.length,
                canNotBeCombined: canNotBeCombined,
                totalOdds: Util.toFixedDecimal(totalOdds),
                totalMultiOdds: Util.toFixedDecimal(totalMultiOdds),
                // expireDate: expire_date,
            };

            sessionStorage.setItem('saved_bets', JSON.stringify(saved_bets));

            return {
                ...state,
                fixtures: fixtures,
                count: allBets.length,
                canNotBeCombined: canNotBeCombined,
                totalOdds: Util.toFixedDecimal(totalOdds),
                totalMultiOdds: Util.toFixedDecimal(totalMultiOdds),
            };
        }

        // check for saved bets in localstorage to show in betslip page
        case Actions.CHECK_SAVED_BETS: {
            let saved_bets = JSON.parse(sessionStorage.getItem('saved_bets'));

            if (saved_bets) {
                // let expDate = saved_bets.expireDate;
                // let now = new Date();

                // if (isAfter(parseISO(expDate), now)) {
                return {
                    ...state,
                    fixtures: saved_bets.fixtures,
                    count: saved_bets.count,
                    canNotBeCombined: saved_bets.canNotBeCombined,
                    totalOdds: saved_bets.totalOdds,
                    totalMultiOdds: saved_bets.totalMultiOdds,
                };
                // } else {
                //     sessionStorage.removeItem('saved_bets');
                //     return {
                //         ...state,
                //         fixtures: [],
                //         count: 0,
                //         canNotBeCombined: false,
                //         multiStake: 0,
                //         singleStake: 0,
                //         totalOdds: 0,
                //         // expireDate: '',
                //     };
                // }
            } else {
                return {
                    ...state,
                };
            }
        }

        // check for saved bets in localstorage to show in betslip page
        case Actions.SET_LAST_BETSLIP: {
            let betslips = action.betslips;

            let fixtures = map(betslips, (betslip) => {
                //let provider = find(betslip.market.Providers, { Id: betslip.provider_id });
                //betslip.market.Providers = [provider];
                let bet = find(betslip.market.Bets, { outcome_id: !isNaN(betslip.bet_id) ? +betslip.bet_id : betslip.bet_id });
                bet && (bet.ProviderBetId = betslip.provider_id);
                let fixtureWithoutMkt = { 
                    ...betslip.event, 
                    market: {},
                    participants: [ betslip?.event?.participant_one_full, betslip?.event?.participant_two_full] 
                };
                return {
                    fixture: fixtureWithoutMkt,
                    fixtureId: betslip.event.fixture_id,
                    leagueName: betslip.event?.league?.name_en,
                    markets: [
                        {
                            Id: betslip.market.Id,
                            bets: [bet],
                            market: betslip.market,
                        },
                    ],
                };
            });

            let allBets = map(fixtures, (f) => {
                return map(f.markets, (m) => {
                    return map(m.bets, (b) => {
                        return b;
                    });
                });
            });


            allBets = flattenDepth(allBets, 2);

            let totalMultiOdds = 0;
            let totalOdds = sum(
                map(allBets, (b) => {
                    if (totalMultiOdds === 0) {
                        totalMultiOdds = Util.toFixedDecimal(b.Price);
                    } else {
                        totalMultiOdds *= Util.toFixedDecimal(b.Price);
                    }
                    return Util.toFixedDecimal(b.Price);
                }),
            );

            totalMultiOdds = Util.toFixedDecimal(totalMultiOdds + 0.00001);

            let canNotBeCombined = false;
            forEach(fixtures, (fixture) => {
                if (fixture.markets.length > 1 || fixture.markets[0].bets.length > 1) {
                    canNotBeCombined = true;
                }
            });

            let saved_bets = {
                fixtures: fixtures,
                count: allBets.length, // betslips.length
                canNotBeCombined: canNotBeCombined,
                totalOdds: Util.toFixedDecimal(totalOdds),
                totalMultiOdds: Util.toFixedDecimal(totalMultiOdds),
            };

            sessionStorage.setItem('saved_bets', JSON.stringify(saved_bets));

            return {
                ...state,
                fixtures: fixtures,
                count: allBets.length, // betslips.length
                canNotBeCombined: canNotBeCombined,
                totalOdds: Util.toFixedDecimal(totalOdds),
                totalMultiOdds: Util.toFixedDecimal(totalMultiOdds),
            };
        }

        // remove bet from betslip page
        case Actions.REMOVE_BET: {
            let fixtures = state.fixtures;

            forEach(fixtures, (e) => {
                if (e.fixtureId === action.fixture.FixtureId ? action.fixture.FixtureId : action.fixture.fixture_id) {
                    forEach(e.markets, (market) => {    
                        if (market.Id === action.market.Id) {
                            market.bets = filter(market.bets, (bet) => {
                                return bet.Id !== action.bet.Id;
                            });

                            e.markets = filter(e.markets, (m) => {
                                return m.bets.length !== 0;
                            });
                        }
                    });

                    fixtures = filter(fixtures, (g) => {
                        return g.markets.length !== 0;
                    });
                }
            });

            let allBets = map(fixtures, (f) => {
                return map(f.markets, (m) => {
                    return map(m.bets, (b) => {
                        return b;
                    });
                });
            });

            allBets = flattenDepth(allBets, 2);

            let totalMultiOdds = 0;
            let totalOdds = sum(
                map(allBets, (b) => {
                    if (totalMultiOdds === 0) {
                        totalMultiOdds = Util.toFixedDecimal(b.Price);
                    } else {
                        totalMultiOdds *= Util.toFixedDecimal(b.Price);
                    }
                    return Util.toFixedDecimal(b.Price);
                }),
            );

            totalMultiOdds = Util.toFixedDecimal(totalMultiOdds + 0.00001);

            let canNotBeCombined = false;
            forEach(fixtures, (fixture) => {
                if (fixture.markets.length > 1 || fixture.markets[0].bets.length > 1) {
                    canNotBeCombined = true;
                }
            });

            // Remove from localstorage in 30 minutes
            // let expire_date = addMinutes(new Date(), 530);

            let saved_bets = {
                fixtures: fixtures,
                count: allBets.length,
                canNotBeCombined: canNotBeCombined,
                totalOdds: Util.toFixedDecimal(totalOdds),
                totalMultiOdds: Util.toFixedDecimal(totalMultiOdds),
                // expireDate: expire_date,
            };

            sessionStorage.setItem('saved_bets', JSON.stringify(saved_bets));

            return {
                ...state,
                fixtures: fixtures,
                singleStake:0,
                count: allBets.length,
                canNotBeCombined: canNotBeCombined,
                totalOdds: Util.toFixedDecimal(totalOdds),
                totalMultiOdds: Util.toFixedDecimal(totalMultiOdds),
                lastBetId: false,
            };
        }

        // update bets if bet is settled/suspended (cannot be placed) (from socket)
        case Actions.UPDATE_BETS: {
            let changed_bets = action.bets;
            let fixturesClone = cloneDeep(state.fixtures);
            let updated = false;

            if (changed_bets.length > 0) {
                forEach(changed_bets, (bet) => {
                    forEach(fixturesClone, (fixture) => {
                        let changed_bet = find(fixture.markets[0].bets, { Id: bet.Id });

                        if (changed_bet) {
                            changed_bet.Status = bet.Status;
                            changed_bet.Price = bet.Price;
                            updated = true;
                        }
                    });
                });
            }

            if (updated) {
                let old_saved_bets = JSON.parse(sessionStorage.getItem('saved_bets'));
                let old_saved_bets_clone = cloneDeep(old_saved_bets);

                old_saved_bets_clone.fixtures = fixturesClone;
                sessionStorage.setItem('saved_bets', JSON.stringify(old_saved_bets_clone));

                return {
                    ...state,
                    fixtures: fixturesClone,
                };
            } else {
                return state;
            }
        }

        case Actions.UPDATE_BET_FIXTURE: {
            let updated = false;
            let new_event = action.event;
            let old_events = cloneDeep(state.fixtures);
            let changed_fixture = find(old_events, (e) => e.fixtureId == new_event.FixtureId );
            if (changed_fixture?.fixture?.market) {
                // let new_markets = new_event.Market;
                // changed_fixture.fixture.market = { ...changed_fixture.fixture.markets, ...new_markets };
                updated = true;
            }

            if (updated) {
                let old_saved_bets = JSON.parse(sessionStorage.getItem('saved_bets'));
                let old_saved_bets_clone = cloneDeep(old_saved_bets);

                old_saved_bets_clone.fixtures = old_events;
                sessionStorage.setItem('saved_bets', JSON.stringify(old_saved_bets_clone));

                return {
                    ...state,
                    fixtures: old_events,
                };
            } else {
                return state;
            }
        }

        case Actions.UPDATE_BETSLIP_EVENTS_MARKET: {
            let new_events = action.events;
            let old_events = cloneDeep(state.fixtures);
            let totalMultiOdds, totalOdds;
            let updated = false;

            if (old_events.length > 0) {
                forEach(new_events, (event) => {
                    let changed_fixture = find(old_events, (e) => e.fixtureId == event.FixtureId );
                    if (changed_fixture) {
                        let new_markets = event.Market;
                        let old_markets = Object.values(changed_fixture.markets);
                        forEach(new_markets, (market) => {
                            let changed_market = find(old_markets, { Id: market.Id });

                            if (changed_market) {
                                let new_market = find(new_markets, { Id: changed_market.Id });

                                let new_bets = new_market.Bets;
                                let old_bets = changed_market.bets;

                                forEach(new_bets, (bet) => {
                                    let changed_bet = find(old_bets, { Id: bet.Id.toString() });
                                    
                                    if (changed_bet) {
                                        let new_price = bet.Price;
                                        let old_price = changed_bet.Price;
                                        let new_status = bet.Status;

                                        changed_bet.Status = new_status;

                                        updated = true;

                                        if (new_price === old_price) {
                                            return;
                                        }

                                        changed_bet.Price = new_price;
                                        changed_bet.diff = Util.toFixedDecimal(old_price - new_price);
                                        let allBets = map(old_events, (f) => {
                                            return map(f.markets, (m) => {
                                                return map(m.bets, (b) => {
                                                    return b;
                                                });
                                            });
                                        });

                                        allBets = flattenDepth(allBets, 2);
                                        totalMultiOdds = 0;
                                        totalOdds = sum(
                                            map(allBets, (b) => {
                                                if (totalMultiOdds === 0) {
                                                    totalMultiOdds = Util.toFixedDecimal(b.Price);
                                                } else {
                                                    totalMultiOdds *= Util.toFixedDecimal(b.Price);
                                                }
                                                return Util.toFixedDecimal(b.Price);
                                            }),
                                        );

                                        totalMultiOdds = Util.toFixedDecimal(totalMultiOdds + 0.00001);
                                    }
                                });
                            }
                        });
                    }
                });
            }

            if (updated) {
                let old_saved_bets = JSON.parse(sessionStorage.getItem('saved_bets'));
                let old_saved_bets_clone = cloneDeep(old_saved_bets);
                old_saved_bets_clone.fixtures = old_events;
                if (totalMultiOdds) {
                    old_saved_bets_clone.totalMultiOdds = Util.toFixedDecimal(totalMultiOdds);
                }
                if (totalOdds) {
                    old_saved_bets_clone.totalOdds = Util.toFixedDecimal(totalOdds);
                }
                sessionStorage.setItem('saved_bets', JSON.stringify(old_saved_bets_clone));

                if (totalMultiOdds || totalOdds) {
                    if (state.count > 1) {
                        return {
                            ...state,
                            fixtures: old_events,
                            totalMultiOdds: Util.toFixedDecimal(totalMultiOdds),
                        };
                    } else {
                        return {
                            ...state,
                            fixtures: old_events,
                            totalOdds: Util.toFixedDecimal(totalOdds),
                        };
                    }
                } else {
                    return {
                        ...state,
                        fixtures: old_events,
                    };
                }
            } else {
                return state;
            }
        }

        case Actions.UPDATE_BETSLIP_EVENTS_LIVESCORE: {
            let new_events = action.events;
            let old_events = cloneDeep(state.fixtures);

            let updated = false;

            if (old_events.length > 0) {
                forEach(new_events, (event) => {
                    let changed_fixture = find(old_events,(e) => e.fixtureId == event.FixtureId);
                    if (changed_fixture) {
                        let new_livescore = event.Livescore;

                        if (new_livescore) {
                            updated = true;
                            changed_fixture.fixture.Livescore = new_livescore;
                        }
                    }
                });
            }

            if (updated) {
                let old_saved_bets = JSON.parse(sessionStorage.getItem('saved_bets'));
                let old_saved_bets_clone = cloneDeep(old_saved_bets);
                old_saved_bets_clone.fixtures = old_events;
                sessionStorage.setItem('saved_bets', JSON.stringify(old_saved_bets_clone));

                return {
                    ...state,
                    fixtures: old_events,
                };
            } else {
                return state;
            }
        }

        case Actions.UPDATE_BETSLIP_EVENTS_STATUS: {
            let new_events = action.events;
            let old_events = cloneDeep(state.fixtures);

            let updated = false;
            let totalMultiOdds, totalOdds, count;
            let oldBetCount = old_events.length;

            if (old_events.length > 0) {
                forEach(new_events, (event) => {
                    let changed_fixture = find(old_events, { fixtureId: event.FixtureId });
                    if (changed_fixture) {
                        let old_status = changed_fixture.fixture.fixture_status;
                        let new_status = event.Fixture?.event.Fixture.Status || event.Status;
                        let inPlayStatus = lSportsConfig.statuses.inplay;
                        if ((old_status === inPlayStatus && new_status !== inPlayStatus) || (old_status != inPlayStatus && new_status == inPlayStatus) || (old_status != inPlayStatus && new_status == 3) ) {
                            updated = true;
                            old_events = filter(old_events, (e) => e.fixtureId !== event.FixtureId);

                            let allBets = map(old_events, (f) => {
                                return map(f.markets, (m) => {
                                    return map(m.bets, (b) => {
                                        return b;
                                    });
                                });
                            });

                            allBets = flattenDepth(allBets, 2);
                            count = allBets.length;

                            totalMultiOdds = 0;
                            totalOdds = sum(
                                map(allBets, (b) => {
                                    if (totalMultiOdds === 0) {
                                        totalMultiOdds = Util.toFixedDecimal(b.Price);
                                    } else {
                                        totalMultiOdds *= Util.toFixedDecimal(b.Price);
                                    }
                                    return Util.toFixedDecimal(b.Price);
                                }),
                            );

                            totalMultiOdds = Util.toFixedDecimal(totalMultiOdds + 0.00001);
                        } else if (old_status !== new_status) {
                            updated = true;
                            changed_fixture.fixture.fixture_status = new_status;
                        }
                    }
                });
            }

            if (updated) {
                if (oldBetCount === 0) {
                } else {
                }
                let old_saved_bets = JSON.parse(sessionStorage.getItem('saved_bets'));
                let old_saved_bets_clone = cloneDeep(old_saved_bets);
                old_saved_bets_clone.fixtures = old_events;
                old_saved_bets_clone.count = count;

                if (totalMultiOdds) {
                    old_saved_bets_clone.totalMultiOdds = Util.toFixedDecimal(totalMultiOdds);
                }
                if (totalOdds) {
                    old_saved_bets_clone.totalOdds = Util.toFixedDecimal(totalOdds);
                }
                sessionStorage.setItem('saved_bets', JSON.stringify(old_saved_bets_clone));

                if (totalMultiOdds || totalOdds) {
                    if (count > 1) {
                        return {
                            ...state,
                            fixtures: old_events,
                            totalMultiOdds: Util.toFixedDecimal(totalMultiOdds),
                            count: count,
                        };
                    } else {
                        return {
                            ...state,
                            fixtures: old_events,
                            totalOdds: Util.toFixedDecimal(totalOdds),
                            count: count,
                        };
                    }
                } else {
                    if (count) {
                        return {
                            ...state,
                            fixtures: old_events,
                            count: count,
                        };
                    } else {
                        return {
                            ...state,
                            fixtures: old_events,
                        };
                    }
                }
            } else {
                return state;
            }
        }

        // clear bets from betslip and localstorage
        case Actions.CLEAR_BETS: {
            let saved_bets = {
                fixtures: [],
                count: 0,
                multiStake: 0,
                singleStake: 0,
                totalOdds: 0,
                totalMultiOdds: 0,
            };

            sessionStorage.setItem('saved_bets', JSON.stringify(saved_bets));

            return {
                ...state,
                fixtures: [],
                count: 0,
                multiStake: 0,
                singleStake: 0,
                totalOdds: 0,
                totalMultiOdds: 0,
            };
        }

        // set amount of multiple bet
        case Actions.SET_MULTI_STAKE: {
            let value = action.value.toString();

            // if (value !== 0 && value.slice(-1) === '.') {
            //     value = value.slice(0, -1);
            // }
            return {
                ...state,
                multiStake: value,
            };
        }

        // set amount of single bet
        case Actions.SET_BET_STAKE: {
            let value = action.value.toString();

            // if (value !== 0 && value.slice(-1) === '.') {
            //     value = value.slice(0, -1);
            // }
            return {
                ...state,
                singleStake: value,
            };
        }

        case Actions.SET_LIMITS: {
            return {
                ...state,
                limits: action.limits,
                placeBetDisabled: action.is_bet_disabled
            };
        }

        // set last placed betslip id
        case Actions.SET_LAST_BET_ID: {
            return {
                ...state,
                lastBetId: action.value,
            };
        }

        default:
            return state;
    }
};

export default betslipReducer;
