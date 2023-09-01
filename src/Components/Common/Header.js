import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Util from '../../helper/Util';
import {Translate} from '../../localization';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {Link} from 'react-router-dom';
import Login from '../Login';
import SignUp from '../SignUp';
import {isEmpty} from 'lodash';
import {getDeviceLocation, setLanguage} from '../../store/actions/general.actions';
import {setLocationsActive, setPrematchActive} from '../../store/actions/prematchActions';
import {getCashbackData} from '../../store/actions/user.actions';
import { getJackPot } from '../../store/actions/user.actions';
import { differenceInMinutes } from 'date-fns';
import Confetti from 'react-confetti'

let jackpotInterval;
const options = ['fr','en', 'de' ];

class Header extends Component {
    constructor(props) {
        super(props);

        this.header = React.createRef();

        this.state = {
            anchorEl: null,
            selectedIndex: 0,
            showLogin: false,
            showSignUp: false,
            showMenu: false,
            cashbackAvailable: false,
            theme: '',
            limit:0,
            jackPotClass: 'disabled',
            showConfetti: false,
            jackpotMsg:'',
        };
    }

    componentDidMount() {
        let userSelectedLang = this.props.language;
        let userSelectedLangIndex = options.indexOf(userSelectedLang);

        this.props.getDeviceLocation();

        if (userSelectedLangIndex !== this.state.selectedIndex) {

            Translate.setLanguage(userSelectedLang);
            this.setState({
                selectedIndex: userSelectedLangIndex,
            });
        }

        if (this.props.userData) {
            // this.props.getCashbackData();
        }

        if (!isEmpty(this.props.cashbackData)) {
            this.setState({cashbackAvailable: this.props.cashbackData.is_cashback_available});
        }


        window.addEventListener('scroll', this.toggleHeader, false);
        if (!localStorage.getItem('theme')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
            this.setState({theme: 'light-mode'});
        } else if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'dark-mode') {
            document.body.classList.add('dark-mode');
            this.setState({theme: 'dark-mode'});
        }
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
    }

    componentDidUpdate(prevProps) {
        let {userData, cashbackData} = this.props;

        if (prevProps.country !== this.props.country && (this.props.country === 'NL' || this.props.country === 'DE') && !localStorage.getItem('language')) {
            let lang = this.props.country === 'NL' ? 'nl' : 'de';
            Translate.setLanguage(lang);
            let userSelectedLangIndex = options.indexOf(lang);
            this.changeLanguage(null, userSelectedLangIndex);
            this.setState({
                selectedIndex: userSelectedLangIndex,
            });
        }

        if (prevProps.userData !== userData && userData) {
            // getCashbackData();
        }

        if (prevProps.cashbackData !== cashbackData && !isEmpty(cashbackData)) {
            this.setState({cashbackAvailable: this.props.cashbackData.is_cashback_available});
        }

        if(localStorage.getItem('refCode') && !this.state.showSignUp && !this.isLoggedIn() && localStorage.getItem('firstRefCodeHit')){
            this.showSignUpForm();
            localStorage.removeItem('firstRefCodeHit');
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
             if(this.props.jackPotError ==='success') {
                this.setState({showConfetti:true})
                   setTimeout(()=>{                           // show animation if user wins jackpot for 10 sec
                       this.setState({showConfetti:false})
                   },10000)
                this.setState({jackpotMsg:`${this.props.jackpotUserName} won the jackpot`});
                setTimeout(()=>{                          
                       this.setState({jackpotMsg:''});
                   },10000)
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
        this.header.current.classList.remove('header_dark');
        window.removeEventListener('scroll', this.toggleHeader, false);
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

    goToPage = (path) => {
        this.props.history.push(path);
    };

    onGoBack = () => {
        if (this.props.location.pathname === '/sports' && !this.props.isLocationsActive) {
            this.props.setLocationsActive(true);
            this.props.setPrematchActive(false);
        } else this.props.history.goBack();
    };

    handleClickMenu = (event) => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    changeLanguage = (event, index) => {
        let language = options[index];
        // FIXME: For the temp work we will be sending fr as code for Portuguese language (pt)
        //if  (language === 'pt') language = 'fr';
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
        // FIXME: For the temp work we will be sending fr as code for Portuguese language "pt"
        //if  (language === 'pt') language = 'fr';
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

    showLoginForm = (e) => {
        this.setState({showLogin: true});
    };

    hideLogin = () => {
        this.setState({showLogin: false});
    };

    showSignUpForm = (e) => {
        this.setState({showSignUp: true});
    };

    hideSignUp = () => {
        this.setState({showSignUp: false});
    };

    isLoggedIn = () => {
        const {access_token} = Util.getAccessToken();
        const isUserLoggedIn = Util.isAuthTokenValid(access_token);
        return isUserLoggedIn;
    };
    handleToggle = () => {
        if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'dark-mode') {
            localStorage.setItem('theme', 'light-mode');
            document.body.classList.remove('dark-mode');
            this.setState({theme: 'light-mode'});
        } else if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'light-mode') {
            localStorage.setItem('theme', 'dark-mode');
            document.body.classList.add('dark-mode');
            this.setState({theme: 'dark-mode'});
        } else {
            localStorage.setItem('theme', 'light-mode');
            document.body.classList.remove('dark-mode');
            this.setState({theme: 'light-mode'});
        }
    }

    menuToggle = () => {
        if (!this.state.showMenu)
            this.setState({showMenu: true});
        else this.setState({showMenu: false});
    }

    render() {
        let {anchorEl, selectedIndex, showLogin, showSignUp, jackpotMsg} = this.state;
        let {userData, location, headerClassname} = this.props;
        let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'R$' : userData.currency : 'R$';

        const languageList = options.map((option, index) => (
            <MenuItem key={option} selected={index === selectedIndex}
                      onClick={(event) => this.changeLanguage(event, index)} className="text-uppercase">
                {option}
            </MenuItem>
        ));

        const languageListMobile = options.map((option, index) => (
            <option key={option} value={index} className="text-uppercase">
                {option.toUpperCase()}
            </option>
        ));

        let isNotHome = false;
        if (location.pathname !== '/') {
            isNotHome = true;
        }

        return (
            <>
              {this.state.showConfetti &&  <div style={{zIndex:'99999'}}> <Confetti
                  width={window.innerWidth||300}
                  height={window.innerHeight ||200}
                  numberOfPieces={1000}
               /></div>}
                {this.state.showMenu &&
                <>
                    <div className="show-mobile" onClick={this.menuToggle} />
                    <div className="runinmobile">
                        <ul className="nav-menu-items">
                            <li>
                                <Link to='/'>
                                    <div className="menu-box">
                                        <img src="images/home-gray.svg" alt="home-gray" className="menu_img"/>
                                        <div className="text-menu">{Translate.home}</div>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link to='/sports'>
                                    <div className="menu-box">
                                        <img src="images/sportsf.svg" alt="sportsf" className="menu_img"/>
                                        <div className="text-menu">{Translate.sports}</div>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link to='/live'>
                                    <div className="menu-box">
                                        <img src="images/liveF.svg" alt="liveF" liveF className="menu_img"/>
                                        <div className="text-menu">{Translate.live}</div>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link to='/upcoming'>
                                    <div className="menu-box">
                                        <img src="images/todayf.svg" alt="todayf" todayf className="menu_img"/>
                                        <div className="text-menu">{Translate.today}</div>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link to='/ggslot'>
                                    <div className="menu-box">
                                        <img src="images/live-casinof.svg" alt="live-casinof" className="menu_img"/>
                                        <div className="text-menu">{Translate.casino}</div>
                                    </div>
                                </Link>
                            </li>
                            {/* <li>
                                <Link to='/live-casino'>
                                    <div className="menu-box">
                                        <img src="images/virtual-sportf.png" className="menu_img"/>
                                        <div className="text-menu">{Translate.liveCasino}</div>
                                    </div>
                                </Link>
                            </li> */}
                            {/* <li>
                                <Link to='/new-casino'>
                                    <div className="menu-box">
                                        <img src="images/pragmaticf.png" className="menu_img"/>
                                        <div className="text-menu">{Translate.pragmaticPlay}</div>
                                    </div>
                                </Link>
                            </li> */}
                            {/* <li>
                                <Link to='/virtual-sports'>
                                    <div className="menu-box">
                                        <img src="images/virtual-gamesf.png" className="menu_img"/>
                                        <div className="text-menu">{Translate.virtualSports}</div>
                                    </div>
                                </Link>
                            </li> */}
                            <li>
                                <Link to='/favorites'>
                                    <div className="menu-box">
                                        <img src="images/starf.svg" alt="starf" startf className="menu_img"/>
                                        <div className="text-menu">{Translate.favorites}</div>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link to='/results'>
                                    <div className="menu-box">
                                        <img src="images/resultf.svg" alt="resultf" className="menu_img"/>
                                        <div className="text-menu">{Translate.results}</div>
                                    </div>
                                </Link>
                            </li>


                        </ul>
                    </div>
                </>}

                <div
                    className={`container header_fix d-flex align-items-center justify-content-between bg-white mui-fixed ${headerClassname}`}
                    ref={this.header}>
                    <div className="menu-mobile" onClick={this.menuToggle}>
                        <img src="/images/menu.png" alt="menu" style={{paddingTop: "5px", width: '33px', paddingRight: '5px'}}/>
                    </div>
                    <div className="d-flex align-items-center">
                        {
                            isNotHome && (
                                <div>
                                    {/* <span onClick={(e) => this.goToPage('/')}>
                                    <img src="/images/logo-mark.png" style={{ paddingTop: "5px", width: '20px', paddingRight: '5px'}}/>
                                </span> */}
                                </div>
                            )
                        }

                        {/*  {showBackBtn && (
                        <button className="header__back-btn btn-icon text-white p-1" onClick={this.onGoBack}>
                            <i className="material-icons text-white"> keyboard_arrow_left </i>
                        </button>
                    )}
                    {pageTitle ? (
                        <p className="header__title my-0">{Translate[pageTitle]}</p>
                    ) : (
                        <span className="text-white font-weight-bold disable-select header__logo-wrap" onClick={(e) => this.goToPage('/')}>
                            <img src="./images/logo2.png" alt="Logo" />
                        </span>
                    )}*/}
                        <span className="text-white font-weight-bold disable-select header__logo-wrap"
                              onClick={(e) => this.goToPage('/')}>
                            <img  style={{width:'167px'}} src="/images/logo.png" alt="Logo"/>
                        </span>
                    </div>
                    <div className="fs-22 d-flex align-items-center justify-content-end">
                        <div className="language-select">
                        <span
                            aria-haspopup="true"
                            aria-controls="language-menu"
                            className="language-select__selected text-uppercase"
                            onClick={this.handleClickMenu}
                        >
                            {options[selectedIndex]}
                        </span>

                            <Menu
                                id="language-menu"
                                className="language-select__menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={this.handleCloseMenu}
                            >
                                {languageList}
                            </Menu>
                        </div>
                        {/* <label for='time' class="mb-0 mr-2">
                        <input className='toggle-checkbox' type='checkbox' checked={ this.state.theme === 'dark-mode' } id='time' onClick={ this.handleToggle }></input>
                        <div className='toggle-slot'>
                            <div className='toggle-button'></div>
                        </div>
                    </label> */}
                        {this.isLoggedIn() ? (
                            <Link className="header__balance" to="/my-account">
                                <span>{userData ? `${Util.toFixedDecimal(userData.balance)}` : 'Loading...'}</span>
                                <br/>
                                <span className="currency-text">{currency}</span>
                            </Link>
                        ) : (
                            <Fragment>
                                <img src="/images/us.png" alt="us" width='35px' height='35px' style={{marginRight:'18px'}} onClick={this.showLoginForm}/>
                                {/*<button className="btn-in-header" onClick={this.showLoginForm}>*/}
                                {/*    {Translate.login}*/}
                                {/*</button>*/}
                                {/* <button className="btn-in-header" onClick={this.showSignUpForm}>
                                {Translate.signup}
                            </button> */}
                            </Fragment>
                        )}

                        <div className="language-drop">
                            <select className="language-select_mobile text-uppercase" value={selectedIndex}
                                    onChange={this.changeLanguageMobile}>
                                {languageListMobile}
                            </select>
                            <div>
                                <img src="/images/bottom-arrow.svg" alt="bottom-arrow" />
                            </div>
                        </div>
                    </div>

                    {showLogin && <Login hideLogin={this.hideLogin}/>}
                    {showSignUp && <SignUp hideSignUp={this.hideSignUp}/>}
                </div>
                 {userData && userData.is_jackpot_enabled && userData.last_jackpot_run &&  (
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
                        {jackpotMsg &&<span className='jackpotmsg'>{this.state.jackpotMsg}</span>}
            </>
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
        isLocationsActive: state.prematch.isLocationsActive,
        country: state.general.country,
        cashbackData: state.user.cashbackData,
        jackPotError: state.user.jackPotError,
        jackpotUserName:state.user.jackpotUserName,
        jackpotAmount:state.user.jackpotAmount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setLanguage: (value) => dispatch(setLanguage(value)),
        setLocationsActive: (value) => dispatch(setLocationsActive(value)),
        setPrematchActive: (value) => dispatch(setPrematchActive(value)),
        getDeviceLocation: () => dispatch(getDeviceLocation()),
        getCashbackData: () => dispatch(getCashbackData()),
         getJackPot: () => dispatch(getJackPot()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
