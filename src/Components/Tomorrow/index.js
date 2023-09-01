import React from 'react';
import Sports from './Sports';
import Events from './Events';

function Tomorrow(props) {
    return (
        <div className="main-container">
            <Sports {...props} noSport={props.noSports}/>
            <Events {...props}/>
        </div>
    );
}

export default Tomorrow;
