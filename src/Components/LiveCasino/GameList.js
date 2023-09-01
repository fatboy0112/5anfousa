import React, {Component} from 'react';
import PropTypes from 'prop-types';
import map from 'lodash.map';
import Loading from '../Common/NewLoading';
import NewLoading from '../Common/NewLoading';
import {getLiveGameData} from '../../store/actions/casino.actions';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {LazyBackgroundImage} from '../Common/ImgLoading';

class GameList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
            showEvo: true
        };
    }

    componentDidMount() {
        if (sessionStorage.getItem('casino_url') !== '') {
            sessionStorage.setItem('casino_url', '');
            window.location.reload(false);
        }
    }

    componentDidUpdate() {
        /* if (!this.props.isShowCasino) {
             this.props.history.push('/');
         }
         if (this.props.userData && !this.props.userData.is_live_casino_enabled) {
             this.props.history.push('/');
         }*/
    }

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    playGame = (game) => {
        if (this.isLoggedIn()) {
            let history = this.props.history;
            this.props.getLiveGameData(game, history);
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

    render() {
        let {showLogin} = this.state;
        let {liveCasinoGames, filteredLiveCasinoGames, loadingLiveCasinoGames, noSearchResults} = this.props;
        let liveCasinoGamesList = noSearchResults ? [] : filteredLiveCasinoGames.length > 0 ? filteredLiveCasinoGames : liveCasinoGames;
        let imageUrl = '/images/comming_soon.jpg';
        let flist = liveCasinoGamesList;

        let evog = [];
        let ezug = [];
        let pplg = [];
        map(flist, (game, index) => {
            if (game.id.startsWith('EVO') || game.id.startsWith('EZU') || game.id.startsWith('PPL')) {
                if (game.id.startsWith('EVO')) evog.push((
                    <div className="casino__item" key={index} onClick={() => this.playGame(game)}>
                        <LazyBackgroundImage image={game.imgURL || imageUrl} fallbackImage="./images/loading-dark.gif"
                                             className="casino__img"/>
                        <div className="game-title">{game.name} {/*game.id*/} {/*game.category*/}</div>
                    </div>
                ));
                else if (game.id.startsWith('EZU')) ezug.push((
                    <div className="casino__item" key={index} onClick={() => this.playGame(game)}>
                        <LazyBackgroundImage image={game.imgURL || imageUrl} fallbackImage="./images/loading-dark.gif"
                                             className="casino__img"/>
                        <div className="game-title">{game.name}{/*game.id}  {game.category*/}</div>
                    </div>
                ));
                else if (game.id.startsWith('PPL')) pplg.push((
                    <div className="casino__item" key={index} onClick={() => this.playGame(game)}>
                        <LazyBackgroundImage image={game.imgURL || imageUrl} fallbackImage="./images/loading-dark.gif"
                                             className="casino__img"/>
                        <div className="game-title">{game.name}{/*game.id}  {game.category*/}</div>
                    </div>
                ));

            }
        });

        let gameList = (<>
            <div className="providers-list">
                <div className="h2-casino" onClick={() => {
                    this.showCategory('all');
                }}><span>All</span></div>
                <div className="h2-casino" onClick={() => {
                    this.showCategory('ppl');
                }}><span>Pragmatic Play </span></div>

                <div className="h2-casino" onClick={() => {
                    this.showCategory('evo');
                }}><span>Evolution</span></div>
                <div className="h2-casino" onClick={() => {
                    this.showCategory('ezu');
                }}><span>Ezugi </span></div>

            </div>

            <div className="casino-provider">
                {this.state.showEvo && evog}
                {this.state.showEzu && ezug}
                {this.state.showPpl && pplg}
            </div>
        </>);

        if(loadingLiveCasinoGames)
            return (
                <Loading/>
            )

        if(liveCasinoGamesList.length > 0)
            return (<div className="casino__list pl-40 pr-40 clearfix mb-2">{this.props.loading ?
                <NewLoading/> : gameList}</div>)

        return  (
                <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
            )
    }

    showCategory(category) {
        if (category === 'evo') {
            this
                .setState({
                        showEvo: true,
                        showEzu: false,
                        showPpl: false,

                    }
                )
            ;
        }
        if (category === 'ezu') {
            this.setState({
                showEvo: false,
                showEzu: true,
                showPpl: false,
            });
        }
        if (category === 'ppl') {
            this.setState({
                showEvo: false,
                showEzu: false,
                showPpl: true,
            });
        }
        if (category === 'all') {
            this.setState({
                showEvo: true,
                showEzu: true,
                showPpl: true,
            });
        }
    }
}

GameList.propTypes =
    {
        liveCasinoGames: PropTypes.array,
        filteredLiveCasinoGames:
        PropTypes.array,
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
            isShowCasino: state.general.isShowCasino
        };
    }
;

const mapDispatchToProps = (dispatch) => {
        return {
            getLiveGameData: (id, history) => dispatch(getLiveGameData(id, history)),
        };
    }
;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));
