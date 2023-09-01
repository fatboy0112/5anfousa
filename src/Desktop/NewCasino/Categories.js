import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { Translate } from '../../localization';
import {
    getNewCasinoGames,
    setNewCasinoActiveCategory,
    setNewSearchStarted,
    searchNewCasino,
    clearNewCasinoGames,
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
        this.props.getNewCasinoGames();
        // if (this.props.userData !== null) {
        //     this.props.getUser();
        // }
    }

    componentWillUnmount() {
        this.props.clearNewCasinoGames();
    }

    showSearchBar = (e) => {
        let { activeCategoryNew } = this.props;
        this.setState({ isSearchOpen: true });
        this.props.setNewSearchStarted(true);

        if (activeCategoryNew !== 'All') {
            this.props.setNewCasinoActiveCategory('All');
        }
    };

    hideSearchBar = (e) => {
        this.setState({
            isSearchOpen: false,
            searchVal: '',
        });

        this.props.setNewSearchStarted(false);
        // Reset the search while closing the search bar
        this.props.searchNewCasino('');
    };

    changeCategory = (category) => {
        this.props.setNewCasinoActiveCategory(category);
    };

    handleSearch = (e) => {
        let value = e.target.value;
        const requestDelay = 300;
        this.setState({ searchVal: value });

        clearTimeout(timer);

        timer = setTimeout(() => {
            this.props.searchNewCasino(value);
        }, requestDelay);
    };

    render() {
        let { isSearchOpen, searchVal } = this.state;
        let { activeCategoryNew, newCasinoCategories } = this.props;
        //if (userData && !userData.is_new_casino_enabled) window.location.href = '/';

        let categories = map(newCasinoCategories, (category) => {
            let activeClass = activeCategoryNew === category.value ? 'casino__category_active' : '';

            return (
                <div className={`casino__category ${activeClass}`} onClick={(e) => this.changeCategory(category.value)} key={category.value}>
                    <span>
                        <i className={category.icon}></i>
                        {category.name}
                    </span>
                </div>
            );
        });

        return null

        return (
            <div className="casino-cat-div">
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
    activeCategoryNew: PropTypes.string,
    getNewCasinoGames: PropTypes.func,
    clearNewCasinoGames: PropTypes.func,
    setNewCasinoActiveCategory: PropTypes.func,
    setNewSearchStarted: PropTypes.func,
    searchNewCasino: PropTypes.func,
    getUser: PropTypes.func,
    newCasinoCategories: PropTypes.array,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        activeCategoryNew: state.casino.activeCategoryNew,
        newCasinoCategories: state.casino.newCasinoCategories,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getNewCasinoGames: () => dispatch(getNewCasinoGames()),
        clearNewCasinoGames: () => dispatch(clearNewCasinoGames()),
        setNewCasinoActiveCategory: (category) => dispatch(setNewCasinoActiveCategory(category)),
        setNewSearchStarted: (value) => dispatch(setNewSearchStarted(value)),
        searchNewCasino: (value) => dispatch(searchNewCasino(value)),
        getUser: () => dispatch(getUser()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
