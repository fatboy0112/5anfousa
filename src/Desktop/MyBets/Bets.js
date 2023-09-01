import React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash.map';
import { connect } from 'react-redux';
import { format, parseISO } from 'date-fns';
import Util from '../../helper/Util';
import { Translate } from '../../localization';
import Grid from '@material-ui/core/Grid';
import Bet from './Bet';

function Bets(props) {
    let { singleBetslip, betslip, userData } = props;
    let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';
    let drawBets = map(singleBetslip.bets, (bet, index) => {
        return <Bet betslipStatus={singleBetslip.betslip_status} bet={bet} key={index} />;
    });

    let betType = singleBetslip.bet_type === 1 ? 'single' : 'multiple';
    let singleBetslip_odd = singleBetslip.multi_price === '0.00' ? singleBetslip.bets[0].price : singleBetslip.multi_price;

    let possible_win;
    let win_amount;

    if (betslip.status === 'in game') {
        possible_win = Util.toFixedDecimal(betslip.possible_win) + ' ' + currency;
    } else if (betslip.status === 'lost') {
        win_amount = '0.00 ' + currency;
    } else if (betslip.status === 'won') {
        win_amount = Util.toFixedDecimal(betslip.possible_win) + ' ' + currency;
    }

    let betNumber = singleBetslip.bet_type === 2 ? singleBetslip.bets.length : '';
    let showBonus = betslip.has_bonus;
    
    let isRefund;
    if(betslip.status === 'refund'){
        isRefund = true;
    }
    else{
        let check = true;
        singleBetslip.bets.forEach((bet) => {
            if(bet.settlement_status !== 3){
                check = false;
            }
        });
        isRefund = check;
    }
    return (
        <div className="mybet__popup-content">
            <div className="px-2">
                <Grid container className="mx-auto text-gray px-2 pb-2">
                    <Grid item xs={8} className="p-0 text-capitalize print_color">
                        {Translate[betType]} {betNumber}
                    </Grid>
                    <Grid item xs={3} className="p-0 text-center">
                        <time className='print_color'>{format(parseISO(singleBetslip.created), 'dd/MM/yy')}</time>
                    </Grid>
                    <Grid item xs={1} className="p-0 text-right">
                        <time className='print_color'>{format(parseISO(singleBetslip.created), 'kk:mm')}</time>
                    </Grid>
                </Grid>
            </div>

            <div className="mybet__divider"></div>

            {drawBets}

            <Grid container className="mx-auto text-gray px-2 pt-2 pb-4">
                {!isRefund && <Grid xs={12} item className="p-0 pt-0 pr-2 d-flex align-items-center justify-content-between">
                    <span className='print_color'>{Translate.totalOdd}</span> <span className='print_color'>{singleBetslip_odd}</span>
                </Grid>}
                <Grid xs={12} item className="p-0 pt-0 pr-2 d-flex align-items-center justify-content-between">
                    <span className='print_color'>{Translate.totalStake}</span>{' '}
                    <span className='print_color'>
                        {singleBetslip.amount} {currency}
                    </span>
                </Grid>
                <Grid xs={12} item className="p-0 pt-0 pr-2 d-flex align-items-center justify-content-between print_color">
                    {!isRefund && possible_win && (
                        <>
                            <span className="text-black print_color">{Translate.possibleWin}</span>
                            {showBonus && <span className="mybet__bonus text-black print_color">+ 10% Bonus</span>}
                            <span className="text-black print_color">{possible_win}</span>
                        </>
                    )}
                    {win_amount && (
                        <>
                            <span className={betslip.status === 'won' && 'font-weight-bolder text-black print_color'}>{Translate.totalWin}</span>
                            {showBonus && <span className="mybet__bonus print_color">+ 10% Bonus</span>}
                            <span className={betslip.status === 'won' && 'font-weight-bold text-black print_color'}>{win_amount}</span>
                        </>
                    )}
                </Grid>
            </Grid>
        </div>
    );
}

Bets.propTypes = {
    singleBetslip: PropTypes.object,
    betslip: PropTypes.object,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
    };
};

export default connect(mapStateToProps)(Bets);
