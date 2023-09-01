/* eslint-disable default-case */
/* eslint-disable no-undef */
import React from 'react';
import map from 'lodash.map';
import find from 'lodash.find';
import assign from 'lodash.assign';
import forEach from 'lodash.foreach';
import orderBy from 'lodash.orderby';
import flattenDepth from 'lodash.flattendepth';
import replace from 'lodash.replace';
import filter from 'lodash.filter';
import { lSportsConfig } from '../config/lsports.config';
import { BASKETBALL_MARKETS, FOOTBALL_MARKETS, FOOTBALL_MARKETS_PREMATCH, ICEHOCKEY_MARKETS, SPORT_NAME, SPORT_NAME_PREMATCH, TENNIS_MARKETS, VOLLYBALL_MARKETS } from '../config/markets';
import JwtDecode from 'jwt-decode';
import { toastr } from 'react-redux-toastr';
import { logoutUser } from '../store/actions/user.actions';
import { Grid } from '@material-ui/core';
import { sportAndLocationData } from '../config/sports';
import { Translate } from '../localization';

import { STATIC_MARKET } from '../config/staticMarket';
import { STATIC_OUTCOME } from '../config/staticOutcome';
import marketVariant from '../config/marketVariant.json';
import { create, all } from 'mathjs';
import { betradarConfig } from '../config/betradar.config';
const math = create(all);

class Util {
    // get sport icon name
    static getSportIconByName = function (name) {
        let icon = 'icon-' + replace(name, ' ', '-').toLowerCase();
        return icon;
    };

    // convert date to local timezone
    static convertToLocalTimezone = function (date) {
        if (!date) return null;
        let date_1, localDateTime;

        if (date.indexOf('Z') > -1) {
            localDateTime = new Date(date);
        } else {
            date_1 = date.toString() + "Z";
            localDateTime = new Date(date);
        }
        
        let dateString = ('0' + localDateTime.getDate()).slice(-2) + '/' + ('0' + (localDateTime.getMonth() + 1)).slice(-2);
        let timeString = ('0' + localDateTime.getHours()).slice(-2) + ':' + ('0' + localDateTime.getMinutes()).slice(-2);

        return { dateString, timeString };
    };

    static getFormattedDate = function (date) {
        if (!date) return null;
        let date_1, localDateTime;
        if (!date) return date;
        if (date.indexOf('Z') > -1) {
            localDateTime = new Date(date);
        } else {
            date_1 = date.toString() + "Z";
            localDateTime = new Date(date);
        }
        return localDateTime;
    };

    // order bet names
    static assignBetSort = function (betObject, marketId, lan) {
        const secondarySort = lSportsConfig.sort[marketId] ? lSportsConfig.sort[marketId][betObject?.outcome_id || 0] ? lSportsConfig.sort[marketId][betObject?.outcome_id] : null : null;
        return assign(betObject, {
            Name: betObject[ lan ] || betObject.name_en,
            Sort: betObject.BaseLine ? betObject.BaseLine : betObject.outcome_id,
            secondarySort,
        });
    };

    // order bet names
    static sortBet = function (bets, marketId, lan) {
        forEach(bets, (b, i) => {
            bets[i] = this.assignBetSort(b, marketId, lan);
        });
        return orderBy(bets, ['Sort', 'secondarySort', 'outcome_id'], 'asc');
    };

    // cut number
    static toFixedDecimal = function (value, oddType) {
        // if(value < 0 ){
        //     value = 0;    // FIXME if want to show negative amount as zero then uncommnect this
        // }
        let val = value.toString();
        let dotIndex = val.indexOf('.');
        let roundedValue;
        if (dotIndex >= 0) {
            if (dotIndex === val.length - 2) {
                roundedValue = val + '0';
            } else {
                roundedValue = val.slice(0, dotIndex + 3);
            }
        } else {
            roundedValue = val + '.00';
        }

        if(oddType === 'fraction') roundedValue = math.fraction(roundedValue - 1).toFraction();
        else if(oddType === 'american') {
            roundedValue = parseFloat(roundedValue);
                if (roundedValue >= 2) {
                    roundedValue = ((roundedValue - 1) * 100);
                  } if (value < 2) {
                    roundedValue = (-100 / (roundedValue - 1));
                  }

                roundedValue = roundedValue.toFixed(0);

        }
        return roundedValue;
    };

    // set bet amount
    static toSetBetAmount = function (value) {
        let val = value.toString();
        let dotIndex = val.indexOf('.');
        let roundedValue;
        if (dotIndex >= 0) {
            if (dotIndex === val.length - 2) {
                roundedValue = val;
            } else {
                roundedValue = val.slice(0, dotIndex + 3);
            }
        } else {
            roundedValue = val;
        }
        return roundedValue;
    };

    // oprder providers list (first should be "1XBet" - 145)
    static orderProviders = function (providers) {
        let orderedProviders = providers;
        let defaultProvider = find(orderedProviders, (item) => item.Id === lSportsConfig.account.default_provider);
        if (defaultProvider) {
            orderedProviders = filter(orderedProviders, (item) => item !== defaultProvider);
            orderedProviders.unshift(defaultProvider);
        }
        return orderedProviders;
    };

    // get sport event periods score
    static getSportPeriods = function (periods, sportId) {
        if (periods) {
            // order by period type
            // let orderedPeriods = orderBy(periods, ['Type'], 'asc');

            // basketball and volleyball - md
            let periodWidth = sportId === 3 || sportId === 23 ? 'results__score-md' : 'results__score-sm';

            let drawPeriods = map(periods, (period, index) => {
                if (index > 0 && index<= 10) {
                    return (
                        <div className={periodWidth} key={index}>
                            <span className="d-block">{period?.home_score}</span>
                            <span className="d-block">{period?.away_score}</span>
                        </div>
                    );
                }
            });

            return drawPeriods;
        } else {
            return null;
        }
    };

