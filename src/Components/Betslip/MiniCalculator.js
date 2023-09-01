import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import Util from '../../helper/Util';
import Grid from '@material-ui/core/Grid';
import { setMultiStake, setBetStake } from '../../store/actions/betslip.actions';

const defaultOptions = [1, 5, 10, 50, 100, 500];

function MiniCalculator(props) {
    const handleSetStake = (value) => {
        let { type } = props;
        if (type === 'multiple') {
            props.setMultiStake(value);
        } else if (type === 'single') {
            props.setBetStake(value);
        }
    };

    let { openCalculator, multiStake, singleStake, type, userData } = props;
    let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';    
    let stackAmount;

    if (type === 'multiple') {
        stackAmount = Util.toFixedDecimal(multiStake);
    } else if (type === 'single') {
        stackAmount = Util.toFixedDecimal(singleStake);
    }

    let options = map(defaultOptions, (option, i) => {
        let id = i + 1;
        let activeClass = +stackAmount === option ? 'cal-btn_active' : '';

        return (
            <Grid
                item
                xs={2}
                key={i}
                className={`cal-btn mr-1 ${activeClass}`}
                onClick={(e) => {
                    e.preventDefault();
                    handleSetStake(option);
                }}
            >
                <div id={id}>{option}</div>
            </Grid>
        );
    });

    return (
        <Grid container className="p-2 pt-2 betslip__panel mx-auto">
            <Grid item xs={12} className="mx-auto d-flex pr-0 pl-0">
                {options}
            </Grid>
            <Grid item xs={12} className="ml-0 mx-auto d-flex pl-0 pr-0 flex align-items-center justify-content-end betslip__panel-amount">
                <div className="mr-1">{currency}</div>
                <div className="btn-cal_white px-1 flex-grow-1 stake__input my-2">
                    <div className="input-item" onClick={openCalculator}>
                        {stackAmount}
                    </div>
                </div>
            </Grid>
        </Grid>
    );
}

MiniCalculator.propTypes = {
    openCalculator: PropTypes.func,
    type: PropTypes.string,
    multiStake: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    singleStake: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setMultiStake: PropTypes.func,
    setBetStake: PropTypes.func,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        multiStake: state.betslip.multiStake,
        singleStake: state.betslip.singleStake,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setMultiStake: (value) => dispatch(setMultiStake(value)),
        setBetStake: (value) => dispatch(setBetStake(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MiniCalculator);
