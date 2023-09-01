import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import Util from '../../../helper/Util';
// import { Translate } from '../../../localization';
import { getDeviceLocation, setLanguage } from '../../store/actions/general.actions';
import { setLocationsActive, setPrematchActive } from '../../store/actions/prematchActions';
import Filter from './Filter';
// import Banner from './Banner';
import InnerLinks from './InnerLinks';
import { staticPrematchSports } from '../../config/sports';
import { setOddType } from '../../store/actions/user.actions';

//const options = ['en', 'fr', 'tr', 'de', 'ru'];

class TopLink extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps) {
    }

    componentWillUnmount() {
    }

    render() {
        const { selectedSport, language, setOddType, sports } = this.props;
        return (
            <div className="top-links d-flex justify-content-between">
                <Filter
                    sports={sports || staticPrematchSports()}
                    // sportsObj={sportCountObj}
                    selectedSport={selectedSport}
                    searchPath=""
                    type="tomorrow"
                    language={language}
                    // isDisable={mainEvents.length === 0}
                    sort
                />
                {/* <Banner /> */}
                <InnerLinks  setOddType={setOddType}/>
            </div>
        );
    }
}

TopLink.propTypes = {
    userData: PropTypes.object,
    setLanguage: PropTypes.func,
    language: PropTypes.string,
    headerClassname: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        language: state.general.language,
        selectedSport: state.today.selectedSport,
        mainEvents: state.today.mainEvents,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setLanguage: (value) => dispatch(setLanguage(value)),
        setLocationsActive: (value) => dispatch(setLocationsActive(value)),
        setPrematchActive: (value) => dispatch(setPrematchActive(value)),
        getDeviceLocation: () => dispatch(getDeviceLocation()),
        setOddType: (type) => dispatch(setOddType(type))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TopLink);
