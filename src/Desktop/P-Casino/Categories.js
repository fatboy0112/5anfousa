import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { Translate } from '../../localization';
import {
   setPCasinoActiveCategory,
    setLiveSearchStarted,
    searchPCasino,
    clearLiveCasinoGames,
    getLiveCasinoGames,
    getpCasinoGames
} from '../../store/actions/casino.actions';
import { getUser } from '../../store/actions/user.actions';

let timer = 0;

const options = {
    items: 9,
    navText: [
        '<span class=\'nav-btn prev-slide\'></span>',
        '<span class=\'nav-btn next-slide\'></span>'
    ],
    nav: true,
    dots: false,
    autoWidth: true,
};

class Categories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSearchOpen: false,
            searchVal: '',
        };
    }

    componentDidMount() {
        this.props.getpCasinoGames();
        if (this.props.userData !== null) {
            this.props.getUser();
        }
    }

    componentWillUnmount() {
        this.props.clearLiveCasinoGames();
    }

    showSearchBar = (e) => {
        let { activeCategoryLive } = this.props;
        this.setState({ isSearchOpen: true });
        this.props.setLiveSearchStarted(true);

        if (activeCategoryLive !== 'All') {
            this.props.setLiveCasinoActiveCategory('All');
        }
    };

    hideSearchBar = (e) => {
        this.setState({
            isSearchOpen: false,
            searchVal: '',
        });

        this.props.setLiveSearchStarted(false);
        // Reset the search while closing the search bar
        this.props.searchPCasino('');
    };

    changeCategory = (category) => {
        this.props.setPCasinoActiveCategory(category);
    };

    handleSearch = (e) => {
        let value = e.target.value;
        const requestDelay = 300;
        this.setState({ searchVal: value });

        clearTimeout(timer);

        timer = setTimeout(() => {
            this.props.searchPCasino(value);
        }, requestDelay);
    };

    render() {
        let { isSearchOpen, searchVal } = this.state;
        let { activeCategoryLive, liveCasinoCategories } = this.props;
        // If user is not authorised redirect to home
        //if (userData && !userData.is_live_casino_enabled) window.location.href = '/';
        let categories = liveCasinoCategories?.length > 0 && typeof liveCasinoCategories?.[0] === 'string' && map(liveCasinoCategories, (category) => {
            let categoryVal = category;
            // if (category.company === 'PragmaticLiveCasino') categoryVal = category.id;
            let activeClass = activeCategoryLive === categoryVal ? 'active' : '';

            return (
                <a href className={ `${category === 'All' ? 'all-' : ''}${activeClass}`} onClick={(e) => this.changeCategory(categoryVal)} key={categoryVal}>
                    <i className={ `${category} pr-1` }  />
                    {category}
                </a>
            );
        });

        return (
            <div className="categories">
                {isSearchOpen ? (
                    <div className="tab">
                        <div className="sports__search-bar">
                            <input
                                type="text"
                                className="ml-2 sports__search-input w-100"
                                autoFocus
                                placeholder={Translate.searchHere}
                                value={searchVal}
                                onChange={this.handleSearch}
                            />
                            <i className="icon-search"></i>
                            <div className="sports__close-search">
                                <i className="material-icons casino-close" onClick={this.hideSearchBar}>
                                    close
                                </i>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="tab">
                        <div onClick={this.showSearchBar}>
                            <span>
                                <img src="/images/search-icon.png" alt="search-icon" style={{ marginLeft: '30px', width: '25px', marginRight: '15px'}} />
                            </span>
                        </div>
                        <div className='carousel-parent casino-page'>
                            <div className="nav" id="nav-tab"  role="tablist">
                                { categories.length > 0 && (
                                <div
                                    id='owl-demo'
                                    options={ options }
                                >
                                    {categories}
                                </div>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

Categories.propTypes = {
    activeCategoryLive: PropTypes.string,
    setLiveCasinoGames: PropTypes.func,
    clearLiveCasinoGames: PropTypes.func,
    setLiveCasinoActiveCategory: PropTypes.func,
    setLiveSearchStarted: PropTypes.func,
    searchPCasino: PropTypes.func,
    getUser: PropTypes.func,
    liveCasinoCategories: PropTypes.array,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        activeCategoryLive: state.casino.activeCategoryLive,
        liveCasinoCategories: state.casino.liveCasinoCategories,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
      getpCasinoGames: () => dispatch(getpCasinoGames()),

        getLiveCasinoGames: () => dispatch(getLiveCasinoGames()),
        clearLiveCasinoGames: () => dispatch(clearLiveCasinoGames()),
        setPCasinoActiveCategory: (category) => dispatch(setPCasinoActiveCategory(category)),
        setLiveSearchStarted: (value) => dispatch(setLiveSearchStarted(value)),
        searchPCasino: (value) => dispatch(searchPCasino(value)),
        getUser: () => dispatch(getUser()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
