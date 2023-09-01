import React from 'react';
import Sports from './Sports';
import Events from './Events';
import SportsLivePage from './SportsLivePage';

function Today(props) {
    return (
        <div className="main-container">
            { props.fromLivePage === true ? <SportsLivePage {...props} noSport={props.noSports}/>:<Sports {...props} noSport={props.noSports}/>}
            <Events {...props}/>
        </div>
    );
}

export default Today;
