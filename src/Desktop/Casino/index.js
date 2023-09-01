import React, { Component } from 'react';
import { getLobbyURL ,setCasinoLobby} from '../../store/actions/casino.actions';
import Util from '../../helper/Util';
import { connect } from 'react-redux';
import LoadingIcon from '../../Components/Common/NewLoading';
import Lobby from '../../Components/Casino/Lobby';
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLobbyURL: () => dispatch(getLobbyURL()),
        getUser: () => dispatch(getUser()),
        setCasinoLobby:(value)=>dispatch(setCasinoLobby(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Casino);
