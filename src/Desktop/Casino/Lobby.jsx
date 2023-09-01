import React, { Component } from 'react';
class Lobby extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {}

    componentWillUnmount() {}
    onLoad = () => {
        try {
            // eslint-disable-next-line no-unused-vars
            let iframeLocation = document.getElementById('casino_lobby_iframe').contentWindow.location.href;
            this.props.history.push('/');
        } catch (e) {}
    };

    render() {
        return (
            <div className="">
                 {/* <div className="dropiframe"></div> */}
                <iframe
                    id="casino_lobby_iframe"
                    onLoad={this.onLoad}
                    className="casino__iframe"
                    src={`${this.props.casinoLobbyURL}`}
                    frameBorder="0"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }
}

export default Lobby;
