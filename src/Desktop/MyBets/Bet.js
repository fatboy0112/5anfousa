import React from 'react';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import { Translate } from '../../localization';
import Grid from '@material-ui/core/Grid';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import { STATIC_MARKET } from '../../config/staticMarket';

function Bet(props) {
    let { bet, betslipStatus } = props;
    let statusStyle = 'bl-darkgray-8';

    
    if (bet.settlement_status === null) {
        statusStyle = 'bl-yellow-8';
    } else if (bet.settlement_status === 1) {
        statusStyle = 'bl-red-8';
    } else if (bet.settlement_status === 2) {
        statusStyle = 'bl-green-8';
    }

    let betStatus = null;
    if (bet.event_status === lSportsConfig.statuses.inplay ){ 
        betStatus = <span className="live-icon lg">{Translate.live}</span>; 
    }
    else if(bet.settlement_status === 1){
        betStatus = <span className="lost-icon lg">{Translate.lost}</span>;
    }
    else if(bet.settlement_status === 2){
        betStatus = <span className="won-icon lg">{Translate.won}</span>;
    }
    else if(bet.settlement_status === 3){
        betStatus = <span className="refund-icon lg">Refund</span>;
    }
    else if(bet.settlement_status === 4){
        betStatus = <span className="lost-icon lg">Half Lost</span>;
    }
    else if(bet.settlement_status === 5){
        betStatus = <span className="won-icon lg">Half Won</span>;
    }
    else if(bet.settlement_status === -1  || bet.settlement_status === 6){
        betStatus = <span className="refund-icon lg">Cancelled</span>;
    }
    else if(bet.settlement_status === null){
        betStatus = <span className="ingame-icon lg">{Translate['in game']}</span>;
    }
    
//     if (betslipStatus === 'cashout') {
        
//         let newBetStatus = <span className="d-flex justify-content-between">
//             {betStatus}
//             <span className="cashout-icon sm">{Translate.cashout}</span>
//         </span>;
    
//        betStatus = newBetStatus;         
// }

    let bet_line = bet.bet_line ? '(' + bet.bet_line + ')' : null;
    const results = bet.match_result ? typeof bet.match_result == 'string' ? JSON.parse(bet.match_result) : bet.match_result : {};
    let oddType =  localStorage.getItem('oddType') ?  localStorage.getItem('oddType') : '';

    let specifier;
    const specifierArr = bet?.specifiers?.split('|') || [];
    specifierArr.forEach(spec => {
        let [ specKey, specValue ] = spec.split('=');
        if (!specifier) specifier = {};
        specifier = { ...specifier, [specKey]: specValue };
    });
    return (
        <div>
            <div className={'py-2 pr-2 ' + statusStyle}>
                <Grid container className="m-0 p-0 px-2">
                    <Grid item xs={betslipStatus === 'cashout' ? 5 : 7} className="p-0 text-gray-dark ellipsis print_color">
                        {bet.league_name}
                    </Grid>
                    <Grid item xs={3} className="p-0 text-right">
                        {bet?.score?.livescore && bet?.score?.livescore?.home_score && (
                            <span className='mybet__score font-weight-bold print_color'>
                                {`${bet?.score?.livescore?.home_score || ''}:${bet?.score?.livescore?.away_score || ''}`}
                            </span>
                        )}
                        {bet?.score?.clock?.match_time && (
                            <span className='ml-1 mybet__score font-weight-bold print_color'>
                                {Util.getBetTime(bet.sport_id, bet.score)}
                            </span>
                        )}
                    </Grid>
                    <Grid item xs={2} className="p-0 text-right">
                        {betStatus}
                    </Grid>
                    { betslipStatus === 'cashout' && <Grid item xs={2} className="p-0 text-right">
                        <span className="cashout-icon sm">{Translate.cashout}</span>
                    </Grid> }
                </Grid>

                <Grid container className="m-0 p-0 px-2">
                    <Grid item xs={8} className="p-0 pt-1 pr-2 mybet__popup-text text-gray-darker">
                        <p className="ellipsis m-0 print_color">{bet.participants[0].participant.name}</p>
                        <p className="ellipsis m-0 print_color">{bet.participants[1].participant.name}</p>
                    </Grid>
                    <>
                        <Grid item xs={3} className="p-0 pt-1 text-green mybet__popup-text text-center">
                            <p className="m-0 print_color">{results?.home_score || 0}</p>
                            <p className="m-0 print_color">{results?.away_score || 0}</p>
                        </Grid>
                        <Grid item xs={1} className="p-0 pt-1 text-right mybet__popup-text print_color">
                            {Util.toFixedDecimal(bet.price, oddType)}
                        </Grid>
                    </>
                </Grid>

                <Grid container className="m-0 p-0 px-2">
                    <Grid item xs={8} className="p-0 pt-1 text-green">
                        <span className="print_color">{Translate.tip} {bet.name}</span>
                        {/* {bet_line}: {bet.market_name} */}
                        <span className="print_color">{ ' : ' }</span>
                        <span className="print_color">{Util.marketNameFormatter(STATIC_MARKET[`id_${ bet.market_id }`].name_en, specifier || {}, [bet.participants[0]?.participant?.name, bet.participants[1]?.participant?.name])}</span>
                    </Grid>
                    <Grid item xs={3} className="p-0 pt-1 text-gray text-center">
                        <time className="print_color">{format(parseISO(bet.start_date), 'dd/MM/yy')}</time>
                    </Grid>
                    <Grid item xs={1} className="p-0 pt-1 text-gray text-right">
                        <time className="print_color">{format(parseISO(bet.start_date), 'kk:mm')}</time>
                    </Grid>
                </Grid>
            </div>
            <div className="mybet__divider"></div>
        </div>
    );
}

Bet.propTypes = { 
    bet: PropTypes.object,
};

export default Bet;
