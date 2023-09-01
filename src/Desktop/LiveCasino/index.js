import React, {Component} from 'react';
import Categories from './Categories';
import GameList from './GameList';
import {getLobbyURL, setCasinoLobby} from '../../store/actions/casino.actions';
import Loading from '../../Components/Common/Loading';
import Util from '../../helper/Util';
import {connect} from 'react-redux';
import {getUser} from '../../store/actions/user.actions';
import Banner from "../../Components/Ggslot/Banner";
import Button from "react-redux-toastr/lib/Button";

class LiveCasino extends Component {

    componentDidMount() {
        if (Util.isLoggedIn())
            this.props.getLobbyURL();

    }

    componentWillUnmount() {
        if (Util.isLoggedIn())
            this.props.getUser();
        document.body.classList.remove('body_casino');
        this.props.setCasinoLobby('');

    }

    render() {
        return (
            <>
                <div className='back_button'>
                    <Button  variant="contained" onClick = {()=>{this.props.history.push('/'); this.props.getUser();}} ><img src="/images/home-gray.svg" alt="home-gray"/></Button>
                </div>

                {this.props.casinoLobbyURL ?
                    <div className="main-container casino-live">
                        <Banner />
                        <Categories />
                        <GameList/>
                    </div>
                    : <Loading/>}
            </>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        casinoLobbyURL: state.casino.casinoLobbyURL
    };
};

const mapDispatchToProps = (dispatch) => {
        return {
            getLobbyURL: () => dispatch(getLobbyURL()),
            getUser: () => dispatch(getUser()),
            setCasinoLobby: (value) => dispatch(setCasinoLobby(value))
        };
    }
;

export default connect(mapStateToProps, mapDispatchToProps)(LiveCasino);
