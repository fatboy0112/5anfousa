import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import map from 'lodash.map';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import Loading from '../Common/NewLoading';
import Login from '../Login';
import Games from './Games';
import { getpCasinoGameData } from '../../store/actions/casino.actions';
import LoaderLiveCasino from '../Common/LoaderLiveCasino';

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
    //     // if(!this.props.isShowCasino) {
    //     //     this.props.history.push('/')
    //     // }
    //     if(this.props.userData && !this.props.userData.is_pcasino_enabled) {
    //         this.props.history.push('/')
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
                          let groupClassname = company === 'New Evolution' ? 'casino__provider-body_big' : 'casino__provider-body_small';
                          let rowsNumber = 1;

                          if (company !== 'New Evolution' && game.length > 3) {
                              rowsNumber = 2;
                          }

                          let gamesList = <Games games={game} playGame={this.playGame} rows={rowsNumber} />;

                          return (
                              <div className="casino__provider-wrap" key={`${index}_${company}`}>
                                  <div className="casino__provider-header">
                                     
                                      <p className="casino__title m-0 font-weight-semibold text-yellow">{game[0].Vendor}</p>
                                  </div>
                                  <div className={`casino__provider-body ${groupClassname}`}>{gamesList}</div>
                              </div>
                          );
                      });
                  })
                : [];

        return loadingLiveCasinoGames ? (
            <Loading />
        ) : liveCasinoGamesList.length > 0 ? (
            <>
                <div className="casino__list pl-40 pr-40 clearfix mb-2">{this.props.loading ? <LoaderLiveCasino /> : gameList }</div>

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
        isShowCasino:state.general.isShowCasino
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
      getpCasinoGameData: (id, history) => dispatch(getpCasinoGameData(id, history)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));
