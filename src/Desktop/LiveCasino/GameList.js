import React, {Component} from 'react';
import PropTypes from 'prop-types';
import map from 'lodash.map';
import Loading from '../../Components/Common/NewLoading';
import NewLoading from '../../Components/Common/NewLoading';
import {getLiveGameData} from '../../store/actions/casino.actions';
import {withRouter} from 'react-router-dom';
import Login from '../../Components/Login';
import {connect} from 'react-redux';
import {LazyBackgroundImage} from '../../Components/Common/ImgLoading';
import LoaderLiveCasino from '../../Components/Common/LoaderLiveCasino';
import {LazyImage} from "../../Components/Common/ImgLoading";



class GameList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
            showAll: true,
            showPPL: true,
            showEZU: true,
            showEVO: true,
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
    // move = (arr, from, to) => {
    //     [arr[from], arr[to]] = [arr[to], arr[from]];
    //     return arr;
    // };
    render() {
        let { showLogin } = this.state;
        let {showAll, showPPL, showEZU, showEVO} = this.state;
        let {liveCasinoGames, filteredLiveCasinoGames, loadingLiveCasinoGames, noSearchResults} = this.props;
        let liveCasinoGamesList = noSearchResults ? [] : filteredLiveCasinoGames.length > 0 ? filteredLiveCasinoGames : liveCasinoGames;
        let imageUrl = "/images/comming_soon.jpg";
        let flist = liveCasinoGamesList;

        let isPPL = !showAll && showPPL;
        let isEZU = !showAll && showEZU;
        let isEVO = !showAll && showEVO;


        let evog = [];
        let ezug = [];
        let pplg = [];
        // if(flist && flist.length >0){
        //     if(flist[0]?.name !== 'Monopoly Live') flist = this.move(flist, 113, 0);
        //     if(flist[1]?.name !== 'Crazy Time') flist = this.move(flist, 96, 1);
        //     if(flist[2]?.name !== "Gonzo's Treasure Hunt") flist = this.move(flist, 106, 2);
        //     if(flist[3]?.name !== "Dream Catcher") flist = this.move(flist, 102, 3);
        //     if(flist[4]?.name !== "Deal or No Deal") flist = this.move(flist, 97, 4);
        // }

        map(flist, (game, index) => {
            console.log("game casino name: "+ game.name +' i: '+index);
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
                <div
                    className={`h2-casino ${showAll && ' active'}`}
                    onClick={() => {
                        this.showCategory('all');
                    }}><span>All</span></div>
                <div className={`h2-casino ${isPPL && ' active'}`} onClick={() => {
                    this.showCategory('ppl');
                }}><span>Pragmatic Play </span></div>

                <div className={`h2-casino ${isEVO && ' active'}`} onClick={() => {
                    this.showCategory('evo');
                }}><span>Evolution</span></div>
                <div className={`h2-casino ${isEZU && ' active'}`} onClick={() => {
                    this.showCategory('ezu');
                }}><span>Ezugi </span></div>

            </div>

            <div className="casino-provider">
                {this.state.showEVO && evog}
                {this.state.showEZU && ezug}
                {this.state.showPPL && pplg}
            </div>
        </>);

        return loadingLiveCasinoGames ? (
            <Loading/>
        ) : liveCasinoGamesList.length > 0 ? (
            <>
                <div className="casino__list pl-40 pr-40 clearfix mb-2">
                {this.props.loading ? <LoaderLiveCasino /> : <div className="casino-box-virtual-sport">{gameList}</div> }</div>

{showLogin && <Login hideLogin={this.hideLogin} />}
</>
) : (
<div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
);
}


    showCategory(category) {
        if (category === 'evo') {
            this
                .setState({
                        showAll: false,
                        showEVO: true,
                        showEZU: false,
                        showPPL: false,
                    }
                )
            ;
        }
        if (category === 'ezu') {
            this.setState({
                showAll: false,
                showEVO: false,
                showEZU: true,
                showPPL: false,
            });
        }
        if (category === 'ppl') {
            this.setState({
                showAll: false,
                showEVO: false,
                showEZU: false,
                showPPL: true,
            });
        }
        if (category === 'all') {
            this.setState({
                showAll: true,
                showEVO: true,
                showEZU: true,
                showPPL: true,
            });
        }
    }
}

GameList.propTypes =
    {
        liveCasinoGames: PropTypes.array,
        filteredLiveCasinoGames: PropTypes.array,
        loadingLiveCasinoGames: PropTypes.bool,
        noSearchResults: PropTypes.bool,
        userData: PropTypes.object,
        getLiveGameData: PropTypes.func,
    }


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
