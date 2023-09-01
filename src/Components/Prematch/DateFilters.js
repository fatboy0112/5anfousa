import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { format } from 'date-fns';
import { Translate } from '../../localization';
import { setDateFilter, getPrematchLocations } from '../../store/actions/prematchActions';

function DateFilters(props) {
    const handleClick = (e, value) => {
        e.preventDefault();
        props.setDateFilter(value);
        // props.getPrematchLocations(sportId);
    };

    let { dateFilter, selectedSport } = props;
    let dateList = [];

    const [showSearch, setShowSearch] = useState(false);

    const handleSearchToggle = () => {
        setShowSearch(!showSearch);
    }
    
    const handleChange = (e) => {
        e.preventDefault();

       props.handleSearch(e.target.value);
    }

    const hideSearchBar = () => {
        setShowSearch(false);
        props.handleSearch('');
        
    };

    useEffect(() => hideSearchBar(),[selectedSport]);

    for (var i = 0; i < 8; i++) {
        let date = new Date();
        let day = date.setDate(date.getDate() + i);
        let dayFormat = format(day, 'yyyy-MM-dd');        
        let dayFormatToShow = format(day, 'dd/MM');
        if (i>=1){
            let date = new Date();
             day = date.setDate(date.getDate() +i-1);
             dayFormat = format(day, 'yyyy-MM-dd');
             dayFormatToShow = format(day, 'dd/MM');
        }

        dateList.push(
            <div key={i} className={`date-filter__item pre-match-wrapper ${dateFilter === dayFormat && 'date-filter__item_active'}`} onClick={(e) => handleClick(e, dayFormat)}>
                <span>{i === 0 ? Translate.all : i === 1 ? Translate.today : i === 2 ? Translate.tomorrow : dayFormatToShow}</span>
            </div>,
        );
    }
    return (
        <>
            <div className="date-filter__list">
                {showSearch ? (
                    <div className="sports__content sports__content_sm">
                    <div className="sports__search-bar">
                        <input
                            type="text"
                            className="ml-2 form-control sports__search-input"
                            autoFocus
                            placeholder={Translate.searchHere}
                            onChange={handleChange}
                        />
                        <i className="icon-search" />
                        <div className="sports__close-search">
                            <i className="material-icons text-body" onClick={hideSearchBar}>
                                close
                            </i>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="livesearch sear-btn btn1">
                        <div className="live-icn" onClick={handleSearchToggle}>
                            <i className="icon-search live-search-icon d-inline-block"></i>
                        </div>
                    </div>
                    {dateList}
                </>
            )}
            
        </div>
        <div className="location__divider"></div>
        </>
    );
}
DateFilters.propTypes = {
    dateFilter: PropTypes.string,
    setDateFilter: PropTypes.func,
    getPrematchLocations: PropTypes.func,
    selectedSport: PropTypes.number,
};

const mapStateToProps = (state) => {
    return {
        dateFilter: state.prematch.dateFilter,
        selectedSport: state.prematch.selectedSport,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setDateFilter: (value) => dispatch(setDateFilter(value)),
        getPrematchLocations: (sportId) => dispatch(getPrematchLocations(sportId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DateFilters);
