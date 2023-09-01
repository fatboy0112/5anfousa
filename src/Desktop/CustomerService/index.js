import React  from 'react';
import TopLinks from '../TopLinks';
import SportList from '../Home/Sports.js';
import CustomerServiceDetails from './CustomerServiceDeatils.js';
import PromotionDetails from './PromotionDetails.js';
import { connect } from 'react-redux';

const CustomerService = () =>{
     return (
         <React.Fragment>
             <TopLinks />               
             <div className="middle-part sport-middle d-flex">
                 <div id='side-navbar' className="side-navbar fade1">
                     <nav className="side-multilevel">
                         <SportList />
                     </nav>
                 </div>
                 <CustomerServiceDetails/>
                 <PromotionDetails/>
             </div>               
         </React.Fragment>
        );
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

export default connect(mapStateToProps)(CustomerService);