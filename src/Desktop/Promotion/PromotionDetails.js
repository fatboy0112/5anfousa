import React from 'react';
import { Link } from 'react-router-dom';

function PromotionDetails() {
    return (
        <div className="promotion_details">
            <ul>
                <li>
                    <Link to='/d/privacy-policy'>
                        <img src='/images/promotion/about-icon.svg' alt="about-icon" />
                        <span><b>About us</b></span>
                    </Link>
                </li>
                <li>
                    <a href="mailto:info@w3docs.com?cc=secondemail@example.com">
                    <img src='/images/promotion/contact-icon.svg' alt="contact-icon" />
                    <span><b>Contact us</b></span>
                    </a>
                </li>
                <li>
                    <Link to='/d/terms-and-conditions'>
                        <img src='/images/promotion/terms-icon.svg' alt="terms-icon" />
                        <span><b>Terms and Conditions</b></span>
                    </Link>
                </li>
                <li>
                    <img src='/images/promotion/payment-icon.svg' alt="payment-icon" />
                    <span><b>Payments</b></span>
                </li>
                <li>
                    <Link to='/d/privacy-policy'>
                        <img src='/images/promotion/how-icon.svg' alt="how-icon" />
                        <span><b>How to place bet</b></span>
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default PromotionDetails;
