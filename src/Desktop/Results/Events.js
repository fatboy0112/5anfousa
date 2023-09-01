import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import groupBy from 'lodash.groupby';
import forEach from 'lodash.foreach';
import InfiniteScroll from 'react-infinite-scroll-component';
import Matches from './Matches';
import Loading from '../../Components/Common/NewLoading';
// import LoadingIcon from '../Common/LoadingIcon';
import { getResultsLocationEvents, search, setResultsResetPage, clearLocationEvents } from '../../store/actions/resultsActions';
import NewLoading from '../../Components/Common/NewLoading';
import { Translate } from '../../localization';

class Events extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            // this.props.setResultsResetPage();

            if (!this.props.searchStarted) {
                // this.props.getResultsLocationEvents(this.props.selectedLocation);
            } else {
                this.props.search(this.props.searchValue);
            }
        }
    }

    componentWillUnmount() {
        this.props.clearLocationEvents();
    }

    // fetchMoreData = () => {
    //     if (this.props.hasNextPage) {
    //         if (!this.props.searchStarted) {
    //             // if is in main page
    //             this.props.getResultsLocationEvents(this.props.selectedLocation);
    //         } else {
    //             // if is in search page
    //             this.props.search(this.props.searchValue);
    //         }
    //     }
    // };

    render() {
        let { searchStarted, mainEvents, noSearchResults, noEvents, hasNextPage, locations, isLocationLoading } = this.props;
        let groupedEvents =
            mainEvents &&
            mainEvents[0] &&
            mainEvents[0].sport_id &&
            groupBy(mainEvents, function (event) {
                return `_${event.sport_id}`;
            });

        let matches = [];
        forEach(groupedEvents, (group, sportId) => {
            if (group.length > 0) {
                let groupMatches = <Matches events={group} />;

                matches.push(
                    <table className="table mb-0 result-table-wrap">
                        <thead>
                            <tr>
                                <th scope="col">&nbsp;</th>
                                <th scope="col">&nbsp;</th>
                                <th scope="col">&nbsp;</th>
                               
                            </tr>
                        </thead>
                        {groupMatches}
                    </table>,);
            }
        });

        let drawContent =
            matches.length > 0 ? (
                <div>
                    {matches}   
                    <div className="pb-4" />
                </div>
            ) : noSearchResults || noEvents ? (
                <div className="no-data fs-15 pt-3 pb-3">{ Translate.nothingFound}</div>
            ) : (
                !searchStarted && <Loading />
            );

        return <div id="scrollableDiv" className={ 'odds-panel' }>
            { locations.length > 0 ? <div className="table-responsive">{drawContent}</div> : !isLocationLoading ? <div className="no-data fs-15 pt-3 pb-3" >{ Translate.nothingFound }</div> :<NewLoading />}
        </div>;
    }
}

Events.propTypes = {
    selectedLocation: PropTypes.number,
    searchValue: PropTypes.string,
    mainEvents: PropTypes.array,
    searchStarted: PropTypes.bool,
    getResultsLocationEvents: PropTypes.func,
    noSearchResults: PropTypes.bool,
    noEvents: PropTypes.bool,
    language: PropTypes.string,
    hasNextPage: PropTypes.bool,
    search: PropTypes.func,
    setResultsResetPage: PropTypes.func,
    clearLocationEvents: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        selectedLocation: state.results.selectedLocation,
        searchValue: state.results.searchValue,
        mainEvents: state.results.mainEvents,
        searchStarted: state.results.searchStarted,
        noSearchResults: state.results.noSearchResults,
        noEvents: state.results.noEvents,
        language: state.general.language,
        hasNextPage: state.results.hasNextPage,
        locations: state.results.locations,
        isLocationLoading: state.results.isLocationLoading,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getResultsLocationEvents: (locationId) => dispatch(getResultsLocationEvents(locationId)),
        search: (value) => dispatch(search(value)),
        setResultsResetPage: () => dispatch(setResultsResetPage()),
        clearLocationEvents: () => dispatch(clearLocationEvents()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
