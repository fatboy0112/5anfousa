import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Sports from './Sports';
import Events from './Events';
import Locations from './Locations';
import { clearLocations, getResultsLocationsCountMobile} from '../../store/actions/resultsActions';
import { resultTotalSegments } from '../../config';
import Betslip from '../Betslip';
import { Translate } from '../../localization';
import { search, clearSearch, setSearchStarted, clearLocationEvents } from '../../store/actions/resultsActions';
// import TopLinks from '../TopLinks';

let timer = 0;
class Results extends Component {
    componentDidMount() {
        for(let i=0; i< resultTotalSegments; i++) {
            this.props.getResultsLocationsCountMobile(true, null, i);
        }

    }
    componentWillUnmount() {
        this.props.clearLocations();
    }
    handleChange = (e) => {
        e.preventDefault();
        let value = e.target.value;
        const requestDelay = 300;

        clearTimeout(timer);

        timer = setTimeout(() => {
            this.props.search(value);
        }, requestDelay);
    };

    searchToRender =
        <div className="sports__content sports__content_sm">
            <div>
                <input
                    type="text"
                    className="sports__search-input text-light"
                    placeholder={Translate.searchHere}
                    onChange={this.handleChange}       
                />
            </div>
        </div>;

    render() {

        return (
            <React.Fragment>
                <Sports />               
                <div className="middle-part sport-middle d-flex results-page">
                    <div id='side-navbar' className="side-navbar fade1">
                        <nav className="side-multilevel">
                            <div id='item-search' style={{ height: '45px' }}/>
                            {document.getElementById('item-search') && ReactDOM.createPortal(
                                this.searchToRender,
                             document.getElementById('item-search')
                            )}
                            <Locations />
                            <div id='location-filter' className='' />
                        </nav>
                    </div>
                    <Events />
                    <Betslip />
                </div>               
            </React.Fragment>
        );
    }
}

Results.propTypes = {
    isLocationsActive: PropTypes.bool,
    isResultsActive: PropTypes.bool,
    clearLocations: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        isLocationsActive: state.results.isLocationsActive,
        isResultsActive: state.results.isResultsActive,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearLocations: () => dispatch(clearLocations()),
        getResultsLocationsCountMobile: (val, nextToken, i ) => dispatch(getResultsLocationsCountMobile(val, nextToken, i)),
       clearSearch: () => dispatch(clearSearch()),
        setSearchStarted: (value) => dispatch(setSearchStarted(value)),
        clearLocationEvents: () => dispatch(clearLocationEvents()),
        search: (value) => dispatch(search(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Results);
