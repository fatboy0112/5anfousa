import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { LazyImage } from '../../Components/Common/ImgLoading';
import Login from '../../Components/Login';
// import { initCasinoUser } from '../../store/actions/casino.actions';
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
            <div className='casino-game-parent'>
                <div className='match-heading'>
                    <span> <img src="../images/trophy.svg" alt="img" className="top-game-icon"/> {Translate.topGames}</span>
                </div>
                    
                <div className="tab-content" id="nav-tabContent">
                    <div className="tab-pane fade show active casino-box">
                        <ul className='mb-5'>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="/images/casino/starburst.jpg" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('starburst')}>
                                        <img src="/images/playBtn-en.png" alt="playBtn-en" />
                                    </div>                      
                                </div>
                            </li>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="https://cdn.3gtraffic.com/img/games/novomatic/1_book_of_ra.jpg" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('bookofraclassic')}>
                                        <img src="/images/playBtn-en.png" />
                                    </div>                      
                                </div>
                            </li>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="https://cdn.3gtraffic.com/img/games/netent/fruitshopicon.jpg" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('fruitshop')}>
                                        <img src="/images/playBtn-en.png" />
                                    </div>                      
                                </div>
                            </li>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="https://cdn.3gtraffic.com/img/games/novomatic/sizzling-hot-deluxe.jpg" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('sizzlinghotdeluxe')}>
                                        <img src="/images/playBtn-en.png" />
                                    </div>                      
                                </div>
                            </li>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="https://cdn.3gtraffic.com/img/games/netent/reelrushicon.jpg" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('reelrush')}>
                                        <img src="/images/playBtn-en.png" />
                                    </div>                      
                                </div>
                            </li>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="/images/casino/gonzos-quest.jpg" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('eldorado')}>
                                        <img src="/images/playBtn-en.png" />
                                    </div>                      
                                </div>
                            </li>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="/images/casino/book-of-ra.jpg" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('bookofradeluxe')}>
                                        <img src="/images/playBtn-en.png" />
                                    </div>                      
                                </div>
                            </li>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="https://cdn.3gtraffic.com/img/games/amatic/grandxicon.png" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('GrandX')}>
                                        <img src="/images/playBtn-en.png" />
                                    </div>                      
                                </div>
                            </li>
                            <li>
                                <div className="hover-parent">
                                    <LazyImage image="https://cdn.3gtraffic.com/img/games/netent/gunsnrosesicon.jpg" fallbackImage="/images/loading-dark.gif" className="casino-img" />
                                    <div className="play-btn" onClick={() => this.playGame('gunsnroses')}>
                                        <img src="/images/playBtn-en.png" />
                                    </div>                      
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                {showLogin && <Login hideLogin={this.hideLogin} />}
            </div>
        );
    }
}

TopGames.propTypes = {
    userData: PropTypes.object,
    // initCasinoUser: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        casinoGames: state.casino.casinoGames,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        // initCasinoUser: (title, history, isFirstLoad) => dispatch(initCasinoUser(title, history, isFirstLoad)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopGames));
