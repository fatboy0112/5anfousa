import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectHomeActiveLeague, removeHomeActiveLeague, getHomeActiveLeagueEventsMobile } from '../../store/actions/home.actions';
import LoadingMain from './../../Components/Common/LoadingMain'
import { homePageLeagues } from '../../config/sports';
import {totalSegments} from '../../config';

function LeaguesList(props) {
    const setActiveLeague = (leagueId) => {
        let { selectedLeague } = props;
        if (selectedLeague === leagueId) {
            props.removeHomeActiveLeague();
        } else {
            props.selectHomeActiveLeague(leagueId);
            for (let i =0;i<totalSegments;i++) {
               props.getHomeActiveLeagueEventsMobile(leagueId,i);
            }

        }
    };

    let { selectedLeague, loading } = props;

    let leagues_list = homePageLeagues.map((league) => {
        let leagueId = league.league_id;
        let leagueName = league.league_name_en;
        let isSelected = selectedLeague === leagueId ? ' leagues__item_selected' : '';

        return (
            <li className={'leagues__item' + isSelected} key={leagueId}>
                <div className="leagues__img-wrap" onClick={() => setActiveLeague(leagueId)}>
                    <img src={`./images/leagues/${leagueName}.png`} className="leagues__img" alt={leagueName} />
                </div>
            </li>
        );
    });

    return <ul className="leagues__list pre-match-wrapper">{ loading ? <LoadingMain customStyle={'contents'} /> : leagues_list}</ul>;
}

LeaguesList.propTypes = {
    leagues: PropTypes.array,
    selectedLeague: PropTypes.number,
};

const mapStateToProps = (state) => {
    return {
        leagues: state.home.leagues,
        selectedLeague: state.home.selectedLeague,
        loading: state.general.loading,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectHomeActiveLeague: (leagueId) => dispatch(selectHomeActiveLeague(leagueId)),
        removeHomeActiveLeague: () => dispatch(removeHomeActiveLeague()),
        getHomeActiveLeagueEventsMobile: (leagueId, i) => dispatch(getHomeActiveLeagueEventsMobile(leagueId, i))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LeaguesList);
