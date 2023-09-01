import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { setMultiStake, setBetStake } from '../../store/actions/betslip.actions';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

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

    let { openCalculator, multiStake, singleStake, type } = props;
    let stackAmount;

    const onInputChange =(e)=>{
        e.preventDefault();
        let { type } = props;
        let value = e.target.value;
        value = Util.toSetBetAmount(value);
        if ((value.match(/\./g) || []).length > 1 || value.split('.')?.[0].length > 6 || value.length > 9) return null;
        if (type === 'multiple') {
            props.setMultiStake(value);
        } else if (type === 'single') {
            props.setBetStake(value);
        }
    }

    if (type === 'multiple') {
        stackAmount = Util.toSetBetAmount(multiStake);
    } else if (type === 'single') {
        stackAmount = Util.toSetBetAmount(singleStake);
    }

    // let options = map(defaultOptions, (option, i) => {
    //     let id = i + 1;
    //     let activeClass = +stackAmount === option ? 'active' : '';
    //     let option1 = +stackAmount === option ? 0 : option;

    //     return (
    //         <li
    //             key={i}
    //             className={`${activeClass}`}
    //             onClick={(e) => {
    //                 e.preventDefault();
    //                 props.closeModal();
    //                 handleSetStake(option1);
    //             }}
    //         >
    //             <a href id={id}>{option}</a>
    //         </li>
    //     );
    // });

    return (
        <React.Fragment >
            <div className="calc_wrapper">
                <div className="calc_inp" onClick={openCalculator} >
                    <input type='text' value={ stackAmount} onKeyPress={(e)=>isNaN(e.key) && e.key !== '.' ? e.preventDefault() : e.key} onChange={onInputChange}/>
                </div>
                <GridList cols={6}>
                    {defaultOptions.map((item,id) => {
                        let option1 = +stackAmount === item ? 0 : item;
                        let activeClass = +stackAmount === item ? 'active' : '';
                    return (
                        <GridListTile key={id} className={ `calc_grid ${activeClass}`} 
                        onClick={(e) => {
                        e.preventDefault();
                        props.closeModal();
                        handleSetStake(option1);
                    }}>
                            <span>{item}</span>
                        </GridListTile>
                    );
                })}
                </GridList>
                {/* <ul>
                    {options}
                    <li onClick={openCalculator}>
                        <input type='text' value={ stackAmount} onKeyPress={(e)=>isNaN(e.key) && e.key !== '.' ? e.preventDefault() : e.key} onChange={onInputChange}/>
                    </li>
                </ul> */}
                {/* <Grid item xs={4} className="ml-0 mx-auto d-flex pl-0 pr-0 flex align-items-center justify-content-end betslip__panel-amount">
                    <div className="mr-1">{currency}</div>
                    <div className="btn-cal_white px-1 flex-grow-1">
                        <div className="input-item" onClick={openCalculator}>
                            {stackAmount}
                        </div>
                    </div>
                </Grid> */}
            </div>
        </React.Fragment>
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
