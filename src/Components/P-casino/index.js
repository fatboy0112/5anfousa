import React, { Component } from 'react';
import Banner from './Banner';
import Categories from './Categories';
import GameList from './GameList';
import { getLobbyURL ,setCasinoLobby} from '../../store/actions/casino.actions';
import Util from '../../helper/Util';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import { getUser } from '../../store/actions/user.actions';
class LiveCasino extends Component {

    componentDidMount() {
       
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
                <div className='back_button'>
                    <Button  variant="contained" onClick = {()=>{this.props.history.push('/');this.props.getUser();}} >Back To Home</Button>
                </div>
                <div className="main-container ">
                    {/* {this.props.casinoLobbyURL ? <Lobby casinoLobbyURL={this.props.casinoLobbyURL} /> : <Loading />} */}
                    <Banner />
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
