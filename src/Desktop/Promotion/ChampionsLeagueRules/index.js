import React from 'react';
import PromotionDetails from '../PromotionDetails';
import ChampionsLeagueRulesResult from './ChampionsLeagueRulesResult';
import Sports from '../../Home/Sports';
function ChampionsLeagueRules() {
    return (
        <React.Fragment>
            {/* <TopLinks />           */}
            <div className="middle-part sport-middle d-flex">
                <div id='side-navbar' className="side-navbar fade1">
                    <nav className="side-multilevel">
                        <Sports />
                    </nav>
                </div>
                <ChampionsLeagueRulesResult/>
                <PromotionDetails />
            </div>               
        </React.Fragment>
    );
}


export default ChampionsLeagueRules;
