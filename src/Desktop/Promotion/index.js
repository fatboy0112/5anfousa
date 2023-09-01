import React from 'react';
import PromotionDetails from './PromotionDetails';
import PromotionBanners from './PromotionBanners';
import Sports from '../Home/Sports';

function Promotion() {
    return (
        <React.Fragment>
            {/* <TopLinks />                */}
            <div className="middle-part sport-middle d-flex">
                <div id='side-navbar' className="side-navbar fade1">
                    <nav className="side-multilevel">
                        <Sports />
                    </nav>
                </div>
                <PromotionBanners/>
                <PromotionDetails />
            </div>               
        </React.Fragment>
    );
}


export default Promotion
