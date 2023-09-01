import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import Util from '../../helper/Util';
// import { Translate } from '../../localization';
// import Grid from '@material-ui/core/Grid';

function KeyPadComponent(props) {
    let { onClickCalAction } = props;
    return (
        <div className="calc-custom">
            <ul>
                <li id="1" name="1" onClick={onClickCalAction}><a href>1</a></li>
                <li id="2" name="2" onClick={onClickCalAction}><a href>2</a></li>
                <li id="3" name="3" onClick={onClickCalAction}><a href>3</a></li>
                <li id="4" name="4" onClick={onClickCalAction}><a href>4</a></li>
                <li id="5" name="5" onClick={onClickCalAction}><a href>5</a></li>
                <li id="6" name="6" onClick={onClickCalAction}><a href>6</a></li>
                <li id="7" name="7" onClick={onClickCalAction}><a href>7</a></li>
                <li id="8" name="8" onClick={onClickCalAction}><a href>8</a></li>
                <li id="9" name="9" onClick={onClickCalAction}><a href>9</a></li>
                <li id="." name="." onClick={onClickCalAction}><a href>.</a></li>
                <li id="0" name="0" onClick={onClickCalAction}><a href>0</a></li>
                <li id="*" name="*" onClick={onClickCalAction}><a href>
                    <img src="/images/cross-white.png" alt="cross-white" /> 
                    <img className="hover" src="/images/cross.png" alt="cross" /></a>
                </li>
            </ul>
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
