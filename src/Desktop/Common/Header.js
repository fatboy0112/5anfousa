import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { Translate } from '../../localization';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu'
// import { Link } from 'react-router-dom';
// import Login from '../../../Components/Login';
import { getDeviceLocation, setLanguage, getTenentStatus } from '../../store/actions/general.actions';
import { setLocationsActive, setPrematchActive } from '../../store/actions/prematchActions';
import Login from '../Login';
import SignUp from '../SignUp';
import MyAccount from '../MyAccount';
import { Link } from 'react-router-dom';
import LoginPop from '../../Components/Login';
import { getJackPot } from '../../store/actions/user.actions';
import { differenceInMinutes } from 'date-fns';
import Confetti from 'react-confetti'
let jackpotInterval;

const options = ['en', 'de', 'fr'];

class Header extends Component {
    constructor(props) {
        super(props);

        this.header = React.createRef();

        this.state = {
            date: new Date().toLocaleString('fr-FR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                weekday: "long", hour: '2-digit',
                hour12: false, minute: '2-digit'
            }),
            anchorEl: null,
            selectedIndex: 0,
            showSignUp: false,
            showMyAccount: false,
            theme: '',
            ShowleftItems: true,
            showLogin: false,
            redirectLink: '',
            limit: 0,
            jackPotClass: 'disabled',
            showConfetti: false,
            jackpotMsg: '',


        };
    }

    componentDidMount() {
        let userSelectedLang = this.props.language;
        let currentPath = this.props.location.pathname;
        let pathIndex = currentPath.split('/');
        if (pathIndex[2] === 'live-casino' || pathIndex[2] === 'casino' || pathIndex[2] === 'virtual-sports') {
            this.setState({
                ShowleftItems: false
            });
        }
        let userSelectedLangIndex = options.indexOf(userSelectedLang);
        this.props.getTenentStatus();
        this.props.getDeviceLocation();
        if (userSelectedLangIndex !== this.state.selectedIndex) {

            Translate.setLanguage(userSelectedLang);
            this.setState({
                selectedIndex: userSelectedLangIndex,
            });
        }

        window.addEventListener('scroll', this.toggleHeader, false);
        if (!localStorage.getItem('theme')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
            this.setState({ theme: 'light-mode' });
        }
        else if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'dark-mode') {
            document.body.classList.add('dark-mode');
            this.setState({ theme: 'dark-mode' });
        }

        // if(this.props.location.pathname === '/d/promotion')
        // {
        //     sessionStorage.setItem('isPromotionActive', true);
        // }
        if (this.props.userData && this.props.userData.is_jackpot_enabled && this.props.userData.last_jackpot_run) {
            let currentTimeDiff = differenceInMinutes(new Date(), new Date(this.props.userData.last_jackpot_run)) * 60;
            let addLimit = this.props.userData.jackpot_amount / (this.props.userData.jackpot_time_limit * 60 * 60);
            let amountPerSec = this.props.userData.jackpot_amount / (this.props.userData.jackpot_time_limit * 60 * 60);
            this.setState({ limit: currentTimeDiff * amountPerSec });

            jackpotInterval = setInterval(() => {
                this.setState({ limit: this.state.limit + addLimit });
                if (this.state.limit >= this.props.userData.jackpot_amount) {
                    this.setState({ jackPotClass: '' });
                    clearInterval(jackpotInterval);
                    this.props.getJackPot();
                }
            }, 1000);
        }
        setInterval(() => {
            this.setState({
                date: new Date().toLocaleString('fr-FR', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    weekday: "long", hour: '2-digit',
                    hour12: false, minute: '2-digit'
                })
            })
        }, 1000)
    }

    componentDidUpdate(prevProps) {

        if (prevProps.country !== this.props.country && this.props.country === 'NL' && !localStorage.getItem('language')) {
            Translate.setLanguage('nl');
            let userSelectedLangIndex = options.indexOf('nl');
            this.changeLanguage(null, userSelectedLangIndex);
            this.setState({
                selectedIndex: userSelectedLangIndex,
            });
        }
        if (!prevProps.userData && prevProps.userData !== this.props.userData && this.props.userData.last_jackpot_run && this.props.userData.is_jackpot_enabled) {
            let currentTimeDiff = differenceInMinutes(new Date(), new Date(this.props.userData.last_jackpot_run)) * 60;
            let addLimit = this.props.userData.jackpot_amount / (this.props.userData.jackpot_time_limit * 60 * 60);
            let amountPerSec = this.props.userData.jackpot_amount / (this.props.userData.jackpot_time_limit * 60 * 60);
            this.setState({ limit: currentTimeDiff * amountPerSec });

            jackpotInterval = setInterval(() => {
                this.setState({ limit: this.state.limit + addLimit });
                if (this.state.limit >= this.props.userData.jackpot_amount) {
                    this.setState({ jackPotClass: '' });
                    clearInterval(jackpotInterval);
                    this.props.getJackPot();
                }
            }, 1000);
        }

        if (prevProps.jackPotError !== this.props.jackPotError && this.props.jackPotError) {
            clearInterval(jackpotInterval);
            this.setState({ jackPotClass: 'disabled' });
            if (this.props.jackPotError === 'success') {
                this.setState({ showConfetti: true })
                setTimeout(() => {                           // show animation if user wins jackpot for 10 sec
                    this.setState({ showConfetti: false })
                }, 10000)
                this.setState({ jackpotMsg: `${this.props.jackpotUserName} won the jackpot` });
                setTimeout(() => {
                    this.setState({ jackpotMsg: '' });
                }, 10000)
            }
            setTimeout(() => {
                // restart jackpot after 10 sec

                let currentTimeDiff = differenceInMinutes(new Date(), new Date(this.props.userData.last_jackpot_run)) * 60;
                let addLimit = this.props.userData.jackpot_amount / (this.props.userData.jackpot_time_limit * 60 * 60);
                let amountPerSec = this.props.userData.jackpot_amount / (this.props.userData.jackpot_time_limit * 60 * 60);
                this.setState({ limit: currentTimeDiff * amountPerSec });

                jackpotInterval = setInterval(() => {
                    this.setState({ limit: this.state.limit + addLimit });
                    if (this.state.limit >= this.props.userData.jackpot_amount) {
                        this.setState({ jackPotClass: '' });
                        clearInterval(jackpotInterval);
                        this.props.getJackPot();
                    }
                }, 1000);
            }, 10000);
        }
    }

    componentWillUnmount() {
        clearInterval(jackpotInterval);
        if (this.header.current) this.header.current.classList.remove('header_dark');
        const lastUrl = localStorage.getItem('lastUrl');
        localStorage.setItem('lastUrl', this.props.location.pathname);
        localStorage.setItem('secondLastUrl', lastUrl);
        window.removeEventListener('scroll', this.toggleHeader, false);
        localStorage.setItem('LastUrl', this.props.location.pathname);
    }

    toggleHeader = () => {
        if (this.props.headerClassname === 'header_transparent') {
            if (window.pageYOffset > this.header.current.clientHeight) {
                this.header.current.classList.add('header_dark');
            } else {
                this.header.current.classList.remove('header_dark');
            }
        }
    };

    handleClickMenu = (event) => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    changeLanguage = (event, index) => {
        let language = options[index];
        // FIXME: For the temp work we will be sending fr as code for Portuguese language (pt)
        // if  (language == 'pt') language = 'fr';
        Translate.setLanguage(language);
        this.props.setLanguage(Translate.getLanguage());
        localStorage.setItem('language', language);

        this.setState({
            anchorEl: null,
            selectedIndex: index,
        });
    };

    changeLanguageMobile = (event) => {
        let index = parseInt(event.target.value);
        let language = options[index];
        // FIXME: For the temp work we will be sending fr as code for Portuguese language (pt)
        //if  (language == 'pt') language = 'fr';
        Translate.setLanguage(language);
        this.props.setLanguage(Translate.getLanguage());
        localStorage.setItem('language', language);

        this.setState({
            selectedIndex: index,
        });
    };

    handleCloseMenu = () => {
        this.setState({
            anchorEl: null,
        });
    };
    showLoginForm = (path) => {
        if (Util.isLoggedIn()) {
            this.setState({ showLogin: false });
            this.props.history.push(path);
        }
        else {
            this.setState({
                showLogin: true,
                redirectLink: path
            });
            ;
        }

    };

    hideLogin = () => {

        if (Util.isLoggedIn()) {
            this.setState({ showLogin: false });
            this.props.history.push(this.state.redirectLink);
        }
        else {
            this.setState({ showLogin: false });
        }
    };


    showSignUpForm = (e) => {
        this.setState({ showSignUp: true });
    };

    hideSignUp = () => {
        this.setState({ showSignUp: false });
    };

    isLoggedIn = () => {
        const { access_token } = Util.getAccessToken();
        const isUserLoggedIn = Util.isAuthTokenValid(access_token);
        return isUserLoggedIn;
    };

    handleToggle = () => {
        if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'dark-mode') {
            localStorage.setItem('theme', 'light-mode');
            document.body.classList.remove('dark-mode');
            this.setState({ theme: 'light-mode' });
        }
        else if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'light-mode') {
            localStorage.setItem('theme', 'dark-mode');
            document.body.classList.add('dark-mode');
            this.setState({ theme: 'dark-mode' });
        } else {
            localStorage.setItem('theme', 'light-mode');
            document.body.classList.remove('dark-mode');
            this.setState({ theme: 'light-mode' });
        }
    }



    render() {
        let { anchorEl, selectedIndex, showSignUp, showMyAccount, jackpotMsg } = this.state;
        let { userData } = this.props;
        let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';
        const languageList = options.map((option, index) => (
            <MenuItem key={option} selected={index === selectedIndex} onClick={(event) => this.changeLanguage(event, index)} className="text-uppercase">
                {option}
            </MenuItem>
        ));

        let liveCasinoClass = '';
        let casinoClass = '';

        if (userData) {
            liveCasinoClass = userData.is_live_casino_enabled ? '' : 'disabled';
            casinoClass = userData.is_casino_enabled ? '' : 'disabled';
        }

        let extraMarketPre = this.props.location.pathname?.includes('/extra-market');
        let extraMarketLive = this.props.location.pathname?.includes('live-bettingextra-market');
        return (
            <Fragment>
                {this.state.showConfetti && <div style={{ zIndex: '99999' }}> <Confetti
                    width={window.innerWidth || 300}
                    height={window.innerHeight || 200}
                    numberOfPieces={1000}
                /></div>}
                <header id="header-50" className="d-flex  align-items-center ">
                    <div className="logo d-flex">
                        <a href="/d">
                            <img className='top-header__logo' src="/images/logo.png" alt="Logo" />
                        </a>
                        {/*
                        <span className="text-white font-weight-bold">
                            <i className="icon-logo-1"></i>
                            <i className="icon-logo-2"></i>
                        </span> */}
                    </div>
                    {/* <ul className=" menu d-flex flex-grow-1">
                        <li className={`${this.props.location.pathname === '/d' && 'active'}`}><Link to="/d">{Translate.home}</Link></li>
                        <li className={`${(this.props.location.pathname === '/d/sports' || extraMarketPre) && 'active'}`}><Link to="/d/sports">{ Translate.sports }</Link></li>
                        <li className={`${(this.props.location.pathname === '/d/live-betting'|| extraMarketLive) && 'active'}`}><Link to="/d/live-betting">{ Translate.inplay }</Link></li>
                        {userData && userData.is_gg_slot_casino_enabled && <li className={`${this.props.location.pathname === '/d/ggslot' && 'active'}`}><a onClick={ ()=>this.showLoginForm('/d/ggslot')}>{Translate.casino}</a></li>}
                        {this.props.isShowCasino && <li className={`${this.props.location.pathname === '/d/live-casino' && 'active'} ${liveCasinoClass}`}><a onClick={ ()=>this.showLoginForm('/d/live-casino')}>{Translate.liveCasino}</a></li>}
                        {this.props.isShowCasino && <li className={`${this.props.location.pathname === '/d/new-casino' && 'active'} ${liveCasinoClass}`}><a onClick={ ()=>this.showLoginForm('/d/new-casino')}>{Translate.pragmaticPlay}</a></li>}
                        {this.props.isShowCasino &&<li className={`${this.props.location.pathname === '/d/virtual-sports' && 'active'} ${casinoClass}`}><a onClick={ ()=>this.showLoginForm('/d/virtual-sports')}>{Translate.virtualSports}</a></li>}
                        <li className={`${this.props.location.pathname?.includes('/d/promotion') && 'active'} `}><Link to="/d/promotion">{Translate.promotion}</Link></li>
                        <li className={`${this.props.location.pathname === '/d/results' && 'active'}`}><Link to="/d/results">{Translate.results }</Link></li>
                    </ul> */}

                    {/* <label for='time' class="mb-0 mr-2">
                        <input className='toggle-checkbox' type='checkbox' id='time' checked={ this.state.theme === 'dark-mode' } onClick={ this.handleToggle }></input>
                        <div className='toggle-slot'>
                            <div className='toggle-button'></div>
                        </div>
                    </label> */}

                    {this.state.ShowleftItems && <div className="head-right d-flex">
                        {userData && userData.is_jackpot_enabled && userData.last_jackpot_run && (
                            <div id="w-100">
                                <div id="jackpotMobile">
                                    {/* <a href="/jackpot" class="  "> */}
                                    <span id="ss" className={this.state.jackPotClass}>
                                        Jackpot
                                    </span>
                                    {/* </a> */}
                                    <span id="s">{Util.toFixedDecimal(+this.state.limit)}</span>
                                    <span id="ss">TND</span>
                                </div>
                            </div>
                        )}
                        {jackpotMsg && <span className='jackpotmsg'>{this.state.jackpotMsg}</span>}
                        {this.isLoggedIn() ? (
                            <React.Fragment>
                                <div className="user-detail">
                                    <div className="d-flex align-items-center">
                                        <div className="user-p">
                                            <span><i className="icon-my-account"></i></span>
                                        </div>
                                        <p>
                                            {userData?.username}
                                            <span> {userData ? `${Util.toFixedDecimal(userData.balance)} ${currency}` : `Loading... ${currency}`} </span>
                                        </p>
                                    </div>
                                </div>
                                <div className='btn-group d-flex align-items-center'>
                                    <button onClick={() => this.setState({ showMyAccount: true })}>
                                        {Translate.myAccount}
                                    </button>
                                </div>
                            </React.Fragment>
                        ) : (
                            <Fragment>
                                <Login />
                                {/* <div className="btn-group">
                                    <button
                                        onClick={ this.showSignUpForm }
                                    >
                                        {Translate.signup}
                                    </button>
                                </div> */}
                            </Fragment>
                        )}
                        <div className="btn-group">
                            <div className="dropdown country-btn">
                                <a
                                    aria-haspopup="true"
                                    aria-controls="language-menu"
                                    className="btn language-select__selected text-uppercase"
                                    onClick={this.handleClickMenu}
                                    role="button"
                                    href
                                >
                                    {options[selectedIndex < 0 ? 0 : selectedIndex]}
                                </a>
                                <Menu
                                    id="language-menu"
                                    style={{ height: '300px', overflowY: 'auto' }}
                                    //className="dropdown-menu show"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={this.handleCloseMenu}
                                >
                                    {languageList}
                                </Menu>
                            </div>
                        </div>
                    </div>}
                    {showMyAccount && <MyAccount onClose={() => this.setState({ showMyAccount: false })} />}
                </header>
                <div className="sub-header">
                    <div className="sub-header__center">
                        <div className="main-menu">
                            {/* <a className="main-menu__item main-menu__item_active" href="/">Accueil</a> */}
                            <Link className={`main-menu__item ${this.props.location.pathname === '/d' && 'main-menu__item_active'} `} to="/d">Accueil</Link>
                            <Link className={`main-menu__item ${(this.props.location.pathname === '/d/sports' || extraMarketPre) && 'main-menu__item_active'}`} to="/d/sports">{Translate.sports}</Link>
                            <Link className={`main-menu__item ${(this.props.location.pathname === '/d/live-betting' || extraMarketLive) && 'main-menu__item_active'} `} to="/d/live-betting">Live</Link>
                            <Link className={`main-menu__item ${this.props.location.pathname === '/d/casino' && 'main-menu__item_active'} `} to="/d">Casino</Link>
                            <Link className={`main-menu__item ${this.props.location.pathname === '/d/live-casino' && 'main-menu__item_active'} `} to="/d">Live Casino</Link>
                            {
                                userData && userData.is_gg_slot_casino_enabled &&
                                <Link to='/d/ggslot' onClick={() => this.showLoginForm('/d/casino')} className={`main-menu__item ${this.props.location.pathname === '/d/ggslot' && 'active'} ${casinoClass}`}>
                                    {Translate.casino}
                                </Link>
                            }
                            {/* {this.props.isShowCasino && <Link to="/d/live-casino" className={`main-menu__item ${this.props.location.pathname === '/d/live-casino' && 'main-menu__item_active'} ${liveCasinoClass}`} onClick={ ()=>this.showLoginForm('/d/live-casino')}>{Translate.liveCasino}</Link>} */}
                            {/* {this.props.isShowCasino &&<Link to='/d/virtual-sports'  className={`main-menu__item ${this.props.location.pathname === '/d/virtual-sports' && 'main-menu__item_active'} ${casinoClass}`} onClick={ ()=>this.showLoginForm('/d/virtual-sports')}>{Translate.virtualSports}</Link>} */}
                            {/* {this.props.isShowCasino &&<Link to='/d/pragmatic-play'  className={`main-menu__item ${this.props.location.pathname === '/d/pragmatic-play' && 'main-menu__item_active'} ${casinoClass}`} onClick={ ()=>this.showLoginForm('/d/pragmatic-play')}>CASINO SLOT</Link>} */}

                            {/* {this.props.isShowCasino && <Link to="/d/new-casino" className={`main-menu__item ${this.props.location.pathname === '/d/new-casino' && 'main-menu__item_active'} ${liveCasinoClass}`} onClick={ ()=>this.showLoginForm('/d/new-casino')}>{Translate.pragmaticPlay}</Link>} */}
                            {/*   <Link to="/d/promotion" className={`main-menu__item ${this.props.location.pathname?.includes('/d/promotion') && 'main-menu__item_active'} `}>{Translate.promotion}</Link> */}

                            {userData && userData.is_pcasino_enabled &&<Link to='/d/p-casino'  className={`main-menu__item ${this.props.location.pathname === '/d/p-casino' && 'main-menu__item_active'}`} onClick={ ()=>this.showLoginForm('/d/p-casino')}>{Translate.pCasino}</Link>}

                            {userData && userData.is_ezugi_casino_enabled && <Link to='/d/casino/lobby/ezugi' className={`main-menu__item ${this.props.location.pathname === '/d/casino/lobby/ezugi' && 'main-menu__item_active'} `} onClick={() => this.showLoginForm('/d/casino/lobby/ezugi')}>{Translate.ezugiCasino}</Link>}

                            {userData && userData.is_ezugi_casino_enabled && <Link to="/d/casino/lobby/evo" className={`main-menu__item ${this.props.location.pathname === '/d/casino/lobby/evo' && 'main-menu__item_active'} `} onClick={() => this.showLoginForm('/d/casino/lobby/evo')}>{Translate.evoCasino}</Link>}


                            <Link to="/d/results" className={`main-menu__item ${this.props.location.pathname === '/d/results' && 'main-menu__item_active'}`}>{Translate.results}</Link>

                            {/* <a className="main-menu__item" href="/bc?type=0">Sport</a>
                            <a className="main-menu__item" href="/slots">Jeux d'adresses</a>
                            <a className="main-menu__item" href="/virtual-games/golden-race">Jeux virtuels</a>
                            <a className="main-menu__item" href="/liveGames?sP=evolution">JEUX TV LIVE</a>
                            <a className="main-menu__item" href="/bc/results">Résultats</a> */}
                        </div>
                    </div>
                    <div className="sub-header__block">
                        <span className="time"> {this.state.date.replaceAll('/', '.').replace(',', '')}</span>
                    </div>
                    {/* <div className="sub-header__settings-language">Langue: <div className="set-language">
                            <div className="set-language__top">
                            <img className="set-language__item" src="/img/src/shared/locale/img/fr.png" alt="Le français" />
                            <span className="SVGInline set-language__arrow">
                                <svg className="SVGInline-svg set-language__arrow-svg" viewBox="0 0 8 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.976562 0H7.02344C7.22656 0 7.36719 0.101562 7.44531 0.304688C7.52344 0.492188 7.49219 0.65625 7.35156 0.796875L4.32812 3.82031C4.23438 3.91406 4.125 3.96094 4 3.96094C3.875 3.96094 3.76562 3.91406 3.67188 3.82031L0.648438 0.796875C0.507812 0.65625 0.476562 0.492188 0.554688 0.304688C0.632812 0.101562 0.773438 0 0.976562 0Z" fill="white" />
                                </svg>
                            </span>
                            </div>
                            <div className="set-language__items">
                            <img className="set-language__item" src="/img/src/shared/locale/img/en.png" alt="English" />
                            </div>
                        </div>
                        </div> */}
                </div>
                {showSignUp && <SignUp hideSignUp={this.hideSignUp} />}
                {this.state.showLogin && <LoginPop hideLogin={this.hideLogin} />}

            </Fragment>
        );
    }
}

Header.propTypes = {
    userData: PropTypes.object,
    setLanguage: PropTypes.func,
    language: PropTypes.string,
    headerClassname: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        language: state.general.language,
        country: state.general.country,
        isShowCasino: state.general.isShowCasino,
        jackPotError: state.user.jackPotError,
        jackpotUserName: state.user.jackpotUserName,
        jackpotAmount: state.user.jackpotAmount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setLanguage: (value) => dispatch(setLanguage(value)),
        setLocationsActive: (value) => dispatch(setLocationsActive(value)),
        setPrematchActive: (value) => dispatch(setPrematchActive(value)),
        getDeviceLocation: () => dispatch(getDeviceLocation()),
        getTenentStatus: () => dispatch(getTenentStatus()),
        getJackPot: () => dispatch(getJackPot()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
