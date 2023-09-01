import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import map from 'lodash.map';
import includes from 'lodash.includes';
import { CASINO_TOP_GAMES, CASINO_PER_PAGE } from '../../config';
import Loading from '../Common/NewLoading';
import { LazyBackgroundImage } from '../Common/ImgLoading';
import LoadingIcon from '../Common/LoadingIcon';
import InfiniteScroll from 'react-infinite-scroll-component';
import TopGames from './TopGames';
import Login from '../Login';
//import { initCasinoUser } from '../../store/actions/casino.actions';
import { Translate } from '../../localization';
import { getSlotGameData } from '../../store/actions/casino.actions';

class GameList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
            casinoGamesList: [],
            page: 1,
        };
    }

    componentDidMount() {
        // if (sessionStorage.getItem('casino_url') !== '') {
        //     sessionStorage.setItem('casino_url', '');
        //     window.location.reload(false);
        // }
    }

    componentDidUpdate(prevProps) {
        let { casinoGames, filteredCasinoGames, loadingCasinoGames, activeCategory, noSearchResults } = this.props;
        let allCasinoGames = noSearchResults ? [] : filteredCasinoGames.length > 0 ? filteredCasinoGames : casinoGames;
        if( prevProps.casinoGames !== casinoGames
            || prevProps.filteredCasinoGames !== filteredCasinoGames
            || prevProps.noSearchResults !== noSearchResults
            || prevProps.loadingCasinoGames !== loadingCasinoGames
            || prevProps.activeCategory !== activeCategory
        ){
            this.setState({
                casinoGamesList: allCasinoGames.slice(0, CASINO_PER_PAGE),
                page: 1,
            });
        }

         if(!this.props.isShowCasino) {
            this.props.history.push('/');
           
        }
        if(this.props.userData && !this.props.userData.is_casino_enabled) {
            this.props.history.push('/');
            
        }

    }

    componentWillUnmount() {
        this.setState({ casinoGamesList: [] });
    }

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    playGame = (game) => {
        if (this.isLoggedIn()) {
            let history = this.props.history;
            this.props.getSlotGameData(game, history);
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

    fetchMore = (allCasinoGames) => {
        const { page } = this.state;
        this.setState({...this.state, page: page + 1, casinoGamesList: [ ...this.state.casinoGamesList, ...allCasinoGames.slice( page*CASINO_PER_PAGE, ( page + 1 )*CASINO_PER_PAGE)]});
    }
    render() {
        let { showLogin, casinoGamesList, page } = this.state;
        let { casinoGames, filteredCasinoGames, loadingCasinoGames, activeCategory, noSearchResults, searchStarted } = this.props;
        let allCasinoGames = noSearchResults ? [] : filteredCasinoGames.length > 0 ? filteredCasinoGames : casinoGames;
        let hasMore = allCasinoGames.length > page*CASINO_PER_PAGE;
        let imageUrl = "/images/comming_soon.jpg"
        let gameList =
            casinoGamesList && casinoGamesList.length > 0
                ? map(casinoGamesList, (game) => {
                      if (activeCategory === 'all' && !searchStarted) {
                          if (includes(CASINO_TOP_GAMES, game.id)) {
                              return false;
                          } else if (game.id === 610) {
                              // game "narcos" is not working
                              return false;
                          } else {
                              return (
                                  <div className="casino__item" key={game.id} onClick={() => this.playGame(game)}>
                                      <LazyBackgroundImage image={game.imgURL || imageUrl} fallbackImage="./images/loading-dark.gif" className="casino__img" />
                                  </div>
                              );
                          }
                      } else {
                          if (game.id === 610) {
                              // game "narcos" is not working
                              return false;
                          } else {
                              return (
                                  <div className="casino__item" key={game.id} onClick={() => this.playGame(game)}>
                                      <LazyBackgroundImage image={game.imgURL || imageUrl} fallbackImage="./images/loading-dark.gif" className="casino__img" />
                                  </div>
                              );
                          }
                      }
                  })
                : [];

        return loadingCasinoGames ? (
            <Loading />
        ) : allCasinoGames.length > 0 ? (
            <>
                {/* {activeCategory === 'all' && !searchStarted && (
                    <>
                        <TopGames />
                        <p className="casino__title mt-0 mb-1 pl-3 font-weight-semibold text-yellow">{Translate.allGames}</p>
                    </>
                )} */}
                {
                    casinoGamesList.length > 0 ? (
                        <InfiniteScroll
                            dataLength={ casinoGamesList.length }
                            next={ () => this.fetchMore(allCasinoGames) }
                            hasMore={ hasMore }
                            loader={<LoadingIcon theme="dark centered" />}
                            scrollThreshold = {0.95}
                        >
                            <div className="casino__list pl-40 pr-40 clearfix mb-2">{ gameList }</div>
                        </InfiniteScroll>
                    ) : (
                        <div className="no-data fs-15 pt-3 pb-3">No More Result Found</div>
                    )
                }
                {showLogin && <Login hideLogin={this.hideLogin} />}
            </>
        ) : (
            <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
        );
    }
}

GameList.propTypes = {
    casinoGames: PropTypes.array,
    filteredCasinoGames: PropTypes.array,
    loadingCasinoGames: PropTypes.bool,
    activeCategory: PropTypes.string,
    noSearchResults: PropTypes.bool,
    searchStarted: PropTypes.bool,
    userData: PropTypes.object,
    initCasinoUser: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        casinoGames: state.casino.casinoGames,
        filteredCasinoGames: state.casino.filteredCasinoGames,
        loadingCasinoGames: state.casino.loadingCasinoGames,
        activeCategory: state.casino.activeCategory,
        noSearchResults: state.casino.noSearchResults,
        searchStarted: state.casino.searchStarted,
        userData: state.user.data,
        isShowCasino:state.general.isShowCasino
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getSlotGameData: (game, history) => dispatch(getSlotGameData(game, history)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));
