import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { Translate } from '../../localization';
import { clearVirtualSports, getVirtualSports, searchVirtualSports, setVirtualSearchStarted, setVirtualSportsCategory } from '../../store/actions/casino.actions';
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
        this.props.getVirtualSports();
        if (this.props.userData !== null) {
            this.props.getUser();
        }
    }

    componentWillUnmount() {
        this.props.clearVirtualSports();
    }

    showSearchBar = (e) => {
        let { setVirtualSportsCategory } = this.props;
        this.setState({ isSearchOpen: true });
        this.props.setVirtualSearchStarted(true);

        if (setVirtualSportsCategory !== 'all') {
            this.props.setVirtualSportsCategory('all');
        }
    };

    hideSearchBar = (e) => {
        this.setState({
            isSearchOpen: false,
            searchVal: '',
        });

        this.props.setVirtualSearchStarted(false);
    };

    changeCategory = (category) => {
        this.props.setVirtualSportsCategory(category);
    };

    handleSearch = (e) => {
        let value = e.target.value;
        const requestDelay = 300;
        this.setState({ searchVal: value });

        clearTimeout(timer);

        timer = setTimeout(() => {
            this.props.searchVirtualSports(value);
        }, requestDelay);
    };

    render() {
        let { isSearchOpen, searchVal } = this.state;
        let { virtualSportsActiveCategory, virtualSportsCategories, userData } = this.props;
        if (userData && userData.role === 'agent') window.location.href = '/';


        let categories = map(virtualSportsCategories, (category) => {
            let activeClass = virtualSportsActiveCategory.toLowerCase() === category.value.toLowerCase() ? 'casino__category_active' : '';

            return (
                <div className={`casino__category ${activeClass}`} onClick={(e) => this.changeCategory(category.value)} key={category.value}>
                    <span>{category.name}</span>
                </div>
            );
        });


        // return (<></>);
        return (
            <div>
                {isSearchOpen ? (
                    <div className="casino__header mb-3 disable-select search__background">
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
                                <i className="icon-search dark__icon"></i>
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
    virtualSportsActiveCategory: PropTypes.string,
    setVirtualCasinoGames: PropTypes.func,
    clearVirtualSports: PropTypes.func,
    setVirtualSportsCategory: PropTypes.func,
    setVirtualSearchStarted: PropTypes.func,
    searchVirtualSports: PropTypes.func,
    getUser: PropTypes.func,
    virtualSportsCategories: PropTypes.array,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        virtualSportsActiveCategory: state.casino.virtualSportsActiveCategory,
        virtualSportsCategories: state.casino.virtualSportsCategories,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getVirtualSports: () => dispatch(getVirtualSports()),
        clearVirtualSports: () => dispatch(clearVirtualSports()),
        setVirtualSportsCategory: (category) => dispatch(setVirtualSportsCategory(category)),
        setVirtualSearchStarted: (value) => dispatch(setVirtualSearchStarted(value)),
        searchVirtualSports: (value) => dispatch(searchVirtualSports(value)),
        getUser: () => dispatch(getUser()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
