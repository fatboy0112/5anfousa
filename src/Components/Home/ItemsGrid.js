import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Translate } from '../../localization';
import { Link } from 'react-router-dom';
import Login from '../Login';
import { getFavorites } from '../../store/actions/favorites.actions';
import Util from '../../helper/Util';

class ItemsGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,

            redirectLink: '',
        };
    }

    componentDidMount() {
        if (this.isLoggedIn()) {
            // this.props.getFavorites();
        }
    }
    showLogin = (path) => {
        if (Util.isLoggedIn()) {
            this.setState({ showLogin: false });
            this.props.history.push(path);
        } else {
            this.setState({ showLogin: true, redirectLink: path });
        }
    };

    hideLogin = () => {
        if (Util.isLoggedIn()) {
            this.setState({ showLogin: false });
            this.props.history.push(this.state.redirectLink);
        } else {
            this.setState({ showLogin: false });
        }
    };

    // showLoginForm = (e) => {
    //     this.setState({ showLogin: true });
    // };

    // hideLogin = () => {
    //     this.setState({ showLogin: false });
    // };

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    render() {
        let { isLastMinuteActive, userData, favorites, favoritesLiveMatches } = this.props;
        favorites = [...favorites, ...favoritesLiveMatches];
        let favoritesClass = favorites.length > 0 ? 'text-yellow' : '';
        let liveCasinoClass = '';
        let casinoClass = '';

        if (userData) {
            liveCasinoClass = userData.is_live_casino_enabled ? '' : 'disabled';
            casinoClass = userData.is_casino_enabled ? '' : 'disabled';
        }

        let favoritesList = this.isLoggedIn() ? (
            <Link to="/favorites" className="square ripple">
                <div className="square__content">
                    <i className={`icon-color icon-favorites lh-0 ${favoritesClass}`}></i>
                    <div className="square__text">{Translate.favorites}</div>
                </div>
            </Link>
        ) : (
            <div className="square ripple disabled">
                <div className="square__content">
                    <i className="icon-color icon-favorites lh-0"></i>
                    <div className="square__text">{Translate.favorites}</div>
                </div>
            </div>
        );

        return (
            <div className="box-list-height">
                {/*<div className="jackpot-home-img-div">*/}
                {/*    <a href="/jackpot">*/}
                {/*        <img src="/images/jackpot_img.png" className="jackpot-home-img"/>*/}
                {/*    </a>*/}
                {/*</div>*/}
                {/* <div className="sports-heading">
                    <h3>
                        Sports
                    </h3>
                </div> */}

                <div className="box-list clearfix">
                    <Link to="/sports" className="square ripple">
                        <div className="square__content">
                            {/* <i className="icon-color icon-football lh-0"></i> */}
                            <img src="images/sportsf.svg" />
                            <div className="square__text">{Translate.sports}</div>
                        </div>
                        {/* <div>
                            <i className="right-icon right-arrow"></i>
                        </div> */}
                    </Link>

                    <Link to="/live" className="square ripple">
                        <div className="square__content">
                            {/* <i className="icon-color icon-today lh-0"></i> */}
                            <img src="images/liveF.svg" />
                            <div className="square__text live-text">{Translate.live}</div>
                        </div>
                        {/* <div>
                            <i className="right-icon right-arrow"></i>
                        </div> */}
                    </Link>

                    <Link to="/upcoming" className="square ripple">
                        <div className="square__content">
                            {/* <i className="icon-color icon-today lh-0"></i> */}
                            <img src="images/todayf.svg" />
                            <div className="square__text">{Translate.today}</div>
                        </div>
                        {/* <div>
                            <i className="right-icon right-arrow"></i>
                        </div> */}
                    </Link>

                    {/* {favoritesList} */}
                    {/* <div>
                        <i className="right-icon right-arrow padding-r"></i>
                    </div*/}

                    {userData && userData.is_pcasino_enabled && (
                        <a onClick={() => this.showLogin('/p-casino')} className={` square ripple`}>
                            <div className="square__content">
                                <img src="images/live-casino-img.svg" />
                                <div className="square__text">{Translate.pCasino}</div>
                            </div>
                        </a>
                    )}

                    {userData && userData.is_gg_slot_casino_enabled && (
                        <a onClick={() => this.showLogin('/ggslot')} className={`${casinoClass} square ripple`}>
                            <div className="square__content">
                                {/* <i className="icon-color icon-score lh-0"></i> */}
                                <img src="images/pragmaticf.png" />
                                <div className="square__text">{Translate.casino}</div>
                            </div>
                        </a>
                    )}

                    {/* {this.props.isShowCasino &&<a onClick={ ()=>this.showLogin('/live-casino')}  className={`${liveCasinoClass} square ripple`}>
                        <div className="square__content">
                            <img src="images/live-casino-img.png" />
                            <div className="square__text">{Translate.liveCasino}</div>
                        </div>
                    </a>} */}
                    {/* { this.props.isShowCasino && <a  onClick={ ()=>this.showLogin('/virtual-sports')} className={`${casinoClass} square ripple`}>
                        <div className="square__content">
                            <img src="images/live-casino-img.svg" />
                            <div className="square__text">{Translate.virtualSports}</div>
                        </div>
                    </a>} */}

                    {/* {userData && userData.is_pcasino_enabled &&<a onClick={ ()=>this.showLogin('/p-casino')}  className={` square ripple`}>
                         <div className="square__content">
                             <img src="images/live-casino-img.svg" />
                             <div className="square__text">{Translate.pCasino}</div>
                         </div>
                     </a>} */}

                    {userData && userData.is_ezugi_casino_enabled && (
                        <a onClick={() => this.showLogin('/casino/lobby/ezugi')} className={` square ripple`}>
                            <div className="square__content">
                                <img src="images/live-casino-img.svg" />
                                <div className="square__text">{Translate.ezugiCasino}</div>
                            </div>
                        </a>
                    )}
                    {userData && userData.is_ezugi_casino_enabled && (
                        <a onClick={() => this.showLogin('/casino/lobby/evo')} className={` square ripple`}>
                            <div className="square__content">
                                <img src="images/live-casino-img.svg" />
                                <div className="square__text">{Translate.evoCasino}</div>
                            </div>
                        </a>
                    )}


                    <Link to="/results" className="square ripple">
                        <div className="square__content">
                            {/* <i className="icon-color icon-score lh-0"></i> */}
                            <img src="images/resultf.svg" />
                            <div className="square__text">{Translate.results}</div>
                        </div>
                        {/* <div>
                            <i className="right-icon right-arrow"></i>
                        </div> */}
                    </Link>

                    {!this.props.userData && (
                        <a onClick={() => this.showLogin('/')} className={`square ripple`}>
                            <div className="square__content">
                                {/* <i className="icon-color icon-score lh-0"></i> */}
                                <img src="images/login-color.svg" />
                                <div className="square__text">{Translate.login}</div>
                            </div>
                        </a>
                    )}

                    {this.state.showLogin && <Login hideLogin={this.hideLogin} />}
                </div>
            </div>
        );
    }
}

ItemsGrid.propTypes = {
    userData: PropTypes.object,
    language: PropTypes.string,
    favorites: PropTypes.array,
    favoritesLiveMatches: PropTypes.array,
    getFavorites: PropTypes.func,
    isLastMinuteActive: PropTypes.bool,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        language: state.general.language,
        favorites: state.favorites.favorites,
        favoritesLiveMatches: state.favorites.favoritesLiveMatches,
        isShowCasino: state.general.isShowCasino,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getFavorites: () => dispatch(getFavorites()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ItemsGrid);
