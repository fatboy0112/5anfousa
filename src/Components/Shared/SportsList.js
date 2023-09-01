import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import map from 'lodash.map';
import find from 'lodash.find';
import filter from 'lodash.filter';
import orderby from 'lodash.orderby';
import { Translate } from '../../localization';
import { Link } from 'react-router-dom';

function SportsList(props) {
    let { sports, selectedSport, selectSport, searchPath, type, isDisable, sportsObj } = props;
    // debugger    
    if(['tomorrow', 'today', 'prematch', 'seven_days_finished'].includes(type)) {
        
        const football = find(sports, (item) => item.sport_id === 1);
        if (football && sportsObj[1] > 0) {
            let remSportsArray = filter(sports, (item) => item.sport_id !== 1);
            remSportsArray = orderby(remSportsArray, [(sport) => sportsObj[sport.sport_id] > 0], ['desc']);
            sports = [football, ...remSportsArray];
        }
        else if(football) {
            sports = orderby(sports, [(sport) => sportsObj[sport.sport_id] > 0], ['desc']);
            let selectedSportCount;
            if(sportsObj[selectedSport]){
                selectedSportCount = sportsObj[selectedSport];
            }
            if(selectedSport !== sports[0].sport_id && selectedSportCount === 0 ) {
                selectSport(sports[0].sport_id);
            }
        }
    }

    const sportList = map(sports, (item, i) => {
        // if (props?.blockedSports?.includes(item.sport_id)) return null;
        let sportId = item.sport_id;
        let sportName = item.name;
        let disabledClass =  '';
        let activeClass = selectedSport === sportId ? 'sports__box_active' : '';
        let count;
        let type_sport = selectedSport === sportId 
        if(['tomorrow', 'today', 'prematch', 'seven_days_finished'].includes(type)) {
            count = sportsObj[sportId] > 0 ? sportsObj[sportId] : 0;
            disabledClass = count === 0 ? 'sports__item_disabled' : '';
            activeClass = count === 0 ? '' : activeClass ;
        }
        //let activeClass = selectedSport === sportId && count !== 0 ? 'sports__box_active' : '';

        return (
            <div className={`sports__item ${disabledClass}`} onClick={ !isDisable ? (e) => selectSport(sportId) : null } key={sportId} >
                <div className={`sports__box ${activeClass}`}>
                    { ['tomorrow', 'today', 'prematch', 'seven_days_finished'].includes(type) && <div className="sports__counter"> {count > 0 && count} </div> }
                    <img className = {`${type_sport ? 'd-none ':''} sports_img`}  alt="stream-icon" src={`/images/sports/${item.icon_name}-desktop-white.svg`}></img>
                    <img className = {`${!type_sport ? 'd-none ':''} sports_img`} alt="stream-icon" src={`/images/sports/${item.icon_name}-desktop.svg`}></img>
                    <div className="mt-1 sports__name">{sportName}</div>
                </div>
            </div>
        );
    });

    return (
        <div className="sports py-2 pbb disable-select">
            <div className="sports__content">

                {searchPath && (
                    <Link className="sports__item" to={searchPath}>
                        <div className="sports__box">
                            <i className="icon-search d-inline-block"></i>
                            <div className="pt-1 lh-12p">{Translate.search}</div>
                        </div>
                    </Link>
                )}
                {sportList}
            </div>
        </div>
    );
}

SportsList.propTypes = {
    sports: PropTypes.array,
    selectedSport: PropTypes.number,
    selectSport: PropTypes.func,
    language: PropTypes.string,
    searchPath: PropTypes.string,
    type: PropTypes.string,
    sort: PropTypes.bool,
};
const mapStateToProps = (state) => {
    return {
        // blockedSports: state.settings.sports,	
    };
};

export default connect(mapStateToProps) (SportsList);
