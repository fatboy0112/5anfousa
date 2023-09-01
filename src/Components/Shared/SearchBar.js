import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Translate } from '../../localization';
import { Link } from 'react-router-dom';

let timer = 0;

class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
        };
    }

    handleChanged = (e) => {
        let value = e.target.value;
        const requestDelay = 300;
        this.setState({ searchVal: value });

        clearTimeout(timer);

        timer = setTimeout(() => {
            this.props.search(value);
        }, requestDelay);
    };

    componentWillUnmount() {
        this.setState({ searchVal: '' });
    }

    render() {
        let { searchVal } = this.state;
        let { parentPath } = this.props;

        return (
            <div className="sports py-2 pbb disable-select">
                <div className="sports__content sports__content_sm">
                    <div className="sports__search-bar">
                        <input
                            type="text"
                            className="ml-2 form-control sports__search-input"
                            autoFocus
                            placeholder={Translate.searchHere}
                            value={searchVal}
                            onChange={this.handleChanged}
                        />
                        <i className="icon-search" />
                        <Link className="sports__close-search" to={parentPath}>
                            <i className="material-icons">close</i>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

SearchBar.propTypes = {
    search: PropTypes.func,
    language: PropTypes.string,
    parentPath: PropTypes.string,
};

export default SearchBar;
