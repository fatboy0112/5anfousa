import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { Translate } from '../../localization';
import Grid from '@material-ui/core/Grid';

function KeyPadComponent(props) {
    let { result, onClickCalAction, possibleWin, userData } = props;
    let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';
    return (
        <div className="container pb-3">
            <div className="fs-15 d-flex align-items-center justify-content-between py-1 px-2 text-white">
                <span>{Translate.possibleWin}</span>
                <p className="text-right font-weight-semibold m-0 text-white">
                    {possibleWin} <span className="text-white">{currency}</span>
                </p>
            </div>

            <div className="fs-20 bg-white br-5 p-2 d-flex align-items-center justify-content-between">
                <span className="pl-1">{Translate.amount}</span>
                <p className="text-right font-weight-semibold m-0 pr-1">
                    {result ? Util.toFixedDecimal(result) : '0.00'} <span className="text-gray-light">{currency}</span>
                </p>
            </div>

            <Grid container className="fs-20 text-white text-center width-auto mx-0 my-2">
                <Grid item xs className="default-bet-btn bg-green br-5 mr-1 mt-1" id="1" name="1" onClick={onClickCalAction}>
                    1
                </Grid>
                <Grid item xs className="default-bet-btn bg-green br-5 mr-1 mt-1" id="5" name="5" onClick={onClickCalAction}>
                    5
                </Grid>
                <Grid item xs className="default-bet-btn bg-green br-5 mr-1 mt-1" id="10" name="10" onClick={onClickCalAction}>
                    10
                </Grid>
                <Grid item xs className="default-bet-btn bg-green br-5 mr-1 mt-1" id="5" name="5" onClick={onClickCalAction}>
                    50
                </Grid>
                <Grid item xs className="default-bet-btn bg-green br-5 mr-1 mt-1" id="100" name="100" onClick={onClickCalAction}>
                    100
                </Grid>
                <Grid item xs className="default-bet-btn bg-green br-5 mr-1 mt-1" id="500" name="500" onClick={onClickCalAction}>
                    500
                </Grid>
            </Grid>

            <table className="calc-table">
                <tbody>
                    <tr>
                        <td width="25%" id="7" name="7" onClick={onClickCalAction}>
                            <div className="btn-back">7</div>
                        </td>
                        <td width="25%" id="8" name="8" onClick={onClickCalAction}>
                            <div className="btn-back">8</div>
                        </td>
                        <td width="25%" id="9" name="9" onClick={onClickCalAction}>
                            <div className="btn-back">9</div>
                        </td>
                        <td rowSpan="2" width="25%" id="*" name="*" onClick={onClickCalAction}>
                            <div className="text-center bg-white mul-btn">
                                <div className="mul-btn_height btn-back">
                                    <i className="material-icons">backspace</i>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td width="25%" id="4" name="4" onClick={onClickCalAction}>
                            <div className="btn-back">4</div>
                        </td>
                        <td width="25%" id="5" name="5" onClick={onClickCalAction}>
                            <div className="btn-back">5</div>
                        </td>
                        <td width="25%" id="6" name="6" onClick={onClickCalAction}>
                            <div className="btn-back">6</div>
                        </td>
                    </tr>
                    <tr>
                        <td width="25%" id="1" name="1" onClick={onClickCalAction}>
                            <div className="btn-back">1</div>
                        </td>
                        <td width="25%" id="2" name="2" onClick={onClickCalAction}>
                            <div className="btn-back">2</div>
                        </td>
                        <td width="25%" id="3" name="3" onClick={onClickCalAction}>
                            <div className="btn-back">3</div>
                        </td>
                        <td rowSpan="2" width="25%" id="=" name="=" onClick={onClickCalAction}>
                            <div className="mul-btn_height btn-back">{Translate.ok}</div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" width="50%" id="0" name="0" onClick={onClickCalAction}>
                            <div className="btn-back">0</div>
                        </td>
                        <td width="25%" id="." name="." onClick={onClickCalAction}>
                            <div className="btn-back">.</div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

KeyPadComponent.propTypes = {
    result: PropTypes.string,
    onClickCalAction: PropTypes.func,
    possibleWin: PropTypes.string,
    language: PropTypes.string,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
        userData: state.user.data,
    };
};
export default connect(mapStateToProps)(KeyPadComponent);
