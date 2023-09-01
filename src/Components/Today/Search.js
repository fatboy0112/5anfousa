import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Events from './Events';
import SearchBar from '../Shared/SearchBar';
import { search, setSearchStarted, clearLocations, clearSportEvents, clearSearch } from '../../store/actions/todayActions';

class Search extends Component {
    componentDidMount() {
        this.props.clearSearch('');
        this.props.clearSportEvents();
        this.props.clearLocations();
        this.props.setSearchStarted(true);
    }

    componentWillUnmount() {
        this.props.setSearchStarted(false);
        this.props.clearSearch();
        this.props.clearSportEvents();
        this.props.clearLocations();
    }

    render() {
        let { search, language } = this.props;

        return (
            <div className="main-container">
                <SearchBar search={search} language={language} parentPath="/today" />
                <Events />
            </div>
        );
    }
}

Search.propTypes = {
    search: PropTypes.func,
    setSearchStarted: PropTypes.func,
    clearLocations: PropTypes.func,
    clearSportEvents: PropTypes.func,
    language: PropTypes.string,
    clearSearch: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        search: (value) => dispatch(search(value)),
        setSearchStarted: (value) => dispatch(setSearchStarted(value)),
        clearLocations: () => dispatch(clearLocations()),
        clearSportEvents: () => dispatch(clearSportEvents()),
        clearSearch: () => dispatch(clearSearch()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
