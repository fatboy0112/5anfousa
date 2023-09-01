import React, { Component } from 'react';
import Categories from './Categories';
import GameList from './GameList';
import { getLobbyURL ,setCasinoLobby} from '../../store/actions/casino.actions';
import Loading from '../Common/Loading';
import Util from '../../helper/Util';
import { connect } from 'react-redux';
import Lobby from '../Casino/Lobby';
import Button from '@material-ui/core/Button';
import { getUser } from '../../store/actions/user.actions';
import Banner from './Banner';
class LiveCasino extends Component {

    componentDidMount() {
        if(Util.isLoggedIn())
            this.props.getLobbyURL();

    }

    componentWillUnmount() {
        if(Util.isLoggedIn())
            this.props.getUser();
        // document.body.classList.remove('body_casino');
        this.props.setCasinoLobby('');

    }


    render() {
        return (
            <>

                <div className="main-container ">
                    {/*{this.props.casinoLobbyURL ? <Lobby casinoLobbyURL={this.props.casinoLobbyURL} /> : <Loading />}*/}
                    {/*<Banner />*/}
                    <Categories />
                    <GameList />

                </div>

            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        casinoLobbyURL: state.casino.casinoLobbyURL,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLobbyURL: () => dispatch(getLobbyURL()),
        getUser: () =>dispatch(getUser()),
        setCasinoLobby: (value)=>dispatch(setCasinoLobby(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LiveCasino);
