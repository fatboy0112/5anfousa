import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { LazyBackgroundImage } from '../Common/ImgLoading';
import Login from '../Login';
//import { initCasinoUser } from '../../store/actions/casino.actions';
import { Translate } from '../../localization';

class TopGames extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
        };
    }

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    playGame = (title) => {
        if (this.isLoggedIn()) {
            let history = this.props.history;
           // this.props.initCasinoUser(title, history, true);
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

        return (
            <div>
                <p className="casino__title mt-0 mb-1 pl-3 font-weight-semibold text-yellow">{Translate.topGames}</p>
                <div className="casino__list pl-40 pr-40 mb-3">
                    <div className="d-flex w-100">
                        <div className="casino__item casino__item_big" onClick={() => this.playGame('starburst')}>
                            <LazyBackgroundImage image="./images/casino/starburst.jpg" fallbackImage="./images/loading-dark.gif" className="casino__img" />
                        </div>
                        <div className="casino__items">
                            <div className="casino__item" onClick={() => this.playGame('bookofraclassic')}>
                                <LazyBackgroundImage
                                    image="https://cdn.3gtraffic.com/img/games/novomatic/1_book_of_ra.jpg"
                                    fallbackImage="./images/loading-dark.gif"
                                    className="casino__img"
                                />
                            </div>
                            <div className="casino__item" onClick={() => this.playGame('fruitshop')}>
                                <LazyBackgroundImage
                                    image="https://cdn.3gtraffic.com/img/games/netent/fruitshopicon.jpg"
                                    fallbackImage="./images/loading-dark.gif"
                                    className="casino__img"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="d-flex w-100">
                        <div className="casino__items">
                            <div className="casino__item" onClick={() => this.playGame('sizzlinghotdeluxe')}>
                                <LazyBackgroundImage
                                    image="https://cdn.3gtraffic.com/img/games/novomatic/sizzling-hot-deluxe.jpg"
                                    fallbackImage="./images/loading-dark.gif"
                                    className="casino__img"
                                />
                            </div>
                            <div className="casino__item" onClick={() => this.playGame('reelrush')}>
                                <LazyBackgroundImage
                                    image="https://cdn.3gtraffic.com/img/games/netent/reelrushicon.jpg"
                                    fallbackImage="./images/loading-dark.gif"
                                    className="casino__img"
                                />
                            </div>
                        </div>

                        <div className="casino__item casino__item_big" onClick={() => this.playGame('eldorado')}>
                            <LazyBackgroundImage image="./images/casino/gonzos-quest.jpg" fallbackImage="./images/loading-dark.gif" className="casino__img" />
                        </div>
                    </div>

                    <div className="d-flex w-100">
                        <div className="casino__items">
                            <div className="casino__item casino__item_big" onClick={() => this.playGame('bookofradeluxe')}>
                                <LazyBackgroundImage image="./images/casino/book-of-ra.jpg" fallbackImage="./images/loading-dark.gif" className="casino__img" />
                            </div>
                            <div className="casino__item" onClick={() => this.playGame('GrandX')}>
                                <LazyBackgroundImage
                                    image="https://cdn.3gtraffic.com/img/games/amatic/grandxicon.png"
                                    fallbackImage="./images/loading-dark.gif"
                                    className="casino__img"
                                />
                            </div>
                        </div>
                        <div className="casino__items">
                            <div className="casino__item" onClick={() => this.playGame('gunsnroses')}>
                                <LazyBackgroundImage
                                    image="https://cdn.3gtraffic.com/img/games/netent/gunsnrosesicon.jpg"
                                    fallbackImage="./images/loading-dark.gif"
                                    className="casino__img"
                                />
                            </div>
                            <div className="casino__item casino__item_big" onClick={() => this.playGame('berryburst')}>
                                <LazyBackgroundImage image="./images/casino/berry-burst.jpg" fallbackImage="./images/loading-dark.gif" className="casino__img" />
                            </div>
                        </div>
                    </div>
                </div>

                {showLogin && <Login hideLogin={this.hideLogin} />}
            </div>
        );
    }
}

TopGames.propTypes = {
    userData: PropTypes.object,
    initCasinoUser: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
       // initCasinoUser: (title, history, isFirstLoad) => dispatch(initCasinoUser(title, history, isFirstLoad)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopGames));
