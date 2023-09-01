import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import map from 'lodash.map';

class SportsLive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSearch : false,
        };
    }

    // componentDidUpdate(prevProps) {
    //     let {sports, selectedSport, selectSport} = this.props;
    //     if(prevProps.sports !== sports){
    //         let selectedSportCount = find(sports, (sport) => sport.Id === selectedSport)?.Count;
    //          if(selectedSportCount === 0 && sports[0].Count > 0){
    //              selectSport(sports[0].Id);
    //          }
    //      }
    // }

    // handleSearchToggle = () => {
    //     this.setState({ showSearch: !this.state.showSearch });
    // }

    // handleChange = (e) => {
    //     e.preventDefault();
    //     this.props.handleSearch(e.target.value);
    // }
    
    // selectSport = (sportId) => {
    //     this.props.selectSport(sportId);
    //     this.props.resetSelectedLocations(true);
    //     this.props.resetSelectMainMarket(null);
    // }
    
    // grtTranslatedName = (name) => {
    //     switch(name) {
    //         case 'Football':
    //         return Translate.football;
    //         case 'Basketball':
    //         return Translate.basketball;
    //         case 'Ice Hockey':
    //         return Translate.iceHockey;
    //         case 'Tennis':
    //         return Translate.tennis;
    //         case 'Volleyball':
    //         return Translate.volleyball;
    //         case 'Boxing':
    //         return Translate.boxing;
    //     }
    // }

    render() {
        let { sports } = this.props;
        // const sportList = [];
        const sportList = map(sports, (item, i) => {
            let sportId = item.Id;
            // let sportName = this.grtTranslatedName(item.Name);
            let count = item.Count;
			const countSpan = <div className='sports__counter'> { count || 0} </div>;
			return { id: `sport-filter-${ sportId }`, child: countSpan };
		});
        return (
            <>
                {sportList.map(sport => {
                const { id, child } = sport;
                if(!sport || !document.getElementById(id)) return null;
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

export default React.memo(SportsLive);
