import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { withRouter } from 'react-router-dom';
import { lSportsConfig } from '../../config/lsports.config';
import { getStatsData } from '../../store/actions/general.actions';
import { selectSportMobile, setTodaySports, clearSportEvents } from '../../store/actions/todayActions';

class Sports extends Component {
    componentDidMount() {
        // const { statsData, fromLivePage, currentSelectedSport, mainEvents } = this.props;
        // const lastUrl = localStorage.getItem('lastUrl');
        // const fromExtraMarket =   includes(lastUrl, '/extra-market/'); 
        // if (!statsData && !fromLivePage) this.props.getStatsData();
        // if (!this.props.mainEvents.length > 0 && !this.props.fromLivePage) { // DOn't reload data If main events are already present. 
        //     //this.props.getTodaySports();
        //     this.props.setTodaySports();
        //     this.props.selectSport(lSportsConfig.today.selectedSport);
        // } else {
        //     // was added for FIX: loading on sport select after top league selection
        //     // this.props.selectSport(this.props.selectedSport);
        // }
        // if (fromLivePage && (!fromExtraMarket || !mainEvents.length)){
        //     this.props.clearSportEvents();
        //     this.props.selectSport(currentSelectedSport);}
         if (!this.props.selectedSport) {
            this.props.selectSportMobile(lSportsConfig.today.selectedSport);
        } else {
            // was added for FIX: loading on sport select after top league selection
            // this.props.selectSport(this.props.selectedSport);
        }

    }

    componentDidUpdate(prevProps) {
        const {fromLivePage, currentSelectedSport, mainEvents, selectedSport } = this.props;
        const lastUrl = localStorage.getItem('lastUrl');
        const fromExtraMarket =   includes(lastUrl, '/extra-market/'); 
        if (fromLivePage && (!fromExtraMarket || !mainEvents.length)) {
            if (prevProps.currentSelectedSport !== currentSelectedSport) {
                this.props.clearSportEvents();
                this.props.selectSportMobile(selectedSport);
            }
        }
        else if (prevProps.selectedSport && prevProps.selectedSport !== selectedSport) {
            this.props.clearSportEvents();
            this.props.selectSportMobile(selectedSport);
        }

        // if (prevProps.language !== this.props.language) {
        //     this.props.getTodaySports();
        // }
    }
    componentWillUnmount(){
         this.props.clearSportEvents();
    }
    selectSport = (sportId) => {
        this.props.selectSportMobile(sportId);
    };

    render() {
        let sportList = [];
        // const sportList = map(Object.keys(sportCountObj), (sport, i) => {
        //     let sportId = sport;
        //     if (!sportId) return null;
        //     let count = sportCountObj[sport];
        //     const countSpan = <div className='sports__counter'> {count || 0} </div>;
        //     return { id: `sport-filter-${sportId}`, child: countSpan };
        // });
        return (
            <>
                {sportList.map(sport => {
                    const { id, child } = sport;
                    if (!sport || !document.getElementById(id)) return null;
                    return (
                        ReactDOM.createPortal(
                            child,
                            document.getElementById(id)
                        )
                    );
                })}
            </>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        sports: state.today.sports,
        selectedSport: state.today.selectedSport,
        language: state.general.language,
        mainEvents: state.today.mainEvents,
        sportCountObj: state.today.sportCountObj,
        statsData: state.general.statsData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        // getTodaySports: () => dispatch(getTodaySports()),
        selectSportMobile: (sportId, dontFetch) => dispatch(selectSportMobile(sportId, dontFetch)),
        setTodaySports: () => dispatch(setTodaySports()),
        getStatsData: () => dispatch(getStatsData()),
        clearSportEvents: () => dispatch(clearSportEvents())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sports));
