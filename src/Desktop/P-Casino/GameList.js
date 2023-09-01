import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import map from 'lodash.map';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import Loading from '../../Components/Common/NewLoading';
import Login from '../../Components/Login';
import Games from './Games';
import { getLiveGameData,getpCasinoGameData} from '../../store/actions/casino.actions';
import LoaderLiveCasino from '../../Components/Common/LoaderLiveCasino';
class GameList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
        };
    }
    componentDidMount() {
        if (sessionStorage.getItem('casino_url') !== '') {
            sessionStorage.setItem('casino_url', '');
            window.location.reload(false)
        }
    }

    // componentDidUpdate() {
    //     //  if(!this.props.isShowCasino) {
    //     //     this.props.history.push('/d')
    //     // }
    //     if(this.props.userData && !this.props.userData.is_pcasino_enabled) {
    //         this.props.history.push('/d');
    //     }
    // }

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    playGame = (game) => {
        if (this.isLoggedIn()) {
            let history = this.props.history;
            this.props.getpCasinoGameData(game, history);
        } else {
            this.setState({ showLogin: true });
        }
    };

    showLoginForm = (e) => {
        this.setState({ showLogin: true });
    };

    hideLogin = () => {
        this.setState({ showLogin: false });
    };
    render() {
        let { showLogin } = this.state;
        let { liveCasinoGames, filteredLiveCasinoGames, loadingLiveCasinoGames, noSearchResults } = this.props;
        let liveCasinoGamesList = noSearchResults ? [] : filteredLiveCasinoGames.length > 0 ? filteredLiveCasinoGames : liveCasinoGames;

        let groupedByCategory =
            liveCasinoGamesList &&
            liveCasinoGamesList[0] &&
            groupBy(liveCasinoGamesList, function (game) {
                return `${game.Vendor}`;
            });

        let groupedByCategoryAndCompany = {};

        forEach(groupedByCategory, (group, category) => {
            let gamesGroup = groupBy(group, function (game) {
                return `${game.Vendor}`;
            });

            groupedByCategoryAndCompany[category] = gamesGroup;
        });

        let gameList =
            liveCasinoGamesList && liveCasinoGamesList.length > 0
                ? map(groupedByCategoryAndCompany, (group, index) => {
                      return map(group, (game, company) => {
                          let rowsNumber = 1;

                          if (company !== 'PragmaticLiveCasino' && game.length > 3) {
                              rowsNumber = 2;
                          }

                          let gamesList = <Games games={game} playGame={this.playGame} rows={1} />;

                          return (
                              <div className="game-cate-sec" key={`${index}_${company}`}>
                                  <div className="cate-title">
                                      <p>
                                          {game[0].Vendor}
                                      </p>
                                  </div>
                                  <ul>{gamesList}</ul>
                              </div>
                          );
                      });
                  })
                : [];

        return loadingLiveCasinoGames ? (
            <Loading customClass='casino-loader'/>
        ) : liveCasinoGamesList.length > 0 ? (
            <>
                <div className="casino-game-parent pl-40 pr-40 clearfix mb-2">
                    {this.props.loading ? <LoaderLiveCasino /> : <div className="casino-box">{gameList}</div> }</div>

                {showLogin && <Login hideLogin={this.hideLogin} />}
            </>
        ) : (
            <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
        );
    }
}

GameList.propTypes = {
    liveCasinoGames: PropTypes.array,
    filteredLiveCasinoGames: PropTypes.array,
    loadingLiveCasinoGames: PropTypes.bool,
    noSearchResults: PropTypes.bool,
    userData: PropTypes.object,
    getLiveGameData: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        liveCasinoGames: state.casino.liveCasinoGames,
        filteredLiveCasinoGames: state.casino.filteredLiveCasinoGames,
        loadingLiveCasinoGames: state.casino.loadingLiveCasinoGames,
        noSearchResults: state.casino.noSearchResults,
        userData: state.user.data,
        loading: state.general.loading,
        isShowCasino : state.general.isShowCasino
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLiveGameData: (id, history) => dispatch(getLiveGameData(id, history)),
        getpCasinoGameData: (id, history) => dispatch(getpCasinoGameData(id, history)),

        
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));
