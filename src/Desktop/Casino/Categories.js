import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { Translate } from '../../localization';
import { getCasinoGames, setCasinoActiveCategory, setSearchStarted, searchCasino, clearCasinoGames } from '../../store/actions/casino.actions';
import { getUser } from '../../store/actions/user.actions';

let timer = 0;

const options = {
    items: 4,
    navText: ['<div className=\'nav-btn prev-slide\'></div>','<div className=\'nav-btn next-slide\'></div>'],
    nav: true,
    dots: false
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

        let categories = map(casinoCategories, (category, i) => {
            let activeClass = activeCategory === category.value ? 'active' : '';

            return (
                <a href className={ `w-100 ${category.value === 'All' ? 'all-' : ''}${activeClass}`} onClick={(e) => this.changeCategory(category.value)} key={category.value}>
                    {category.value === 'All' && <i className="icon-all pr-2"  />}
                    {category.value}
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
                                <img src="/images/search-icon.png" alt="search-icon" style={{ marginRight: '30px', width: '25px', cursor: 'pointer'}} />
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
                                </div>
                                )}
                            </div>
                        </div>
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
