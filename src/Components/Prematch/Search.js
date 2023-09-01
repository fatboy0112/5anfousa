import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Events from './Events';
import SearchBar from '../Shared/SearchBar';
import { search, clearSearch, setSearchStarted, clearLeagueEvents, searchEvents } from '../../store/actions/prematchActions';

class Search extends Component {
    componentDidMount() {
        this.props.setSearchStarted(true);
        this.props.clearSearch();
        this.props.clearLeagueEvents();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            this.props.setSearchStarted(true);
            this.props.clearSearch();
            this.props.clearLeagueEvents();
        }
    }

    componentWillUnmount() {
        this.props.setSearchStarted(false);
        this.props.clearSearch();
        this.props.clearLeagueEvents();
    }

    render() {
        let { search, language } = this.props;

        return (
            <div className="main-container">
                <SearchBar search={search} language={language} parentPath="/sports" />
                <Events />
            </div>
        );
    }
}

Search.propTypes = {
    clearSearch: PropTypes.func,
    setSearchStarted: PropTypes.func,
    search: PropTypes.func,
    clearLeagueEvents: PropTypes.func,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearSearch: () => dispatch(clearSearch()),
        setSearchStarted: (value) => dispatch(setSearchStarted(value)),
        clearLeagueEvents: () => dispatch(clearLeagueEvents()),
        search: (value) => dispatch(searchEvents(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
