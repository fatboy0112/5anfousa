import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Header from '../Components/Common/Header';
import DesktopHeader from '../Desktop/Common/Header';
import Navigator from '../Components/Common/Navigator';

function PrivateRoute({ component: Component, ...rest }) {
    let authed = localStorage.getItem('jwt_access_token') || sessionStorage.getItem('jwt_access_token') ? true : false;
    let pageTitle = rest.title ? rest.title : '';
    let headerClassname = rest.headerClass ? rest.headerClass : '';

    return (
        <Route
            {...rest}
            render={(props) =>
                authed ? (
                    <>
                        { rest.isMobileOnly ? (
                            <Header {...props} headerClassname={headerClassname} pageTitle={pageTitle} />
                        ) : (
                            <DesktopHeader { ...props } />
                        )}
                        <Component {...props} />
                        { rest.isMobileOnly && (<Navigator {...props} title={pageTitle} /> )}
                        { rest.isMobileOnly || <div className="footer__text"><p className="footer__text-paragraph">Tous droits réservés et protégés par la loi Copyright © 2022 Marbouha365</p><span className="SVGInline footer__bottom-icon"><svg className="SVGInline-svg footer__bottom-icon-svg" viewBox="0 0 53 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.36089 1.51111L0.0017779 5.43111V11.7902L4.18311 9.39466V32H10.0631V1.51111H6.36089ZM28.7226 15.928C30.2035 14.36 31.1181 12.3564 31.1181 10.2658V9.35111C31.1181 4.34222 27.8515 0.988443 22.9733 0.988443C18.095 0.988443 14.8284 4.34222 14.8284 9.35111V10.2658C14.8284 12.3564 15.743 14.4471 17.1804 15.9716C15.4381 17.3218 14.3057 19.6302 14.3057 22.1564V23.5502C14.3057 29.1689 17.7901 32.5227 22.9733 32.5227C28.1564 32.5227 31.6408 29.1689 31.6408 23.5502V22.1564C31.6408 19.5867 30.5084 17.2782 28.7226 15.928ZM20.6213 9.61244C20.6213 7.52178 21.4488 6.69422 22.9733 6.69422C24.4977 6.69422 25.3253 7.52178 25.3253 9.61244V10.44C25.3253 12.5742 24.4977 13.5324 22.9733 13.5324C21.4488 13.5324 20.6213 12.5742 20.6213 10.44V9.61244ZM25.7608 23.5067C25.7608 25.7716 24.8026 26.7298 22.9733 26.7298C21.1439 26.7298 20.1857 25.7716 20.1857 23.5067V22.2C20.1857 19.9787 21.1439 19.0204 22.9733 19.0204C24.8026 19.0204 25.7608 19.9787 25.7608 22.2V23.5067ZM52.3198 15.7538H46.3527V9.56889H40.8647V15.7538H34.8976V21.1982H40.8647V27.3831H46.3527V21.1982H52.3198V15.7538Z" fill="#565656" /></svg></span></div>}
                    </>
                ) : (
                    <Redirect to={{ pathname: '/', state: { from: props.location } }} />
                )
            }
        />
    );
}

export default PrivateRoute;