    static drawCards = function (type, cardsNumber, onlyRed) {
        let result = [];
        if (onlyRed) {
            if (cardsNumber > 2) {
                result = (
                    <>
                        <li className={`results__card results__card_${type}`}></li>
                        <li className="results__card-number">+{cardsNumber - 1}</li>
                    </>
                );
            } else {
                for (var i = 0; i < cardsNumber; i++) {
                    result.push(<li key={i} className={`results__card results__card_${type}`}></li>);
                }
            }
        }

        else if (cardsNumber > 4) {
            result = (
                <>
                    <li className={`results__card results__card_${type}`}></li>
                    <li className="results__card-number">+{cardsNumber - 1}</li>
                </>
            );
        } else {
            for (var i = 0; i < cardsNumber; i++) {
                result.push(<li key={i} className={`results__card results__card_${type}`}></li>);
            }
        }

        return result;
    };

    // get football yellow/red cards
    static getSportCards = function (statistics) {
        if (statistics) {
            let yellowCards_0 = this.drawCards('yellow', +statistics?.yellow_cards?.home);
            let yellowCards_1 = this.drawCards('yellow', +statistics?.yellow_cards?.away);
            let redCards_0 = this.drawCards('red', +statistics?.red_cards?.home);
            let redCards_1 = this.drawCards('red', +statistics?.red_cards?.away);

            // map(statistics, (stat) => {
            //     // Yellow cards
            //     if (stat.Type === 6) {
            //         if (stat.Results) {
            //             let yellowCardsNumber_0 = +stat.Results[0].Value;
            //             let yellowCardsNumber_1 = +stat.Results[1].Value;

            //             yellowCards_0 = this.drawCards('yellow', yellowCardsNumber_0);
            //             yellowCards_1 = this.drawCards('yellow', yellowCardsNumber_1);
            //         }
            //     }

            //     // Red cards
            //     if (stat.Type === 7) {
            //         if (stat.Results) {
            //             let redCardsNumber_0 = +stat.Results[0].Value;
            //             let redCardsNumber_1 = +stat.Results[1].Value;

            //             redCards_0 = this.drawCards('red', redCardsNumber_0);
            //             redCards_1 = this.drawCards('red', redCardsNumber_1);
            //         }
            //     }
            // });

            let drawCards = (
                <div className="results__cards p-2 p-lg-0">
                    <ul>
                        {yellowCards_0}
                        {redCards_0}
                    </ul>
                    <ul>
                        {yellowCards_1}
                        {redCards_1}
                    </ul>
                </div>
            );

            return drawCards;
        } else {
            return null;
        }
    };

    // get football red cards
    static getRedCards = function (statistics) {
        if (statistics) {
            let redCards_0 = this.drawCards('red', +statistics?.red_cards?.home + +statistics?.yellow_red_cards?.home, true);
            let redCards_1 = this.drawCards('red', +statistics?.red_cards?.away + +statistics?.yellow_red_cards?.away, true);

            // map(statistics, (stat) => {
                
            //     // Red cards
            //     if (stat.Type === 7) {
            //         if (stat.Results) {
            //             let redCardsNumber_0 = +stat.Results[1]?.Value;
            //             let redCardsNumber_1 = +stat.Results[2]?.Value;

            //             redCards_0 = this.drawCards('red', redCardsNumber_0, true);
            //             redCards_1 = this.drawCards('red', redCardsNumber_1, true);
            //         }
            //     }
            // });

            let drawCards = (
                <Grid item xs={2} className="results__cards p-2">
                    <ul>
                        {redCards_0}
                    </ul>
                    <ul>
                        {redCards_1}
                    </ul>
                </Grid>
            );

            return drawCards;
        } else {
            return null;
        }
    };

    static checkSettledBets = function (markets) {        
        if(!!markets) {
            const { active, suspended } = lSportsConfig.betStatus;
            const areAllSettled_1 = find(markets, m => find(m.Bets, b => b.Status === active));
            const areAllSettled_2 = find(markets, m => find(m.Bets, b => b.Status === suspended));
            const areAllSettled_3 = find(markets, m => b => b.Status === deactivated);
          return areAllSettled_1 || areAllSettled_2 || areAllSettled_3 ? false : true;
        }

        return true;
    };

    static checkSettledBetsPrematch = function (markets) {        
        if(!!markets) {
            const { active, suspended, deactivated } = lSportsConfig.betStatus;
            const areAllSettled_1 = find(markets, m => b => b.Status === active);
            const areAllSettled_2 = find(markets, m => b => b.Status === suspended);
            const areAllSettled_3 = find(markets, m => b => b.Status === deactivated);
          return areAllSettled_1 || areAllSettled_2 || areAllSettled_3 ? false : true;
        }

        return true;
    };

    static checkSuspendendBets = function (markets) {        
        if(!!markets) {
            const areAllSettled_1 = find(markets, m => find(m.Bets, b => b.Status === lSportsConfig.betStatus.active));
          return areAllSettled_1 ? false : true;
        }
        return true;
    };

    static checkSuspendedBetsPrematch = function (markets) {        
        if(!!markets) {
            const areAllSettled_1 = find(markets, m => b => b.Status === lSportsConfig.betStatus.active);
          return areAllSettled_1 ? false : true;
        }
        return true;
    };

