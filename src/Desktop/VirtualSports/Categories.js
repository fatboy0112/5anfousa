import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { Translate } from '../../localization';
import {
    setVirtualSportsCategory,
    setVirtualSearchStarted,
    searchVirtualSports,
    clearVirtualSports,
    getVirtualSports,
} from '../../store/actions/casino.actions';
import { getUser } from '../../store/actions/user.actions';
import Games from "./Games";

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
        this.props.getVirtualSports();
        if (this.props.userData !== null) {
            this.props.getUser();
        }
    }

    componentWillUnmount() {
        this.props.clearVirtualSports();
    }

    showSearchBar = (e) => {
        let { virtualSportsActiveCategory } = this.props;
        this.setState({ isSearchOpen: true });
        this.props.setVirtualSearchStarted(true);

        if (virtualSportsActiveCategory !== 'All') {
            this.props.setVirtualSportsCategory('All');
        }
    };

    hideSearchBar = (e) => {
        this.setState({
            isSearchOpen: false,
            searchVal: '',
        });

        this.props.setVirtualSearchStarted(false);
        // Reset the search while closing the search bar
        this.props.searchVirtualSports('');
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
        let { virtualSportsActiveCategory, virtualSportsCategories } = this.props;
        // If user is not authorised redirect to home

        let categories = map(virtualSportsCategories, (category) => {
            let categoryVal = category.value;
            let activeClass = virtualSportsActiveCategory === categoryVal ? 'active' : '';

            return (
                <a href className={ `${category.value === 'All' ? 'all-' : ''}${activeClass}`} onClick={(e) => this.changeCategory(categoryVal)} key={categoryVal}>
                    <i className={ `${category.icon} pr-1` }  />
                    {category.name}
                </a>
            );
        });
        return null
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
