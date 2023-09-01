import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import MyAccount from '../MyAccount';
import Util from '../../helper/Util';
import { Link, useLocation } from 'react-router-dom';
import { Translate } from '../../localization';
import NativeSelect from '@material-ui/core/NativeSelect';

const InnerLinks = (props) => {
    const [showMyBets, setShowMyBets ] = useState(false);
    const [oddType, setOddType] = useState(localStorage.getItem('oddType'));
    const isLoggedIn = Util.isLoggedIn();
    const location = useLocation();


    const handelOddsTypeChange = (e) => {
        setOddType(e.target.value);
        localStorage.setItem('oddType', e.target.value);
        props.setOddType(e.target.value);

    };

    const isFavActive = useMemo(() => location.pathname.split('/')[2] === 'favorites', [ location ]);

    const openMyBets = () => {
        if (isLoggedIn) setShowMyBets(true);
    };
    return (
        <div className="inner-links d-flex align-items-center ">
            <ul className="d-flex">
                <li>
                    <NativeSelect
                        className="ml-2"
                        value={oddType} 
                        onChange={handelOddsTypeChange}
                    >
                        <option value="decimal">
                            {Translate.decimal}
                        </option>
                        <option  value="fraction">
                            {Translate.fraction}
                        </option>
                        <option  value="american">
                            {Translate.americanOdds}
                        </option>
                        
                    </NativeSelect>
                    {/* <div className="odd_type_menu">
                        <div className="oddTypesDropDown">
                            <div className="oddTypesDropdownItem">Decimal</div>
                        </div>
                        <div className="odd_type_label" >
                            Odd Type
                        </div>
                    </div> */}
                </li>
                <li>
                    <Link to={ isLoggedIn ? '/d/favorites' : null } className={`${isFavActive && 'active'} ${!isLoggedIn && 'disabled'}` }>
                        <img src="/images/star-24px.svg" alt="star-24px" />
                        { Translate.favorites }
                    </Link>
                </li>
                {<li className="my-bets" onClick={ () => openMyBets()}><a href className={`${showMyBets && 'active'} ${!isLoggedIn && 'disabled'}` }>
                    <img  className="dark-theme-icon" src="/images/receipt-24px-white.svg" />
                    <img className="light-theme-icon" src="/images/receipt-24px-white.svg" /> 
                    { Translate.myBets } </a></li>}
            </ul>
            { showMyBets && <MyAccount onClose={ () => setShowMyBets(false)} enableMyBets/>}
        </div>
    );
};

InnerLinks.propTypes = {
    userData: PropTypes.object,
    setLanguage: PropTypes.func,
    language: PropTypes.string,
    headerClassname: PropTypes.string,
};

export default InnerLinks;