    static checkBets = function (Bets) {     
        if(!!Bets) {
            const { active, suspended, deactivated } = lSportsConfig.betStatus;
            const areAllSettled_1 = find(Bets, b => b?.Status === active);
            const areAllSettled_2 = find(Bets, b => b?.Status === suspended);
            const areAllSettled_3 = find(Bets, b => b?.Status === deactivated);
          return areAllSettled_1 || areAllSettled_2 || areAllSettled_3 ? true : false;
        }

        return false
    };

    // prepare data for sending place bet request
    static convertToPlaceBetData = function (fixtures, type, amount, language) {
        const lan = `name_${ language.toLowerCase() }`;
        console.log('fixtures = ', fixtures)
        let data = map(fixtures, (fixture) => {
            // let participantArray = fixture.fixture.fixture_status ? [fixture.fixture.participant_one_full, fixture.fixture.participant_two_full] :  fixture.fixture.participants;
            let p1 = fixture.fixture.participants[0][lan] || fixture.fixture.participants[0].name_en;
            let p2 = fixture.fixture.participants[1][lan] || fixture.fixture.participants[1].name_en;
            let sn = fixture.fixture.sport_id ? sportAndLocationData()[fixture.fixture.sport_id].Name : fixture.fixture.Fixture.Sport.Name ;
            let ln = fixture.fixture.location ? fixture.fixture.location[lan] || fixture.fixture.location.name_en : fixture.fixture.Fixture.Location[lan] || fixture.fixture.Fixture.Location.name_en;
            let lgn = fixture.leagueName ? fixture.leagueName : fixture.fixture.league[lan];
            let champ = `${sn}, ${ln}, ${lgn}`;
            let sportId = fixture.fixture.sport_id ? fixture.fixture.sport_id : fixture.fixture.Fixture.Sport.Id ;
            let league_id = fixture.fixture.league.Id;
            let extraBetData = {};
            let livescoreData = fixture.fixture.Livescore || fixture.fixture.livescore || {};
            if (Object.keys(livescoreData).length) extraBetData = { livescore: livescoreData };
            return map(fixture.markets, (market) => {
                return map(market.bets, (bet) => {
                    let betName = Util.outcomeFormatter(bet[ lan ] || bet.name_en, bet.specifier, bet.Id, lan)
                    betName = betName + (bet.Line ? `(${bet.Line})` : '');
                    // if (market.Id === 13) betName = `${bet.Name} (${bet.BaseLine})`;
                    return {
                        bet_id: String(bet.outcome_id),
                        fixture_id: fixture.fixture.fixture_id ? fixture.fixture.fixture_id : fixture.fixture.FixtureId,
                        fixture_status: fixture.fixture.fixture_status,
                        market_id: market.Id,
                        league_id: fixture.fixture.league_id,
                        // provider_id: bet.ProviderBetId,
                        champ: champ,
                        match: `${p1} - ${p2}`,
                        // market: market.market?.[lan],
                        market: Util.marketNameFormatter(market.market?.[lan] || market.market.name_en, bet?.specifier || {}, [p1,p2]),
                        name: betName,
                        bet_status: bet.Status,
                        price: this.toFixedDecimal(bet.Price),
                        start_date: fixture.fixture.start_date ? fixture.fixture.start_date : fixture.fixture.Fixture.StartDate,
                        sport_id: sportId,
                        specifiers: bet.specifier_string,
                        ...extraBetData,
                    };
                });
            });
        });

        return {
            bettype: type,
            stake: this.toFixedDecimal(amount),
            bets: flattenDepth(data, 2),
            language: language,
        };
    };

    // Bet limits validation when placing a bet
    static betLimitsValidation = function (limits, type, count, amount, totalOdds, totalMultiOdds, currency, userData, sportId) {
        let message;

        let max_single_bet = limits.max_single_bet ? limits.max_single_bet : userData.max_single_bet;
        let max_multiple_bet = limits.max_multiple_bet ? limits.max_multiple_bet : userData.max_multiple_bet;
        let min_bet = limits.min_bet ? limits.min_bet : userData.min_bet;
        let max_odd = limits.max_odd;
        let max_win_amount = limits.max_win_amount;
        let max_multi_two_events_amount = limits.max_multi_two_events_amount;
        let max_multi_three_events_amount = limits.max_multi_three_events_amount;
        let max_multi_four_events_amount = limits.max_multi_four_events_amount;
        
        let odd = type === 'single' ? totalOdds : totalMultiOdds;
        let total_win = parseFloat(this.toFixedDecimal(amount * odd));
        
        if (type === 'single') {
            if (sportId && sportId !== lSportsConfig.sports.football.id ) {
                max_single_bet = limits.max_single_bet_other_sports ? limits.max_single_bet_other_sports : userData.max_single_bet_other_sports;
            }

            if (parseFloat(amount) > max_single_bet) {
                message = `${Translate.stakeLowerThen1}` + max_single_bet + ' ' + currency + '.';
                return message;
            }
        }

        if (parseFloat(amount) < min_bet) {
            message = `${Translate.stakeGreaterThen1}` + min_bet + ' ' + currency + '.';
            return message;
        }
        if (parseFloat(odd) > max_odd) {
            message = `${Translate.maxOdd} is ` + max_odd + '.';
            return message;
        }
        if (total_win > max_win_amount) {
            message = `${Translate.maxWinAmount} is ` + max_win_amount + ' ' + currency + '.';
            return message;
        }

        if (type === 'multiple') {
            if (parseFloat(amount) < max_multiple_bet) {                
                if (count === 2 && parseFloat(odd) < 2.2) {
                    if (parseFloat(amount) > max_multi_two_events_amount) {
                        message = `${Translate.stakeLowerThen1}` + max_multi_two_events_amount + ' ' + currency + '.';
                        return message;
                    }
                } else if (count === 3 && parseFloat(odd) < 3.2) {
                    if (parseFloat(amount) > max_multi_three_events_amount) {
                        message = `${Translate.stakeLowerThen1}` + max_multi_three_events_amount + ' ' + currency + '.';
                        return message;
                    }
                } else if (count === 4 && parseFloat(odd) < 4.2) {
                    if (parseFloat(amount) > max_multi_four_events_amount) {
                        message = `${Translate.stakeLowerThen1}` + max_multi_four_events_amount + ' ' + currency + '.';
                        return message;
                    }
                } else {
                    if (parseFloat(amount) > max_multiple_bet) {
                       message = `${Translate.stakeLowerThen1}` + max_multiple_bet + ' ' + currency + '.';
                       return message;
                   }
                }
            }
            else {
                message = `${Translate.stakeLowerThen1}` + max_multiple_bet + ' ' + currency + '.';
                return message;
            }
        }

        return message;
    };

