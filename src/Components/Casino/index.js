
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLobbyURL ,setCasinoLobby} from '../../store/actions/casino.actions';
import Loading from '../Common/Loading';
import Lobby from './Lobby';
import Util from '../../helper/Util';
import Button from '@material-ui/core/Button';
import { getUser } from '../../store/actions/user.actions';
class Casino extends Component {
 
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
                <div className='back_button'>
                    <Button  variant="contained" onClick = {()=>{this.props.history.push('/'); this.props.getUser();}} >Back To Home</Button>
                </div>
                <div className="main-container ">  
                    {this.props.casinoLobbyURL ? <Lobby casinoLobbyURL={this.props.casinoLobbyURL} /> : <Loading />}
                    {/* <Banner />
                <Categories />
                <GameList /> */}
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
        getUser: () => dispatch(getUser()),
        setCasinoLobby: (value) =>dispatch(setCasinoLobby(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Casino);
