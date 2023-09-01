import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lSportsConfig } from '../../config';

class Statistics extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isStatsAvailable: true,
        };
      }
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
        window.addEventListener('statscore.livematchpro.tracker1.ready', () => {
            this.setState({ isStatsAvailable: true });
        });
        window.addEventListener('statscore.livematchpro.tracker1.error', (err) => {
            this.setState({ isStatsAvailable: false });
        });
    }

    render() {
        const { isStatsAvailable } = this.state;
        let width = isStatsAvailable ? 'w-50' : 'd-none';
        return <div id="tracker" className={`statistics__wrap ${width}`}></div>;
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
