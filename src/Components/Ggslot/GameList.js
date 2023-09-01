import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import map from 'lodash.map';
import {CASINO_PER_PAGE } from '../../config';
import Loading from '../Common/NewLoading';
import {LazyBackgroundImage} from '../Common/ImgLoading';
import LoadingIcon from '../Common/LoadingIcon';
import InfiniteScroll from 'react-infinite-scroll-component';
import Login from '../Login';
import {getSlotGameData} from '../../store/actions/casino.actions';

class GameList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
            casinoGamesList: [],
            page: 1,
            showAm: true,
            showNovo: false,
            showWazda: false,
            showNetent: false,
            showBomba : false,
            showAristocratt  :false ,
            showEgt : false ,
            showRacing: false ,
        };
    }

    componentDidMount() {
        if (sessionStorage.getItem('casino_url') !== '') {
            sessionStorage.setItem('casino_url', '');
            window.location.reload(false);
        }
    }

    componentDidUpdate(prevProps) {
        let {casinoGames, filteredCasinoGames, loadingCasinoGames, activeCategory, noSearchResults} = this.props;
        let allCasinoGames = noSearchResults ? [] : filteredCasinoGames.length > 0 ? filteredCasinoGames : casinoGames;
        if (prevProps.casinoGames !== casinoGames
            || prevProps.filteredCasinoGames !== filteredCasinoGames
            || prevProps.noSearchResults !== noSearchResults
            || prevProps.loadingCasinoGames !== loadingCasinoGames
            || prevProps.activeCategory !== activeCategory
        ) {
            this.setState({
                casinoGamesList: allCasinoGames.slice(0, CASINO_PER_PAGE),
                page: 1,
            });
        }

        // if (!this.props.isShowCasino) {
        //     this.props.history.push('/');

        // }
        if (this.props.userData && !this.props.userData.is_casino_enabled) {
            this.props.history.push('/');

        }

        if(this.props.currentGameData !== prevProps.currentGameData) {
            console.error('must go now', `/casino/game/${this.props.currentGameData.game}`);
            this.props.history.push(`/casino/game/${this.props.currentGameData.game}`);
        }


    }

    componentWillUnmount() {
        this.setState({casinoGamesList: []});
    }

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    playGame = (game) => {
        if (this.isLoggedIn()) {
            let history = this.props.history;
            this.props.getSlotGameData(game, history);
        } else {
            this.setState({showLogin: true});
        }
    };

    showLoginForm = (e) => {
        this.setState({showLogin: true});
    };

    hideLogin = () => {
        this.setState({showLogin: false});
    };

    fetchMore = (allCasinoGames) => {
        const {page} = this.state;
        this.setState({
            ...this.state,
            page: page + 1,
            casinoGamesList: [...this.state.casinoGamesList, ...allCasinoGames.slice(page * CASINO_PER_PAGE, (page + 1) * CASINO_PER_PAGE)]
        });
    };

    render() {
        let {showLogin, casinoGamesList, page} = this.state;
        let {
            casinoGames,
            filteredCasinoGames,
            loadingCasinoGames,
            activeCategory,
            noSearchResults,
            searchStarted
        } = this.props;
        let allCasinoGames = noSearchResults ? [] : filteredCasinoGames.length > 0 ? filteredCasinoGames : casinoGames;
        let hasMore = allCasinoGames.length > page * CASINO_PER_PAGE;
        let amaticGames = [];
        let novomaticGames = [];
        let wazdaGames = [];
        let netentGames = [];
        let bombaGames =[];
        let aristocratGames =[];
        let egtGames = [];
        let racingGames = [];

        let gameList =
            casinoGamesList && casinoGamesList.length > 0
                ? map(allCasinoGames, (game) => {
                    if (game.category === 'racing') {
                        let theGame = (<div className="casino__itemm" key={game.id} onClick={() => this.playGame(game)}>
                            <div className="casino__img1__container"><LazyBackgroundImage image={game.image}
                                                                                         fallbackImage="./images/loading-dark.gif"
                                                                                         className="casino__img1"/>
                            </div>
                            <p className="casino__namee">{game.name}{/* - {game.id} - {game.category}*/}</p>
                        </div>);
                        racingGames.push(theGame);
                    }
                    if (game.category === 'egt') {
                        let theGame = (<div className="casino__itemm" key={game.id} onClick={() => this.playGame(game)}>
                            <div className="casino__img1__container"><LazyBackgroundImage image={game.image}
                                                                                         fallbackImage="./images/loading-dark.gif"
                                                                                         className="casino__img1"/>
                            </div>
                            <p className="casino__namee">{game.name}{/* - {game.id} - {game.category}*/}</p>
                        </div>);
                        egtGames.push(theGame);
                    }

                    if (game.category === 'aristocrat') {
                        let theGame = (<div className="casino__itemm" key={game.id} onClick={() => this.playGame(game)}>
                            <div className="casino__img1__container"><LazyBackgroundImage image={game.image}
                                                                                         fallbackImage="./images/loading-dark.gif"
                                                                                         className="casino__img1"/>
                            </div>
                            <p className="casino__namee">{game.name}{/* - {game.id} - {game.category}*/}</p>
                        </div>);
                        aristocratGames.push(theGame);
                    }

                    if (game.category === 'bomba') {
                        let theGame = (<div className="casino__itemm" key={game.id} onClick={() => this.playGame(game)}>
                            <div className="casino__img1__container"><LazyBackgroundImage image={game.image}
                                                                                         fallbackImage="./images/loading-dark.gif"
                                                                                         className="casino__img1"/>
                            </div>
                            <p className="casino__namee">{game.name}{/* - {game.id} - {game.category}*/}</p>
                        </div>);
                        bombaGames.push(theGame);
                    }

                    if (game.category === 'novomatic') {
                        let theGame = (<div className="casino__itemm" key={game.id} onClick={() => this.playGame(game)}>
                            <div className="casino__img1__container"><LazyBackgroundImage image={game.image}
                                                                                         fallbackImage="./images/loading-dark.gif"
                                                                                         className="casino__img1"/>
                            </div>
                            <p className="casino__namee">{game.name}{/* - {game.id} - {game.category}*/}</p>
                        </div>);
                        novomaticGames.push(theGame);
                    }
                    if (game.category === 'netent') {
                        let theGame = (<div className="casino__itemm" key={game.id} onClick={() => this.playGame(game)}>
                            <div className="casino__img1__container"><LazyBackgroundImage image={game.image}
                                                                                         fallbackImage="./images/loading-dark.gif"
                                                                                         className="casino__img1"/>
                            </div>
                            <p className="casino__namee">{game.name}{/* - {game.id} - {game.category}*/}</p>
                        </div>);
                        netentGames.push(theGame);
                    }

                    if (game.category === 'wazdan') {
                        let theGame = (<div className="casino__itemm" key={game.id} onClick={() => this.playGame(game)}>
                            <div className="casino__img1__container"><LazyBackgroundImage image={game.image}
                                                                                         fallbackImage="./images/loading-dark.gif"
                                                                                         className="casino__img1"/>
                            </div>
                            <p className="casino__namee">{game.name}{/* - {game.id} - {game.category}*/}</p>
                        </div>);
                        wazdaGames.push(theGame);
                    }
                    if (game.category === 'amatic') {
                        let theGame = (<div className="casino__itemm" key={game.id} onClick={() => this.playGame(game)}>
                            <div className="casino__img1__container"><LazyBackgroundImage image={game.image}
                                                                                         fallbackImage="./images/loading-dark.gif"
                                                                                         className="casino__img1"/>
                            </div>
                            <p className="casino__namee">{game.name}{/* - {game.id} - {game.category}*/}</p>
                        </div>);
                        amaticGames.push(theGame);
                    }

                })
                : [];

        let novomaticClass = !this.state.showNovo ? 'closed' : '';
        let wazdaClass = !this.state.showWazda ? 'closed' : '';
        let amaticClass = !this.state.showAm ? 'closed' : '';
        let netentClass = !this.state.showNetent ? 'closed' : '';
        let bombaClass = !this.state.showBomba ? 'closed' : '';
        let aristocratClass = !this.state.showAristocratt ? 'closed' : '';
        let egtClass = !this.state.showEgt ? 'closed' : '';
        let racingClass = !this.state.showRacing ? 'closed' : '';







        return loadingCasinoGames ? (
            <Loading/>
        ) : (<>


            <div data-role="collapsible" data-collapsed="false"
                 className="ui-collapsible ui-collapsible-themed-content ui-first-child"><h3
                className="ui-collapsible-heading"><a
                onClick={() => {
                    this.showCategory('amatic');
                }}


                className={`ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-i ui-icon-carat-d ${amaticClass}`}


            >Amatic
                <span className="ui-collapsible-heading-status"> </span></a>
            </h3>
                <div className="ui-collapsible-content ui-body-a" aria-hidden="false"
                     style={{padding: this.state.showAm ? '.5em 1em' : ''}}>
                    <ul data-role="listview" id="games-overview" className="games-mini-list ui-listview">
                        {this.state.showAm && amaticGames}

                    </ul>
                </div>
            </div>

            <div data-role="collapsible" data-collapsed="false"
                 className="ui-collapsible ui-collapsible-themed-content ui-first-child"><h3
                className="ui-collapsible-heading"><a
                onClick={() => {
                    this.showCategory('novomatic');
                }}


                className={`ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-i ui-icon-carat-d ${novomaticClass}`}


            >Novomatic
                <span className="ui-collapsible-heading-status"> </span></a>
            </h3>
                <div className="ui-collapsible-content ui-body-a" aria-hidden="false"
                     style={{padding: this.state.showNovo ? '.5em 1em' : ''}}>
                    <ul data-role="listview" id="games-overview" className="games-mini-list ui-listview">
                        {this.state.showNovo && novomaticGames}

                    </ul>
                </div>
            </div>

            <div data-role="collapsible" data-collapsed="false"
                 className="ui-collapsible ui-collapsible-themed-content ui-first-child"><h3
                className="ui-collapsible-heading"><a
                onClick={() => {
                    this.showCategory('wazda');
                }}


                className={`ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-i ui-icon-carat-d ${wazdaClass}`}


            >Wazdan
                <span className="ui-collapsible-heading-status"> </span></a>
            </h3>
                <div className="ui-collapsible-content ui-body-a" aria-hidden="false"
                     style={{padding: this.state.showWazda ? '.5em 1em' : ''}}>
                    <ul data-role="listview" id="games-overview" className="games-mini-list ui-listview">
                        {this.state.showWazda && wazdaGames}

                    </ul>
                </div>
            </div>
            <div data-role="collapsible" data-collapsed="false"
                 className="ui-collapsible ui-collapsible-themed-content ui-first-child"><h3
                className="ui-collapsible-heading"><a
                onClick={() => {
                    this.showCategory('netent');
                }}


                className={`ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-i ui-icon-carat-d ${netentClass}`}


            >Netent
                <span className="ui-collapsible-heading-status"> </span></a>
            </h3>
                <div className="ui-collapsible-content ui-body-a" aria-hidden="false"
                     style={{padding: this.state.showNetent ? '.5em 1em' : ''}}>
                    <ul data-role="listview" id="games-overview" className="games-mini-list ui-listview">
                        {this.state.showNetent && netentGames}

                    </ul>
                </div>
            </div>
            <div data-role="collapsible" data-collapsed="false"
                 className="ui-collapsible ui-collapsible-themed-content ui-first-child"><h3
                className="ui-collapsible-heading"><a
                onClick={() => {
                    this.showCategory('bomba');
                }}


                className={`ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-i ui-icon-carat-d ${bombaClass}`}


            >bomba
                <span className="ui-collapsible-heading-status"> </span></a>
            </h3>
                <div className="ui-collapsible-content ui-body-a" aria-hidden="false"
                     style={{padding: this.state.showBomba ? '.5em 1em' : ''}}>
                    <ul data-role="listview" id="games-overview" className="games-mini-list ui-listview">
                        {this.state.showBomba && bombaGames}

                    </ul>
                </div>
            </div>

            <div data-role="collapsible" data-collapsed="false"
                 className="ui-collapsible ui-collapsible-themed-content ui-first-child"><h3
                className="ui-collapsible-heading"><a
                onClick={() => {
                    this.showCategory('aristocrat');
                }}


                className={`ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-i ui-icon-carat-d ${aristocratClass}`}


            >aristocrat
                <span className="ui-collapsible-heading-status"> </span></a>
            </h3>
                <div className="ui-collapsible-content ui-body-a" aria-hidden="false"
                     style={{padding: this.state.showAristocratt ? '.5em 1em' : ''}}>
                    <ul data-role="listview" id="games-overview" className="games-mini-list ui-listview">
                        {this.state.showAristocratt && aristocratGames}

                    </ul>
                </div>
            </div>
            <div data-role="collapsible" data-collapsed="false"
                 className="ui-collapsible ui-collapsible-themed-content ui-first-child"><h3
                className="ui-collapsible-heading"><a
                onClick={() => {
                    this.showCategory('egt');
                }}


                className={`ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-i ui-icon-carat-d ${egtClass}`}


            >egt
                <span className="ui-collapsible-heading-status"> </span></a>
            </h3>
                <div className="ui-collapsible-content ui-body-a" aria-hidden="false"
                     style={{padding: this.state.showEgt ? '.5em 1em' : ''}}>
                    <ul data-role="listview" id="games-overview" className="games-mini-list ui-listview">
                        {this.state.showEgt && egtGames}

                    </ul>
                </div>
            </div>
            <div data-role="collapsible" data-collapsed="false"
                 className="ui-collapsible ui-collapsible-themed-content ui-first-child"><h3
                className="ui-collapsible-heading"><a
                onClick={() => {
                    this.showCategory('racing');
                }}


                className={`ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-i ui-icon-carat-d ${egtClass}`}


            >Racing
                <span className="ui-collapsible-heading-status"> </span></a>
            </h3>
                <div className="ui-collapsible-content ui-body-a" aria-hidden="false"
                     style={{padding: this.state.showRacing ? '.5em 1em' : ''}}>
                    <ul data-role="listview" id="games-overview" className="games-mini-list ui-listview">
                        {this.state.showRacing && racingGames}

                    </ul>
                </div>
            </div>



        </>);

        return loadingCasinoGames ? (
            <Loading/>
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
                            dataLength={casinoGamesList.length}
                            next={() => this.fetchMore(allCasinoGames)}
                            hasMore={hasMore}
                            loader={<LoadingIcon theme="dark centered"/>}
                            scrollThreshold={0.95}
                        >
                            <div className="casino__list clearfix mb-2">{gameList}</div>
                        </InfiniteScroll>
                    ) : (
                        <div className="no-data fs-15 pt-3 pb-3">No More Result Found</div>
                    )
                }
                {showLogin && <Login hideLogin={this.hideLogin}/>}
            </>
        ) : (
            <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
        );


    }

    showCategory(category) {
      
        if (category === 'racing') {
            this.setState({
                showAm: false,
                showWazda: false,
                showNovo: false,
                showNetent:false,
                showBomba: false,
                showAristocratt: false,
                showRacing: !this.state.showRacing,

            });
        }
        if (category === 'egt') {
            this.setState({
                showAm: false,
                showWazda: false,
                showNovo: false,
                showNetent:false,
                showBomba: false,
                showAristocratt: false,
                showEgt: !this.state.showEgt,
                showRacing: false ,

            });
        }

 
        if (category === 'amatic') {
            this.setState({
                showAm: !this.state.showAm,
                showWazda: false,
                showNovo: false,
                showNetent:false,
                showBomba: false,
                showAristocratt: false,
                showEgt:false,
                showRacing: false ,
            });
        }
        if (category === 'wazda') {
            this.setState({
                showAm: false,
                showWazda: !this.state.showWazda,
                showNovo: false,
                showNetent:false,
                showBomba: false,
                showAristocratt: false,
                showEgt:false,
                showRacing: false ,

            });
        }
        if (category === 'novomatic') {
            this.setState({
                showAm: false,
                showWazda: false,
                showNovo: !this.state.showNovo,
                showNetent:false,
                showBomba: false,
                showAristocratt: false,
                showEgt:false,
                showRacing: false ,

            });
        }
            if (category === 'netent') {
                this.setState({
                    showAm: false,
                    showWazda: false,
                    showNovo: false,
                    showBomba: false,
                    showNetent: !this.state.showNetent,
                    showAristocratt: false,
                    showEgt:false,
                    showRacing: false ,
                });
            }
                if (category === 'bomba') {
                    this.setState({
                        showAm: false,
                        showWazda: false,
                        showNovo: false,
                        showNetent: false,
                        showBomba: !this.state.showBomba,
                        showAristocratt: false,
                        showEgt:false,
                        showRacing: false ,
                    });

                }
                if (category === 'aristocrat') {
                    this.setState({
                        showAm: false,
                        showWazda: false,
                        showNovo: false,
                        showNetent:false,
                        showBomba: false,
                        showAristocratt: !this.state.showAristocratt,
                        showEgt:false,
                        showRacing: false ,
        
                    });
                }
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
        isShowCasino: state.general.isShowCasino,
        currentGameData: state.casino.currentGameData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getSlotGameData: (game, history) => dispatch(getSlotGameData(game, history)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));
