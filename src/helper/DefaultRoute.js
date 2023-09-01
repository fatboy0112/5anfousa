import React from 'react';
import { Route, Redirect } from 'react-router-dom';

function DefaultRoute() {
    return ( 
        <Route>
            <Redirect to="/" />
        </Route>
    );
}

export default DefaultRoute;