    static getExtraMarketName = (sportId) => {
        return SPORT_NAME[sportId];
    }

    static getExtraMarketNamePrematch = (sportId) => {
        return SPORT_NAME_PREMATCH[sportId];
    }

    static getExtraMarketsPrematch = (extraMarkets, prematch, sportId) => {
        switch (sportId) {
            case 1: {
                forEach(Object.values(prematch.market || {}), market => {
                   
                    extraMarkets['All'][market.Id] = market;

                    if (FOOTBALL_MARKETS_PREMATCH.first_half_market_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS_PREMATCH.first_half_market_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS_PREMATCH.second_half_market_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS_PREMATCH.second_half_market_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS_PREMATCH.score_market_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS_PREMATCH.score_market_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS_PREMATCH.corners_market_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS_PREMATCH.corners_market_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS_PREMATCH.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS_PREMATCH.main_markets_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS_PREMATCH.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS_PREMATCH.totals_id_list.marketName][market.Id] = market;
                });
                break;
            }

            case 2: {
                forEach(Object.values(prematch.market || {}), market => {
                    extraMarkets['All'][market.Id] = market;

                    if (BASKETBALL_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (BASKETBALL_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.totals_id_list.marketName][market.Id] = market;
                    if (BASKETBALL_MARKETS.home_team_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.home_team_id_list.marketName][market.Id] = market;
                    if (BASKETBALL_MARKETS.away_team_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.away_team_id_list.marketName][market.Id] = market;
                    if (BASKETBALL_MARKETS.all_periods_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.all_periods_id_list.marketName][market.Id] = market;
                });
                break;
            }

            case 4: { 
                forEach(Object.values(prematch.market || {}), market => {
                    extraMarkets['All'][market.Id] = market;
                    if (ICEHOCKEY_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[ICEHOCKEY_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (ICEHOCKEY_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[ICEHOCKEY_MARKETS.totals_id_list.marketName][market.Id] = market;
                    if (ICEHOCKEY_MARKETS.home_team_id_list.marketIds.includes(market.Id))
                        extraMarkets[ICEHOCKEY_MARKETS.home_team_id_list.marketName][market.Id] = market;
                    if (ICEHOCKEY_MARKETS.away_team_id_list.marketIds.includes(market.Id))
                        extraMarkets[ICEHOCKEY_MARKETS.away_team_id_list.marketName][market.Id] = market;
                });
                break;
            }   

            case 5: { 
                forEach(Object.values(prematch.market ||  {}), market => {
                    extraMarkets['All'][market.Id] = market;

                    if (TENNIS_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[TENNIS_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (TENNIS_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[TENNIS_MARKETS.totals_id_list.marketName][market.Id] = market;
                    if (TENNIS_MARKETS.all_periods_id_list.marketIds.includes(market.Id))
                        extraMarkets[TENNIS_MARKETS.all_periods_id_list.marketName][market.Id] = market;
                    if (TENNIS_MARKETS.results_id_list.marketIds.includes(market.Id))
                        extraMarkets[TENNIS_MARKETS.results_id_list.marketName][market.Id] = market;
                    
                });
                break;
            }

            case 23: { 
                forEach(Object.values(prematch.market || {}), market => {
                    extraMarkets['All'][market.Id] = market;

                    if (VOLLYBALL_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[VOLLYBALL_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (VOLLYBALL_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[VOLLYBALL_MARKETS.totals_id_list.marketName][market.Id] = market;
                    if (VOLLYBALL_MARKETS.home_away_id_list.marketIds.includes(market.Id))
                        extraMarkets[VOLLYBALL_MARKETS.home_away_id_list.marketName][market.Id] = market;
                });
                break;
            }

            case 10: { 
                forEach(Object.values(prematch.market || {}), market => {
                    extraMarkets['All'][market.Id] = market;
                });
                break;
            }

            default: {
                forEach(Object.values(prematch.market), market => {
                    extraMarkets['All'][market.Id] = market;
                });
            }

        }
        return extraMarkets;
    }

    // Extra markets generator

    static getExtraMarkets = (extraMarkets, liveMatches, sportId) => {
        switch (sportId) {
            case 1: {
                forEach(liveMatches.Markets, market => {
                   
                    extraMarkets['All'][market.Id] = market;

                    if (FOOTBALL_MARKETS.first_half_market_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS.first_half_market_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS.second_half_market_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS.second_half_market_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS.score_market_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS.score_market_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS.corners_market_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS.corners_market_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (FOOTBALL_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[FOOTBALL_MARKETS.totals_id_list.marketName][market.Id] = market;
                });
                break;
            }

            case 2: {
                forEach(liveMatches.Markets, market => {
                    extraMarkets['All'][market.Id] = market;

                    if (BASKETBALL_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (BASKETBALL_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.totals_id_list.marketName][market.Id] = market;
                    if (BASKETBALL_MARKETS.home_team_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.home_team_id_list.marketName][market.Id] = market;
                    if (BASKETBALL_MARKETS.away_team_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.away_team_id_list.marketName][market.Id] = market;
                    if (BASKETBALL_MARKETS.all_periods_id_list.marketIds.includes(market.Id))
                        extraMarkets[BASKETBALL_MARKETS.all_periods_id_list.marketName][market.Id] = market;
                });
                break;
            }

            case 4: { 
                forEach(liveMatches.Markets, market => {
                    extraMarkets['All'][market.Id] = market;
                    if (ICEHOCKEY_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[ICEHOCKEY_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (ICEHOCKEY_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[ICEHOCKEY_MARKETS.totals_id_list.marketName][market.Id] = market;
                    if (ICEHOCKEY_MARKETS.home_team_id_list.marketIds.includes(market.Id))
                        extraMarkets[ICEHOCKEY_MARKETS.home_team_id_list.marketName][market.Id] = market;
                    if (ICEHOCKEY_MARKETS.away_team_id_list.marketIds.includes(market.Id))
                        extraMarkets[ICEHOCKEY_MARKETS.away_team_id_list.marketName][market.Id] = market;
                });
                break;
            }   

            case 5: { 
                forEach(liveMatches.Markets, market => {
                    extraMarkets['All'][market.Id] = market;

                    if (TENNIS_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[TENNIS_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (TENNIS_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[TENNIS_MARKETS.totals_id_list.marketName][market.Id] = market;
                    if (TENNIS_MARKETS.all_periods_id_list.marketIds.includes(market.Id))
                        extraMarkets[TENNIS_MARKETS.all_periods_id_list.marketName][market.Id] = market;
                    if (TENNIS_MARKETS.results_id_list.marketIds.includes(market.Id))
                        extraMarkets[TENNIS_MARKETS.results_id_list.marketName][market.Id] = market;
                    
                });
                break;
            }

            case 23: { 
                forEach(liveMatches.Markets, market => {
                    extraMarkets['All'][market.Id] = market;

                    if (VOLLYBALL_MARKETS.main_markets_id_list.marketIds.includes(market.Id))
                        extraMarkets[VOLLYBALL_MARKETS.main_markets_id_list.marketName][market.Id] = market;
                    if (VOLLYBALL_MARKETS.totals_id_list.marketIds.includes(market.Id))
                        extraMarkets[VOLLYBALL_MARKETS.totals_id_list.marketName][market.Id] = market;
                    if (VOLLYBALL_MARKETS.home_away_id_list.marketIds.includes(market.Id))
                        extraMarkets[VOLLYBALL_MARKETS.home_away_id_list.marketName][market.Id] = market;
                });
                break;
            }

            case 10: { 
                forEach(liveMatches.Markets, market => {
                    extraMarkets['All'][market.Id] = market;
                });
                break;
            }

            default: {
                forEach(Object.values(liveMatches.Markets), market => {
                    extraMarkets['All'][market.Id] = market;
                });
            }

        }
        return extraMarkets;
    }

    static isLoggedIn = () => {
        let access_token = window.localStorage.getItem('jwt_access_token')
            ? window.localStorage.getItem('jwt_access_token')
            : window.sessionStorage.getItem('jwt_access_token');
        if (!access_token) {
            return false;
        }
        const decoded = JwtDecode(access_token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.warn('access token expired');
            return false;
        } else {
            return true;
        }
    }
    static getAccessToken = () => {
        let access_token = window.localStorage.getItem('jwt_access_token')
            ? window.localStorage.getItem('jwt_access_token')
            : window.sessionStorage.getItem('jwt_access_token');

        let rememberMeChecked = window.localStorage.getItem('jwt_access_token') ? true : false;

        return { access_token, rememberMeChecked };
    };

    static isAuthTokenValid = (access_token) => {
        if (!access_token) {
            return false;
        }
        const decoded = JwtDecode(access_token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.warn('access token expired');
            return false;
        } else {
            return true;
        }
    };

    static isLoggedIn = () => {
        let access_token = window.localStorage.getItem('jwt_access_token')
            ? window.localStorage.getItem('jwt_access_token')
            : window.sessionStorage.getItem('jwt_access_token');
        if (!access_token) {
            return false;
        }
        const decoded = JwtDecode(access_token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.warn('access token expired');
            return false;
        } else {
            return true;
        }
    }

    static compareStrings = (a, b) => {
        a = a?.toLowerCase();
        b = b?.toLowerCase();
          return a > b ? 1 : b > a ? -1 : 0;
    };

    static compareNumbers = (a, b) => {
          return a > b ? 1 : b > a ? -1 : 0;
    };

    static handleRepeatedLogin(error) {
        if (error.data.detail && error.data.detail === 'repeated_login' ) {
            toastr.error('', 'You are already logged in on another device');
            setTimeout(() => {
            logoutUser();
            window.location.href = '/';
        }, 2000);
        } else if (error?.data?.non_field_errors && error?.data?.non_field_errors[0]) {
            // do not show any popup
            console.log(error?.data?.non_field_errors[0]);
        } else {
            toastr.error('', 'Session Expired');
            setTimeout(() => {
                logoutUser();
                window.location.href = '/';
            }, 2000);
        }
    }

    // static getFirestoreDB = (language) => {
    //     // for DE and TR language use 2nd firestore
    //     return (language === `de` || language === `tr`) ? db2 : db;
    // }

    static getBetTime = (sportId, Scoreboard) => {
        let time = Scoreboard && Scoreboard.Time ? Scoreboard.Time : 0;
        switch (sportId) {
            case 1: // Football
                // time = Math.ceil(time / 60);
                time = `${time}'`;

                if (Scoreboard && +Scoreboard.match_status === 31) {
                    time = 'HT'; // Break Time
                } else if (Scoreboard && +Scoreboard.match_status === 50) {
                    time = 'Pen'; // Penalties
                }
                if (Scoreboard && +Scoreboard.match_status === 41) {
                    time = 'OT 1HT'; // Penalties
                }
                if (Scoreboard && +Scoreboard.match_status === 42) {
                    time = 'OT 2HT'; // Penalties
                }
                break;
            case 2: //Basketball
                // time = Math.ceil(time / 60);
                time = `${time}'`;
                if (Scoreboard && +Scoreboard.match_status === 31) {
                    time = 'HT'; // Break Time
                } else if (Scoreboard && +Scoreboard.match_status === 40) {
                    time = 'OT'; // Over Time
                }
                // Betradar Quarter ids
                if (betradarConfig.quarterPeriods.indexOf(+Scoreboard?.match_status) > -1) {
                    time = `Q${betradarConfig.period[Scoreboard?.match_status]?.period_number} ${time}`;
                }
                break;
            case 4: // Ice Hockey
                // time = Math.ceil(time / 60);
                time = `${time}'`;
                if (Scoreboard && +Scoreboard.match_status === 31) {
                    time = 'HT'; // Break Time
                } else if (Scoreboard && +Scoreboard.match_status === 40) {
                    time = 'OT'; // Over Time
                } else if (Scoreboard && +Scoreboard.match_status === 50) {
                    time = 'Pen'; // Penalties
                } else if (Scoreboard && +Scoreboard.match_status === 301) {
                    time = 'FB'; // First break
                } else if (Scoreboard && +Scoreboard.match_status === 302) {
                    time = 'SB'; // second break
                }
                if (betradarConfig.iceHockeyPeriods.indexOf(+Scoreboard?.match_status) > -1) {
                    time = '';
                    time = `P${betradarConfig.period[Scoreboard.match_status]?.period_number || ''}`;
                }
                time = `P${Scoreboard?.match_status} ${time}`;
                break;
            case 5: // Tennis
                if (Scoreboard && +Scoreboard.match_status === 31) {
                    time = 'HT'; // Break Time
                } else if (Scoreboard && +Scoreboard.match_status === 60) {
                    time = 'Game';
                }
                // Betradar set ids
                if (betradarConfig.setPeriods.indexOf(+Scoreboard?.match_status) > -1) {
                    time = !isNaN(time) ? `Set ${betradarConfig.period[Scoreboard?.match_status]?.period_number}` : time;
                }
                break;
            case 23: // Volleyball
                if (Scoreboard && +Scoreboard.match_status === 31) {
                    time = 'HT'; // Break Time
                } else if (Scoreboard && +Scoreboard.match_status === 17) {
                    time = 'Golden Set';
                } else if (Scoreboard && +Scoreboard.match_status === 60) {
                    time = 'Game';
                }
                // Betradar set ids
                if (betradarConfig.setPeriods.indexOf(+Scoreboard?.match_status) > -1) {
                    time = !isNaN(time) ? `Set ${betradarConfig.period[Scoreboard?.match_status]?.period_number}` : time;
                }
                break;
            case 10: time = '';
                break;
        }
        return time;
    }
    static marketFormatter = (markets, fixtureId) => {
        let formattedMarkets = {};
        let marketName = {};
        let betObj = {};
        let globalSpecifier = null;
        markets.map((market) => {
            let outcomes = {};
            let formattedOutcomes = {};
            let mktStatus = market?.market_status;
            let mktId = market?.fixture_id?.split('^')[1] || 0;
            if ([16, 38, 39, 40, 66, 88, 165].indexOf(+mktId) > -1) return null; // temporarily comment till we get fix for these new markets, 16, 66, 88, 165 is for asian handicap
            if (market.outcomes) {
                let favoriteStatus = market?.fixture_status;
                outcomes = typeof(market.outcomes) === 'string' ? JSON.parse(market.outcomes) : market.outcomes;
                let specifier = null;
                let specifierStr = null;
                let [specKey, specValue ] = [];
                let line = null;
                if(market.fixture_id.split('^')[2]) {specifierStr = market.fixture_id.split('^')[2];}
                if (specifierStr){
                    const specifierArr = specifierStr.split('|') || [];
                    specifierArr.forEach(spec => {
                        [ specKey, specValue ] = spec.split('=');
                        if (!specifier) specifier = {};
                        specifier = { ...specifier, [specKey]: specValue };
                    });
                    if (specifier?.specKey == 'total' && isNaN(+specifier.specValue) && +specifier.specValue%1.0 !== 0.5) return null;
                    globalSpecifier = specifier;
                }
                forEach(outcomes, (outcome) => {
                    let { id, odds, active } = outcome;
                    let outcomesStatus = active;
                    if (+mktStatus !== lSportsConfig.marketStatus.active) outcomesStatus = mktStatus;
                    odds = isNaN(+odds) ? odds : Number(odds)?.toFixed(2);
                    if (+mktStatus === lSportsConfig.marketStatus.active && odds == 1.00) outcomesStatus = lSportsConfig.betStatus.suspended;
                    let outcomeNames = {};
                    if (STATIC_OUTCOME?.[id]) outcomeNames = { ...STATIC_OUTCOME[id]};
                    // else {
                    //     dynamoClient.query(getStaticOutcomes(id), (err, data) => {
                    //         if (err) {
                    //             console.log(err);
                    //         } else {
                    //             if (data?.Items[0] && data?.Items[0]?.outcome_full_object) {
                    //                 outcomeNames = { ...JSON.parse(data?.Items[0].outcome_full_object) };
                    //                 //FIXME: check at last // console.log('Need to add outcome ', outcomeNames);
                    //             }
                    //         }
                    //     });
                    // }
                    let betId = `id_${ fixtureId }_${ market.fixture_id.split('^')[1]}_${ id }`;
                    if (specKey && ['total', 'hcp', 'goalnr'].indexOf(specKey) > -1) {
                        betId = `id_${ fixtureId }_${ market.fixture_id.split('^')[1]}_${ id }_${ specValue }`;
                        line = isNaN(+specValue) ? specValue : +specValue;
                    } else if (specKey && [7, 61].indexOf(+mktId) > -1) { // for remaining match markets
                        betId = `id_${ fixtureId }_${ market.fixture_id.split('^')[1]}_${ id }_${ specValue }`;
                        line = isNaN(+specValue) ? specValue : +specValue;
                    } 
                    formattedOutcomes[betId] = {
                        Id: betId,
                        outcome_id: isNaN(+id) ? id : +id,
                        Price: odds,
                        Status: +outcomesStatus,
                        active: +active,
                        specifier,
                        Line: line,
                        BaseLine: line,
                        actualFixtureId: market?.fixture_id,
                        specifier_string: specifierStr, 
                        ...outcomeNames,
                    };
                });
            } else if (market.sport_event_status) {
                sessionStorage.setItem('liveScore', market.sport_event_status);
            }
            betObj['Bets'] = formattedOutcomes;
            marketName['Name'] = `name_${mktId}`;
            if (STATIC_MARKET[`id_${ mktId}`]) {
                marketName = { ...marketName, ...STATIC_MARKET[`id_${ mktId }`], Id: +mktId  };
            }
            // else {
            //     dynamoClient.query(getStaticMarkets(mktId), (err, data) => {
            //         if (err) {
            //             console.log(err);
            //         } else {
            //             if (data?.Items[0] && data?.Items[0]?.market_full_object) {
            //                 marketName = { ...marketName, ...JSON.parse(data?.Items[0].market_full_object), Id: +mktId };
            //                 //FIXME: check at last // console.log('Need to add market ', marketName);
            //             }
            //         }
            //     });
            // }
            // if(formattedMarkets[`id_${ mktId}`]) console.log('markets ', market.fixture_id, formattedMarkets);
            if(formattedMarkets[`id_${ mktId}`]?.Bets && market.outcomes) {
                let Bets = formattedMarkets[`id_${ mktId}`].Bets;
                formattedMarkets[`id_${ mktId}`] = { Bets: {...Bets, ...betObj.Bets }, ...marketName };
            } else {
                formattedMarkets[`id_${ mktId}`] = { ...betObj, ...marketName };
            }
        });
        return formattedMarkets;
    }

    static partialMatchFormatter = (Items, lan = 'fr', defaultMktObj) => {
        let allItems = Items.map(match => {
            if (defaultMktObj) match.market = defaultMktObj;
            match.market_count = 0;
            match.livescore = {};
            match.participant_one_full = (typeof match.participant_one_full === 'string') ? JSON.parse(match.participant_one_full) : match.participant_one_full;
            match.participant_two_full = (typeof match.participant_two_full === 'string') ? JSON.parse(match.participant_two_full) : match.participant_two_full;
            match.participants = [{ ...match.participant_one_full, Name: match.participant_one_full[`name_${ lan }`]}, { ...match.participant_two_full, Name: match.participant_two_full[`name_${ lan }`]}];
            const leagueNames = JSON.parse(match.league);
            match.league = { ...leagueNames, Id: match?.league_id.toString(), Name: leagueNames[`name_${ lan }`] || leagueNames.name_en };
            if(match.location) {
                const locationNames = JSON.parse(match.location);
                match.location = { ...locationNames, Id: match?.location_id.toString(), Name: locationNames[`name_${ lan }`] || locationNames.name_en };
            }
        return match;
        });
        return allItems;
    }

    static checkContains = (updatedName, signs) => {
        var value = 0;
        signs.forEach(function(sign){
            value = value + updatedName.includes(sign);
        });
        return (value === 1);
    }

    static outcomeFormatter = (name, specifier = {}, variantId, lan = 'name_en') => {
        let updatedName = '';
        if (!name && specifier) { 
            Object.keys(specifier).map((key) => {
                let outcomeVariant = `sr${variantId.split('_sr')[1]}`;
                let variantName = marketVariant[specifier.variant].outcomes[outcomeVariant];
                let outcome = variantId.split(':');
                outcome = STATIC_OUTCOME[ outcome[outcome.length - 1]];
                updatedName = outcome && outcome[lan];
                name = variantName;
                updatedName = '';
            });
        }
        if (!name || !name.includes('{')) {
            if(lan == 'name_tr') {
                const trUnderOver = {
                    under: 'Alt',
                    over: 'Üst'
                };
                name = replace(name, /\b(?:under|over)\b/g, matched => trUnderOver[matched]);
            } else if(lan == 'name_nl') {
                const nlUnderOver = {
                    under: 'Onder',
                    over: 'Over' // same
                };
                name = replace(name, /\b(?:under|over)\b/g, matched => nlUnderOver[matched]);
            } else if(lan == 'name_de') {
                const deUnderOver = {
                    under: 'Unter',
                    over: 'Über'
                };
                name = replace(name, /\b(?:under|over)\b/g, matched => deUnderOver[matched]);
            } else if(lan == 'name_ru') {
                const ruUnderOver = {
                    under: 'под',
                    over: 'над'
                };
                name = replace(name, /\b(?:under|over)\b/g, matched => ruUnderOver[matched]);
            }
            return replace(name, /\b(?:draw|berabere|gelijkspel|unentschieden|ничья)\b/g, ' X ');
        }
        for(let i=0;i<name.length;i++) {
            if (name[i] == '{'){
                let sub = '';
                while (name[i] != '}') {
                    sub += name[i];
                    i++;
                }
                sub += '}';
                if (name[i+1] == '}') { 
                    sub += '}';
                    i++;
                }
                let specifierNames = specifier != null && Object.keys(specifier);
                if (specifierNames && specifierNames?.length > 0) {
                    specifierNames.map((spfr) => {
                        switch (sub) {
                            case `{${spfr}}`:
                            case `{%${spfr}}`:
                            case `{!${spfr}}`:
                            case `{$${spfr}}`:
                                updatedName += specifier[spfr];
                                break;
                            case `{+${spfr}}`:
                                updatedName += `+${ specifier[spfr] }`;
                                break;
                            case `{-${spfr}}`:
                                updatedName += `-${ specifier[spfr] }`;
                                break;
                            case '{$competitor1}':
                                updatedName += ' 1 ';
                                break;
                            case '{$competitor2}':
                                updatedName += ' 2 ';
                                break;                          
                            default :
                                // if (name.substring(spfr)){
                                //     updatedName += sub;
                                // }
                                break;
                                        
                        }
                    });
                } else {
                    switch (sub) {
                        case '{$competitor1}':
                            updatedName += ' 1 ';
                            break;
                        case '{$competitor2}':
                            updatedName += ' 2 ';
                            break;
                        default:
                            updatedName += sub;
                            break;
                    }
                }
            } else {
                updatedName += name[i];
            }
        }
        const signs = ['++', '--', '+-', '-+'];
        if(this.checkContains(updatedName, signs)){
            updatedName = replace(updatedName, '++', '+');
            updatedName = replace(updatedName, '--', '+');
            updatedName = replace(updatedName, '+-', '-');
            updatedName = replace(updatedName, '-+', '-');
        }
        if(lan == 'name_tr') {
            const trUnderOver = {
                under: 'Alt',
                over: 'Üst'
            };
            updatedName = replace(updatedName, /\b(?:under|over)\b/g, matched => trUnderOver[matched]);
        } else if(lan == 'name_nl') {
            const nlUnderOver = {
                under: 'Onder',
                over: 'Over' // same
            };
            updatedName = replace(updatedName, /\b(?:under|over)\b/g, matched => nlUnderOver[matched]);
        } else if(lan == 'name_de') {
            const deUnderOver = {
                under: 'Unter',
                over: 'Über'
            };
            updatedName = replace(updatedName, /\b(?:under|over)\b/g, matched => deUnderOver[matched]);
        } else if(lan == 'name_ru') {
            const ruUnderOver = {
                under: 'под',
                over: 'над'
            };
            updatedName = replace(updatedName, /\b(?:under|over)\b/g, matched => ruUnderOver[matched]);
        }
        return replace(updatedName, /\b(?:draw|berabere|gelijkspel|unentschieden|ничья)\b/g, ' X ');
    }

    static marketNameFormatter = (name, specifier = {}, participants = ['Home', 'Away']) => {
        if (!name && specifier) { return Object.values(specifier)[ 0 ]; }
        if (!name || !name.includes('{')) return name;
        let updatedName = '';
        for(let i=0;i<name.length;i++) {
            if (name[i] == '{'){
                let sub = '';
                while (name[i] != '}') {
                    sub += name[i];
                    i++;
                }
                sub += '}';
                if (name[i+1] == '}') { 
                    sub += '}';
                    i++;
                }
                let specifierNames = specifier != null && Object.keys(specifier);
                if (specifierNames && specifierNames?.length > 0) {
                    specifierNames.forEach((spfr) => {
                        switch (sub) {
                            case `{${spfr}}`:
                            case `{%${spfr}}`:
                            case `{!${spfr}}`:
                            case `{$${spfr}}`:
                                updatedName += specifier[spfr];
                                break;
                            // case `{+${spfr}}`:
                            //     updatedName += `+${ specifier[spfr] }`;
                            //     break;
                            // case `{-${spfr}}`:
                            //     updatedName += `-${ specifier[spfr] }`;
                            //     break;
                            case '{$competitor1}':
                                updatedName += participants[0];
                                break;
                            case '{$competitor2}':
                                updatedName += participants[1];
                                break;                          
                            default :
                                // if (name.substring(spfr)){
                                //     updatedName += sub;
                                // }
                                break;
                                        
                        }
                    });
                } else {
                    switch (sub) {
                        case '{$competitor1}':
                            updatedName += participants[0];
                            break;
                        case '{$competitor2}':
                            updatedName += participants[1];
                            break;
                        default:
                            updatedName += sub;
                            break;
                    }
                }
            } else {
                updatedName += name[i];
            }
        }
        return updatedName;
    }
}

export default Util;
