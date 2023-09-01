import React, { Component } from 'react';
import { getLobbyURL, setCasinoLobby } from '../../store/actions/casino.actions';
import Util from '../../helper/Util';
import { connect } from 'react-redux';
import LoadingIcon from '../../Components/Common/NewLoading';
import Lobby from './Lobby';
import { getUser } from '../../store/actions/user.actions';

class Casino extends Component {
    componentDidMount() {
        const { match, getLobbyURL } = this.props;

        if (Util.isLoggedIn()) {
            getLobbyURL(match.params.lobbyName);
        }
    }

    componentDidUpdate(prevProps) {
        const { match, getLobbyURL } = this.props;

        if (prevProps.match.params.lobbyName !== match.params.lobbyName && Util.isLoggedIn()) {
            getLobbyURL(match.params.lobbyName);
        }

        if (this.props.userData && (!this.props.userData.is_ezugi_casino_enabled || !this.props.userData.is_live_casino_enabled)) {
            if (match.params.lobbyName === 'evo' || match.params.lobbyName === 'ezugi') return;
            this.props.history.push('/');
        }
    }

    componentWillUnmount() {
        if (Util.isLoggedIn())
            this.props.getUser();
        // document.body.classList.remove('body_casino');
        this.props.setCasinoLobby('');

    }

    render() {
        return (
            <>
                <div id='scrollableDiv' className='casino-body'>
                    {this.props.casinoLobbyURL ? <Lobby casinoLobbyURL={this.props.casinoLobbyURL} /> : <LoadingIcon />}
                    <div className="casino-bg casino-parent-div casino-width-align">
                        <div className="banner-categories">
                            {/* <Banner />
                        <Categories /> */}
                        </div>

                        <div className='d-table w-100'>
                            {/* <GameList /> */}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        casinoLobbyURL: state.casino.casinoLobbyURL,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLobbyURL: (type) => dispatch(getLobbyURL(type)),
        getUser: () => dispatch(getUser()),
        setCasinoLobby: (value) => dispatch(setCasinoLobby(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Casino);
