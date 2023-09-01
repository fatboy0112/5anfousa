import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Loading from '../../Components/Common/NewLoading';
 import { postHeartBeat } from '../../store/actions/casino.actions';

let heartBeatTimout;

class SingleGame extends Component {
    componentDidMount() {
        heartBeatTimout = setInterval(() => this.props.postHeartBeat(), 10000); 
        // let history = this.props.history;
        // let title = this.props.match.params.gameTitle;
        // this.props.initCasinoUser(title, history, false);
    }

    componentWillUnmount() {
     clearTimeout(heartBeatTimout);
    };

    render() {
        let { currentGameData } = this.props;
        let  game_url = `${currentGameData.GAME_URL}?game=${currentGameData.game}&hash=${currentGameData.hash}&api_id=${currentGameData.api_id}&lang=en&exit=${currentGameData.exiturl}>`;

        return (
            <>
                {currentGameData && currentGameData.GAME_URL ? (
                    <iframe
                        className="casino__iframe2"
                        src={game_url}
                        title="Casino Game"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <Loading />
                )}
            </>
        );
    }
}

SingleGame.propTypes = {
    // initCasinoUser: PropTypes.func,
    currentGameData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        currentGameData: state.casino.currentGameData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        postHeartBeat: () => dispatch(postHeartBeat()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SingleGame));
