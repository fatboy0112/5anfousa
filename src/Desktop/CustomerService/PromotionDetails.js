import React from 'react';
import { Translate } from '../../localization';

const  PromotionDetails= () =>{
    return (
        <div className="promotion_details">
            <ul>
                <li>
                    <img src='/images/about-icon.svg' alt="about-icon" />
                    <span><b>{ Translate.aboutUs }</b></span>
                </li>
                <li>
                    <a href="mailto:info@w3docs.com?cc=secondemail@example.com">
                        <img src='/images/contact-icon.svg' alt="contact-icon" />
                        <span><b>{ Translate.contactUs }</b></span>
                    </a>
                </li>
                <li>
                    <img src='/images/terms-icon.svg' alt="terms-icon" />
                    <span><b>{ Translate.termsAndConditon}</b></span>
                </li>
                <li>
                    <img src='/images/payment-icon.svg' alt="payment-icon" />
                    <span><b>{ Translate.payments}</b></span>
                </li>
                <li>
                    <img src='/images/today-img.svg' alt="how-icon" />
                    <span><b>{ Translate.howPlacebet}</b></span>
                </li>
            </ul>
        </div>
    );
};

export default PromotionDetails;
