import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { Translate } from '../../localization';
import { getCasinoGames, setCasinoActiveCategory, setSearchStarted, searchCasino, clearCasinoGames } from '../../store/actions/casino.actions';
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
        this.props.getCasinoGames();
        if (this.props.userData !== null) {
            this.props.getUser();
        }
    }

    componentWillUnmount() {
        this.props.clearCasinoGames();
    }

    showSearchBar = (e) => {
        let { activeCategory } = this.props;
        this.setState({ isSearchOpen: true });
        this.props.setSearchStarted(true);

        if (activeCategory !== 'all') {
            this.props.setCasinoActiveCategory('all');
        }
    };

    hideSearchBar = (e) => {
        this.setState({
            isSearchOpen: false,
            searchVal: '',
        });

        this.props.setSearchStarted(false);
    };

    changeCategory = (category) => {
        this.props.setCasinoActiveCategory(category);
    };

    handleSearch = (e) => {
        let value = e.target.value;
        const requestDelay = 300;
        this.setState({ searchVal: value });

        clearTimeout(timer);

        timer = setTimeout(() => {
            this.props.searchCasino(value);
        }, requestDelay);
    };

    render() {
        let { isSearchOpen, searchVal } = this.state;
        let { activeCategory, casinoCategories } = this.props;

        let categories = map(casinoCategories, (category) => {
            let activeClass = activeCategory.toLowerCase() === category.value.toLowerCase() ? 'casino__category_active' : '';

            return (
                <div className={`casino__category ${activeClass}`} onClick={(e) => this.changeCategory(category.value)} key={category.value}>
                    <span>{category.value}</span>
                </div>
            );
        });

        return (
            <div>
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
    activeCategory: PropTypes.string,
    getCasinoGames: PropTypes.func,
    clearCasinoGames: PropTypes.func,
    setCasinoActiveCategory: PropTypes.func,
    setSearchStarted: PropTypes.func,
    searchCasino: PropTypes.func,
    getUser: PropTypes.func,
    casinoCategories: PropTypes.array,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        activeCategory: state.casino.activeCategory,
        casinoCategories: state.casino.casinoCategories,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getCasinoGames: () => dispatch(getCasinoGames()),
        clearCasinoGames: () => dispatch(clearCasinoGames()),
        setCasinoActiveCategory: (category) => dispatch(setCasinoActiveCategory(category)),
        setSearchStarted: (value) => dispatch(setSearchStarted(value)),
        searchCasino: (value) => dispatch(searchCasino(value)),
        getUser: () => dispatch(getUser()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
