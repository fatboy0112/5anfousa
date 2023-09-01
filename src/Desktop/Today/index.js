import React from 'react';
import Sports from './Sports';
import Events from './Events';

function Today(props) {
    return (
        <React.Fragment>
            <Sports {...props} noSport={props.noSports}/>
            <Events {...props}/>
        </React.Fragment>
    );
}

export default Today;
