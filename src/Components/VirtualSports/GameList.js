import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import map from 'lodash.map';
import Loading from '../Common/NewLoading';
import Login from '../Login';
import {getVirtualSportsData} from '../../store/actions/casino.actions';
import LoaderLiveCasino from '../Common/Loading';
import {LazyBackgroundImage} from "../Common/ImgLoading";
import {findAllInRenderedTree} from "react-dom/test-utils";

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

    componentDidUpdate() {
        /*if (!this.props.isShowCasino) {
            this.props.history.push('/')
        }
        if (this.props.userData && !this.props.userData.is_casino_enabled) {
            this.props.history.push('/')
        }*/
    }

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    playGame = (game) => {
        if (this.isLoggedIn()) {
            let history = this.props.history;
            this.props.getVirtualSportsData(game, history);
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
        let {virtualSports, filteredVirtualSports, loadingVirtualSports, noVirtualSearchResult} = this.props;
        let virtualSportsList = noVirtualSearchResult ? [] : filteredVirtualSports.length > 0 ? filteredVirtualSports : virtualSports;


        let flist = virtualSportsList;
        let imageUrl = "/images/comming_soon.jpg"
        let evog = [];
        map(flist, (game, index) => {
            evog.push((
                <div className="casino__item" key={index} >
                    <LazyBackgroundImage image={game.imgURL||imageUrl} fallbackImage="./images/loading-dark.gif"
                                         className="casino__img"/>
                    <div className="game-title"onClick={() => this.playGame(game)}>{game.name} </div>
                </div>
            ));

        });


        let gameList = (<>
            <div className="h2-casino" ></div>
            {evog}
        </>);

        return loadingVirtualSports ? (
            <Loading/>
        ) : virtualSportsList.length > 0 ? (
            <div className="virtulgames">
                <div className="casino__list pl-40 pr-40 clearfix mb-2 margin__top">{this.props.loading ?
                    <LoaderLiveCasino customClass='color_dark'/> : gameList}</div>

                {showLogin && <Login hideLogin={this.hideLogin}/>}
            </div>
        ) : (
            <div className="no-data fs-15 pt-3 pb-3">Nothing Found</div>
        );
    }
}

GameList.propTypes = {
    virtualSports: PropTypes.array,
    filteredVirtualSports: PropTypes.array,
    loadingVirtualSports: PropTypes.bool,
    noVirtualSearchResult: PropTypes.bool,
    userData: PropTypes.object,
    getVirtualSportsData: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        virtualSports: state.casino.virtualSports,
        filteredVirtualSports: state.casino.filteredVirtualSports,
        loadingVirtualSports: state.casino.loadingVirtualSports,
        noVirtualSearchResult: state.casino.noVirtualSearchResult,
        userData: state.user.data,
        loading: state.general.loading,
        isShowCasino: state.general.isShowCasino
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getVirtualSportsData: (id, history) => dispatch(getVirtualSportsData(id, history)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));
