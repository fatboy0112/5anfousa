import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { format, parseISO } from 'date-fns';
import Util from '../../helper/Util';
import { Translate } from '../../localization';

function Betslip(props) {
    const handleClick = (e) => {
        e.preventDefault();
        props.openBetslipModal(props.betslip);
    };

    let { betslip, userData } = props;
    let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';    
    let statusText = Translate[betslip.status];
    let statusStyle = 'bl-darkgray-6';
    let possible_win = <span className="fs-18">-</span>;
    let win_amount = <span className="fs-18">-</span>;
    let statusTextStyle = '';

    if (betslip.status === 'in game') {
        statusStyle = 'ingame';
        possible_win = Util.toFixedDecimal(betslip.possible_win) + ' ' + currency;
    } else if (betslip.status === 'lost') {
        statusStyle = 'lost';
        statusTextStyle = 'text-red-dark';
        win_amount = '0.00 ' + currency;
    } else if (betslip.status === 'won') {
        statusStyle = 'win';
        statusTextStyle = 'text-green';
        win_amount = Util.toFixedDecimal(betslip.possible_win) + ' ' + currency;
    } else if (betslip.status === 'refund') {
        statusStyle = 'refund';
    }  else if (betslip.status === 'cashout') {
        statusStyle = 'cashout';
        possible_win = '-';
        win_amount = Util.toFixedDecimal(betslip.cashout_amount) + ' ' + currency;
    }

    return (
        <>
            <tr onClick={handleClick} className={statusStyle}>
                <td>
                    <div className={`mybet__date ${statusStyle}`}>
                        <div>
                            <time>{format(parseISO(betslip.created), 'dd/MM/yy kk:mm')}</time>
                        </div>
                    </div>
                </td>
                <td>
                    {Util.toFixedDecimal(betslip.amount)} {currency}
                </td>
                <td className="text-black">{possible_win}</td>
                <td>{win_amount}</td>
                <td className={`text-capitalize`}>
                    <span className={`${statusStyle}`}>
                        {statusText}
                    </span>
                </td>
            </tr>
        </>
    );
}

Betslip.propTypes = {
    betslip: PropTypes.object,
    language: PropTypes.string,
    openBetslipModal: PropTypes.func,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
        userData: state.user.data,
    };
};

export default connect(mapStateToProps)(Betslip);
