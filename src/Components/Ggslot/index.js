import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLobbyURL ,setCasinoLobby} from '../../store/actions/casino.actions';
import Loading from '../Common/Loading';
import Util from '../../helper/Util';
import Button from '@material-ui/core/Button';
import { getUser } from '../../store/actions/user.actions';
import Banner from './Banner';
import Categories from './Categories';
import GameList from './GameList';
import { initGgSlotUser } from '../../store/actions/casino.actions';

class Casino extends Component {
    componentDidMount() {
     
    //   document.body.classList.add('body_casino');
      
    }
    componentWillUnmount () {
      document.body.classList.remove('body_casino');
    }
  
    render() {
        return (
            <>
                {this.props.setLoadingSlot ? <Loading/>: 
                <div className="main-container bg-gradient">
                   

                    {/* <div className='back_button'>
                    <Button  variant="contained" onClick = {()=>{this.props.history.push('/'); this.props.getUser();}} >Back To Home</Button>
                </div>
                <div className="main-container ">  
                    {this.props.casinoLobbyURL ? <Lobby casinoLobbyURL={this.props.casinoLobbyURL} /> : <Loading />} */}
                    {/*<Banner />*/}
                    <Categories  />
                    <GameList />
                </div>
    }
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        casinoLobbyURL: state.casino.casinoLobbyURL,
        setLoadingSlot: state.casino.setLoadingSlot,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLobbyURL: () => dispatch(getLobbyURL()),
        getUser: () => dispatch(getUser()),
        setCasinoLobby: (value) =>dispatch(setCasinoLobby(value)),
        initGgSlotUser: () => dispatch(initGgSlotUser()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Casino);
