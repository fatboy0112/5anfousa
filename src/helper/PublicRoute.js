import React from 'react';
import { Route } from 'react-router-dom';
import Header from '../Components/Common/Header';
import DesktopHeader from '../Desktop/Common/Header';
import Navigator from '../Components/Common/Navigator';
import Footer from './Footer';

function PublicRoute({ component: Component, ...rest }) {
    let headerClassname = rest.headerClass ? rest.headerClass : '';
    let pageTitle = rest.title ? rest.title : '';
    const component = (props) => (
        <>
            { rest.isMobileOnly ? (
                <Header {...props} headerClassname={headerClassname} pageTitle={pageTitle} />
            ) : (
                <DesktopHeader { ...props } />
            )}
            <Component {...props} extraMarketChild={ rest.extraMarketChild } />
            { rest.isMobileOnly && (<Navigator {...props} title={pageTitle}/> )}
            { rest.isMobileOnly || <Footer/>}
        </>
    );
    return <Route {...rest} component={component} />;
}

export default PublicRoute;
