import React from 'react';
import { marketIds } from '../../config/markets';

const getOdds = (bets, market, count) => {
    if (market.Id === 415) {
        const result =
            count === 1 ? (
                <div className="odds-head">
                    <div className="odd-name blank-odd">&nbsp;</div>
                    <div className="odd-name">1</div>
                    <div className="odd-name">X</div>
                    <div className="odd-name">2</div>
                </div>
            ) : null;
        return result;
    } else if ([128, 134, 145, 146, 147, 148, 149, 150, 163].indexOf(market.Id) > -1) {
        return (
            <div className="odds-head">
                {bets.map((bet) => (
                    <div className="odd-name">{bet.Name}</div>
                ))}
            </div>
        );
    } else if (market.Id === 427) {
        const result =
            count === 1 ? (
                <div className="odds-head">
                    <div className="odd-name blank-odd">&nbsp;</div>
                    <div className="odd-name blank-odd">&nbsp;</div>
                    <div className="odd-name">1</div>
                    <div className="odd-name">X</div>
                    <div className="odd-name">2</div>
                </div>
            ) : null;
        return result;
    } else if (market.Id === 95 || market.Id === 250) {
        const result =
            count === 1 ? (
                <div className="odds-head">
                    <div className="odd-name blank-odd">&nbsp;</div>
                    <div className="odd-name">1</div>
                    <div className="odd-name">2</div>
                </div>
            ) : null;
        return result;
    } else if (market.Id === marketIds.teamWinRest || market.Id === marketIds.firstHalfTeamWinRest || market.Id === marketIds.handicap) {
        const result =
            count === 1 ? (
                <div className="odds-head">
                    <div className="odd-name blank-odd">&nbsp;</div>
                    <div className="odd-name">1</div>
                    <div className="odd-name">X</div>
                    <div className="odd-name">2</div>
                </div>
            ) : null;
        return result;
    } else if (market.Id === 59 || market.Id === 338 || market.Id === 339) {
        const result =
            count === 1 ? (
                <div className="odds-head">
                    <div className="odd-name blank-odd">&nbsp;</div>
                    <div className="odd-name">1</div>
                    <div className="odd-name">2</div>
                    <div className="odd-name">No Goal</div>
                </div>
            ) : null;
        return result;
    } else if (market.Name?.indexOf(`Under/Over`) > -1 || market.Id === 11) {
        const result =
            count === 1 ? (
                <div className="odds-head">
                    <div className="odd-name blank-odd">&nbsp;</div>
                    <div className="odd-name">Under</div>
                    <div className="odd-name">Over</div>
                </div>
            ) : null;
        return result;
    } else if (market.Id === 1563) {
        const result =
            count === 1 ? (
                <div className="odds-head">
                    <div className="odd-name blank-odd">&nbsp;</div>
                    <div className="odd-name">Before</div>
                    <div className="odd-name">Not Before</div>
                </div>
            ) : null;
        return result;
    } else
        return (
            <div className="odds-head">
                {bets[0].BaseLine && count === 1 ? <div className="odd-name blank-odd">&nbsp;</div> : null}
                {bets.map((bet) => (
                    <div key={bet.Id} className="odd-name">{bet.Name}</div>
                ))}
            </div>
        );
};

const BetHeading = (props) => {
    let { bets, market, count } = props;
    let oddName = getOdds(bets, market, count);
    return oddName;
};

export default React.memo(BetHeading);