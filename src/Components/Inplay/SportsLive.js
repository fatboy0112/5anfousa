import React, { Component } from 'react';
import { Translate } from '../../localization';
import map from 'lodash.map';
import Util from '../../helper/Util';
import find from 'lodash.find';

class SportsLive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSearch : false,
        };
    }

    componentDidUpdate(prevProps) {
        let {sports, selectedSport, selectSport} = this.props;

        if(prevProps.sports !== sports){
            let selectedSportCount = find(sports, (sport) => sport.Id === selectedSport)?.Count;
             if(selectedSportCount === 0 && sports[0].Count > 0){
                 selectSport(sports[0].Id);
             }
         }
    }

    handleSearchToggle = () => {
        this.setState({ showSearch: !this.state.showSearch })
    }

    handleChange = (e) => {
        e.preventDefault();
        this.props.handleSearch(e.target.value);
    }
    
    selectSport = (sportId) => {
        this.props.selectSport(sportId);
        this.props.resetSelectedLocations(true);
        this.props.resetSelectMainMarket(null);
    }
    
    grtTranslatedName = (name) => {
        switch(name) {
            case 'Football':
            return Translate.football;
            case 'Basketball':
            return Translate.basketball;
            case 'Ice Hockey':
            return Translate.iceHockey;
            case 'Tennis':
            return Translate.tennis;
            case 'Volleyball':
            return Translate.volleyball;
            case 'Boxing':
            return Translate.boxing;
            case 'American Football':
            return Translate.americanFootball;
            case 'Baseball':
            return Translate.baseball;
            case 'Hockey':
            return Translate.hockey;
            case 'Badminton':
            return Translate.badminton;
            case   'Cricket':
            return Translate.cricket;
            case 'Futsal':
            return Translate.futsal;
            case 'Golf':
            return Translate.golf;
            case 'Handball':
            return Translate.handball;
            case 'Rugby Leagues':
            return Translate.rugbyLeagues;
            case 'Table Tennis':
            return Translate.tableTennis

        }
    }

    render() {
        let { searchVal, sports, selectedSport, isDisable } = this.props;
        let { showSearch } = this.state;
        const sportList = map(sports, (item, i) => {
            let sportId = item.Id;
            let sportName = this.grtTranslatedName(item.Name);
            let count = item.Count;
            
            let icon = item.Name
            if(icon ==='American Football'){
                icon ='AmericanFootball'
            } else if( icon === 'Table Tennis') {
                icon = 'TableTennis'
            } else if(icon === 'Rugby Leagues') {
                icon = 'AmericanFootball'
            }
            let disabledClass = count === 0 ? 'sports__item_disabled' : '';
            let activeClass =  selectedSport === sportId && count !== 0 ? 'sports__box_active' : '';
            let type_sport = selectedSport == sportId && count !== 0 

            //let activeClass = '';
            return (
                <div className={`sports__item ${disabledClass}`} onClick={ !isDisable ? (e) => this.selectSport(sportId) : null } key={sportId}>
                    <div className={`sports__box ${activeClass}`}>
                        <div className="sports__counter"> {count} </div>
                        <img className ={`${type_sport ? 'd-none ':''} sports_img`}  alt="stream-icon" src={`/images/sports/${icon}-desktop-white.svg`}></img>
                          <img className ={`${!type_sport ? 'd-none ':''} sports_img`}  alt="stream-icon" src={`/images/sports/${icon}-desktop.svg`}></img>
                        <div className="mt-1 sports__name">{sportName}</div>
                    </div>
                </div>
            );
        });
        return (
            <div className="main-container">
                <div className="sports__content live-match">
                    {sportList}
                </div>
                <div className="d-flex sports disable-select">
                    {showSearch ? (
                        <div className="sports__content sports__content_sm">
                            <div className="sports__search-bar">
                                <input
                                    type="text"
                                    className="ml-2 form-control sports__search-input"
                                    autoFocus
                                    placeholder={Translate.searchHere}
                                    value={searchVal}
                                    onChange={this.handleChange}
                                />
                                <i className="icon-search" />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default React.memo(SportsLive);
