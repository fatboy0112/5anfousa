import React from 'react';
import { Route } from 'react-router-dom';

function FullLayoutRoute({ component: Component, ...rest }) {
    const component = (props) => <Component {...props} />;
    return <Route {...rest} component={component} />;
}

export default FullLayoutRoute;
