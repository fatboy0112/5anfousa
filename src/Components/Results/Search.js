import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Events from './Events';
import SearchBar from '../Shared/SearchBar';
import { search, clearSearch, setSearchStarted, clearLocationEvents } from '../../store/actions/resultsActions';

class Search extends Component {
    componentDidMount() {
        this.props.setSearchStarted(true);
        this.props.clearSearch();
        this.props.clearLocationEvents();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // this.props.setSearchStarted(true);
            // this.props.clearSearch();
            // this.props.clearLocationEvents();
        }
    }

    componentWillUnmount() {
        this.props.setSearchStarted(false);
        this.props.clearSearch();
        this.props.clearLocationEvents();
    }

    render() {
        let { search, language } = this.props;

        return (
            <div className="main-container">
                <SearchBar search={search} language={language} parentPath="/results" />
                <Events />
            </div>
        );
    }
}

Search.propTypes = {
    clearSearch: PropTypes.func,
    setSearchStarted: PropTypes.func,
    search: PropTypes.func,
    clearLocationEvents: PropTypes.func,
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
        clearLocationEvents: () => dispatch(clearLocationEvents()),
        search: (value) => dispatch(search(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
