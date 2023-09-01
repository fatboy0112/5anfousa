import React, { Component } from 'react';
class Lobby extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {}

    componentWillUnmount() {}

    render() {
        return (
            <div className="">
                 {/* <div className="dropiframe-mobile"></div> */}
                <iframe className="casino__iframe" src={`${this.props.casinoLobbyURL}`} frameBorder="0" allowFullScreen></iframe>
            </div>
        );
    }
}

export default Lobby;
