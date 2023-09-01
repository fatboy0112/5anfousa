import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lSportsConfig } from '../../config';

class Statistics extends Component {
    componentDidMount() {
        let { statisticsEventId, statisticsTemplateType, language } = this.props;

        if (statisticsTemplateType === 'live') {
            let trackerGenerator = new window.STATSCORE.LSP.Generator();
            trackerGenerator.create('#tracker', 'tracker1', statisticsEventId, lSportsConfig.account.statscore_live_id, {
                lang: language,
                timezone: '',
                useMappedId: '1',
                configuration: {
                    showHeader: false,
                },
            });
        } else if (statisticsTemplateType === 'prematch') {
            let trackerGenerator = new window.STATSCORE.LSP.Generator();
            trackerGenerator.create('#tracker', 'tracker1', statisticsEventId, lSportsConfig.account.statscore_prematch_id, {
                lang: language,
                timezone: '',
                useMappedId: '1',
                configuration: {
                    showHeader: false,
                    mainMenu: ['Standings', 'Tables', 'Comparison'],
                    mainBoxInitializationTab: 'Standings',
                },
            });
        }
    }

    render() {
        return <div id="tracker" className="statistics__wrap"></div>;
    }
}

Statistics.propTypes = {
    statisticsEventId: PropTypes.number,
    statisticsTemplateType: PropTypes.string,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        statisticsEventId: state.lsportsGlobal.statisticsEventId,
        statisticsTemplateType: state.lsportsGlobal.statisticsTemplateType,
        language: state.general.language,
    };
};

export default connect(mapStateToProps)(Statistics);
