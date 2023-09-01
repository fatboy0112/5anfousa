// import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';
// import Loading from '../Common/NewLoading';
// import { initCasinoUser } from '../../store/actions/casino.actions';

// class SingleGame extends Component {
//     componentDidMount() {
//         let history = this.props.history;
//         let title = this.props.match.params.gameTitle;
//         this.props.initCasinoUser(title, history, false);
//     }

//     render() {
//         let { currentGameData } = this.props;

//         return (
//             <>
//                 {currentGameData && currentGameData.GAME_URL ? (
//                     <iframe
//                         className="casino__iframe"
//                         src={`${currentGameData.GAME_URL}?game=${currentGameData.game}&hash=${currentGameData.hash}&api_id=${currentGameData.api_id}&lang=${currentGameData.lang}&exit=${currentGameData.exiturl}`}
//                         title="Casino Game"
//                         allowFullScreen
//                     ></iframe>
//                 ) : (
//                     <Loading />
//                 )}
//             </>
//         );
//     }
// }

// SingleGame.propTypes = {
//     initCasinoUser: PropTypes.func,
//     currentGameData: PropTypes.object,
// };

// const mapStateToProps = (state) => {
//     return {
//         currentGameData: state.casino.currentGameData,
//     };
// };

// const mapDispatchToProps = (dispatch) => {
//     return {
//         initCasinoUser: (title, history, isFirstLoad) => dispatch(initCasinoUser(title, history, isFirstLoad)),
//     };
// };

// export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SingleGame));
