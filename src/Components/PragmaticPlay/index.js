import React, { Component } from 'react';
import { getLobbyURL ,setCasinoLobby} from '../../store/actions/casino.actions';
import Lobby from '../Casino/Lobby';
import Util from '../../helper/Util';
import { connect } from 'react-redux';
import LoadingIcon from '../../Components/Common/NewLoading';
import { getUser } from '../../store/actions/user.actions';
import Button from '@material-ui/core/Button';
import Loading from '../Common/Loading';
class PragmaticPlay extends Component {
 
    componentDidMount() {
        if(Util.isLoggedIn())
        this.props.getLobbyURL('pragmatic-play');
       
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
                {this.props.casinoLobbyURL ? <Lobby casinoLobbyURL={this.props.casinoLobbyURL} /> : <Loading />}
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
        getLobbyURL: (type) => dispatch(getLobbyURL(type)),
        getUser:() => dispatch(getUser()),
        setCasinoLobby:(value)=>dispatch(setCasinoLobby(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PragmaticPlay);
