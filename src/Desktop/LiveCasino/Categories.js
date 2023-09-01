import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { Translate } from '../../localization';
import {
    getLiveCasinoGames,
    setLiveCasinoActiveCategory,
    setLiveSearchStarted,
    searchLiveCasino,
    clearLiveCasinoGames,
} from '../../store/actions/casino.actions';
import { getUser } from '../../store/actions/user.actions';

let timer = 0;

class Categories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSearchOpen: false,
            searchVal: '',
        };
    }

    componentDidMount() {
        this.props.getLiveCasinoGames();
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
        this.props.searchLiveCasino('')
    };

    changeCategory = (category) => {
        this.props.setLiveCasinoActiveCategory(category);
    };

    handleSearch = (e) => {
        let value = e.target.value;
        const requestDelay = 300;
        this.setState({ searchVal: value });

        clearTimeout(timer);

        timer = setTimeout(() => {
            this.props.searchLiveCasino(value);
        }, requestDelay);
    };

    render() {
        let { isSearchOpen, searchVal } = this.state;
        let { activeCategoryLive, liveCasinoCategories } = this.props;
        //if (userData && !userData.is_live_casino_enabled) window.location.href = '/';

        let categories = map(liveCasinoCategories, (category) => {
            let activeClass = activeCategoryLive === category.value ? 'casino__category_active' : '';
            return (
                <div className={`casino__category ${activeClass}`} onClick={(e) => this.changeCategory(category.value)} key={category.value}>
                    <span>
                        <i className={category.icon}></i>
                        {category.name}
                    </span>
                </div>
            );
        });

        return (
            <div className="added-category">
                {isSearchOpen ? (
                    <div className="casino__header mb-3 disable-select">
                        <div className="sports__content sports__content_sm">
                            <div className="sports__search-bar">
                                <input
                                    type="text"
                                    className="ml-2 form-control sports__search-input"
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
                    </div>
                ) : (
                    <div className="casino__header mb-3">
                        <div className="casino__category casino__category-search" onClick={this.showSearchBar}>
                            <span>
                                <i className="icon-search"></i>
                            </span>
                        </div>

                        {categories}
                    </div>
                )}
            </div>
        );
    }
}

Categories.propTypes = {
    activeCategoryLive: PropTypes.string,
    getLiveCasinoGames: PropTypes.func,
    clearLiveCasinoGames: PropTypes.func,
    setLiveCasinoActiveCategory: PropTypes.func,
    setLiveSearchStarted: PropTypes.func,
    searchLiveCasino: PropTypes.func,
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
        getLiveCasinoGames: () => dispatch(getLiveCasinoGames()),
        clearLiveCasinoGames: () => dispatch(clearLiveCasinoGames()),
        setLiveCasinoActiveCategory: (category) => dispatch(setLiveCasinoActiveCategory(category)),
        setLiveSearchStarted: (value) => dispatch(setLiveSearchStarted(value)),
        searchLiveCasino: (value) => dispatch(searchLiveCasino(value)),
        getUser: () => dispatch(getUser()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
