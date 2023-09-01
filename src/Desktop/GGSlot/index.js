import React, { Component } from 'react';
import Categories from './Categories';
import GameList from './GameList';

class Casino extends Component {
    componentDidMount() {
        document.body.classList.add('casino-body');
    }

    componentWillUnmount() {
        document.body.classList.remove('casino-body');
    }

    render() {
        return (
            <div id='scrollableDiv' className='casino-body'>
                <div className="casino-bg casino-parent-div casino-width-align">
                    <div className="banner-categories">
                        {/* <Banner /> */}
                        <Categories />
                    </div>
                    <div className='d-table w-100'>                        
                        <GameList />
                    </div>
                </div>
            </div>
        );
    }
}

export default Casino;
