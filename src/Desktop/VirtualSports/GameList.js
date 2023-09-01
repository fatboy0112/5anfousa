import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import map from 'lodash.map';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import Loading from '../../Components/Common/NewLoading';
import Login from '../../Components/Login';
import { getVirtualSportsData } from '../../store/actions/casino.actions';
import LoaderLiveCasino from '../../Components/Common/LoaderLiveCasino';
import {LazyImage} from "../../Components/Common/ImgLoading";

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

    componentDidUpdate () {
        if(!this.props.isShowCasino  ) {
            this.props.history.push('/d')
        }
        if(this.props.userData && !this.props.userData.is_casino_enabled) {
            this.props.history.push('/d')
        }
    }


    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    playGame = (game) => {
        if (this.isLoggedIn()) {
            let history = this.props.history;
            this.props.getVirtualSportsData(game, history);
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
        let { virtualSports, filteredVirtualSports, loadingVirtualSports, noVirtualSearchResult } = this.props;
        let virtualSportsList = noVirtualSearchResult ? [] : filteredVirtualSports.length > 0 ? filteredVirtualSports : virtualSports;
        let groupedByCategory =
            virtualSportsList &&
            virtualSportsList[0] &&
            groupBy(virtualSportsList, function (game) {
                return `${game.category}`;
            });

        let groupedByCategoryAndCompany = {};

        forEach(groupedByCategory, (group, category) => {
            let gamesGroup = groupBy(group, function (game) {
                return `${game.provider}`;
            });

            groupedByCategoryAndCompany[category] = gamesGroup;
        });


         let imageUrl = "/images/comming_soon.jpg"
        let gameList =

                       map(virtualSportsList, (game, company) => {

                          return (

                                  <li className="virtual-list-li" key={game.id}>
                                      <div className="hover-parent virtual-sport-list">
                                          {/* <LazyBackgroundImage image={game.logo} fallbackImage="./images/loading-dark.gif" className="casino-img" /> */}
                                          <div className="play-btn" onClick={() => this.playGame(game)}>
                                              <LazyImage image={game.imgURL||imageUrl} fallbackImage="/images/loading-dark.gif"  className="casino-img"/>
                                              {/*<img src="/images/playBtn-en.png" />*/}
                                          </div>
                                      </div>
                                  </li>

                              
                          );
                      });

        return loadingVirtualSports ? (
            <Loading customClass='casino-loader'/>
        ) : virtualSportsList.length > 0 ? (
            <>
                <div className="casino-game-parent pl-40 pr-40 clearfix mb-2">
                    {this.props.loading ? <LoaderLiveCasino /> : <div className="casino-box-virtual-sport">{gameList}</div> }</div>

                {showLogin && <Login hideLogin={this.hideLogin} />}
            </>
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
        isShowCasino : state.general.isShowCasino
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getVirtualSportsData: (id, history) => dispatch(getVirtualSportsData(id, history)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));
