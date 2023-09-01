import React from 'react';
import FirstDepositBonusResult from './FirstDepositBonusResult';
import TopLinks from '../../TopLinks';
import TopLeague from '../../TopLeague';
import PromotionDetails from '../PromotionDetails';
import Sports from '../../Home/Sports';

function FirstDepositBonus() {
    return (
        <React.Fragment>
            {/* <TopLinks />                */}
            <div className="middle-part sport-middle d-flex">
                <div id='side-navbar' className="side-navbar fade1">
                    <nav className="side-multilevel">
                        <Sports />
                    </nav>
                </div>
                <FirstDepositBonusResult/>
                <PromotionDetails />
            </div>               
        </React.Fragment>
    );
}


export default FirstDepositBonus;
