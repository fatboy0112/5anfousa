import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Loading from '../Common/Loading';
import Markets from './MarketsPrematch';
import ExtraMarketSelector from './ExtraMarketSelector';
import { getExtraMarkets, clearExtraMarkets, selectExtraMarket, setStatistics, clearStatistics } from '../../store/actions/lsports.global.actions';

let extraMarkets = {};
class ExtraOddsModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            marketsUpdated: {},
        };
    }

    componentDidMount() {
        let { extraMarketEvent } = this.props;
        
        let sportId = extraMarketEvent.sport_id;
        Util.getExtraMarketNamePrematch(sportId).extraMarketNames.forEach( e => {
            extraMarkets[e] = {};
        });
        extraMarkets = Util.getExtraMarketsPrematch(extraMarkets, extraMarketEvent, sportId);
        this.setState({marketsUpdated: extraMarkets});
        // this.props.getExtraMarkets(fixtureId);

        // if (extraMarketEvent.has_live_statistics || extraMarketEvent.has_prematch_statistics) {
        //     let statsTemplateType = extraMarketEvent.has_live_statistics ? 'live' : extraMarketEvent.has_prematch_statistics ? 'prematch' : '';
        //     let eventId = extraMarketEvent.fixture_id;
        //     this.props.setStatistics(eventId, 'forPopup', statsTemplateType);
        // }
    }

    componentDidUpdate(prevProps) {
        const { extraMarketEvent } = this.props;
        if(prevProps.extraMarketEvent !== extraMarketEvent) {
            let sportId = extraMarketEvent.sport_id;
            Util.getExtraMarketNamePrematch(sportId).extraMarketNames.forEach( e => {
                extraMarkets[e] = {};
            });
            extraMarkets = Util.getExtraMarketsPrematch(extraMarkets, extraMarketEvent, sportId);
            this.setState({marketsUpdated: extraMarkets});
        }
    }

    componentWillUnmount() {
        this.props.clearExtraMarkets();
        this.props.clearStatistics();
    }

    openStatistics = () => {
        let { extraMarketEvent, statsData } = this.props;
        if (extraMarketEvent.has_live_statistics || statsData?.[+extraMarketEvent.fixture_id]) {
            let eventId = extraMarketEvent.fixture_id;
            this.props.setStatistics(eventId, 'forPopup', 'prematch');
        }
    };

    closeStatistics = () => {
        this.props.clearStatistics();
    };

    render() {
        let {
            closeModal,
            selectExtraMarket,
            extraSelectedMarket,
            extraMarketsLoading,
            extraMarketEvent,
            language,
        } = this.props;
        let lang = `name_${ language?.toLowerCase() }`;
        let type =
            extraMarketEvent?.fixture_status === lSportsConfig.statuses.inplay
                ? 'live'
                : extraMarketEvent?.fixture_status === lSportsConfig.statuses.prematch
                ? 'sports'
                : 'last-minute';
        let leagueName = extraMarketEvent.league[lang] ? extraMarketEvent.league[lang] : extraMarketEvent.league.name_en;
        let results =
            extraMarketEvent.livescore && extraMarketEvent.livescore.Scoreboard && extraMarketEvent.livescore.Scoreboard.Results
                ? extraMarketEvent.livescore.Scoreboard.Results
                : null;
        let currentDate = Util.convertToLocalTimezone(extraMarketEvent.start_date);
        let timeString = currentDate.timeString;

        let matchInfo = type === 'live' ? results ? results[0].Value + ' : ' + results[1].Value : '' : 
        <time className="d-block lh-18">{timeString}</time>;

        let drawEventHeader = (
            <div>
                <p className="league-name">{leagueName}</p>
                <div className="extra-odd__title">                
                    <div className="team-name">
                        <span className="extra-odd__participant name-one ellipsis">{extraMarketEvent.participant_one_full && (extraMarketEvent.participant_one_full[lang] || extraMarketEvent.participant_one_full.name_en)}</span>
                        <span className="extra-odd__score score"><span className="score-num">0:0</span>{matchInfo}</span>
                        <span className="extra-odd__participant ellipsis name-two">{extraMarketEvent.participant_two_full && (extraMarketEvent.participant_two_full[lang] || extraMarketEvent.participant_two_full.name_en)}</span>
                    </div>
                </div>
            </div>
        );

        let extraMarketEventsList = this.state.marketsUpdated[extraSelectedMarket];
        // check if all bets are settled
        let areBetsAllSettled = Util.checkSettledBetsPrematch(extraMarketEventsList);

        let drawMarkets =
            extraMarketEventsList && Object.keys(extraMarketEventsList).length > 0 ? (
                areBetsAllSettled ? (
                    <div className="no-data fs-15 pt-3 pb-3">All the Odds are settled for this event.</div>
                ) : (
                    <Markets markets={extraMarketEventsList} fixture={extraMarketEvent} type={type} leagueName={leagueName} />
                )
            ) : (
                <div className="no-data fs-15 pt-3 pb-3">No data</div>
            );

        return extraMarketsLoading ? (
            <Loading />
        ) : (
            <Dialog onClose={closeModal} aria-labelledby="extra-odds-dialog-title" open={true} scroll="paper" className="extra-odds__modal">
                <DialogTitle id="extra-odds-dialog-title" className="p-0 dialog-tab pre-match-wrapper" disableTypography>
                    <div className="pr-6 line-height-5">
                        <ExtraMarketSelector
                            selectExtraMarket={selectExtraMarket}
                            extraSelectedMarket={extraSelectedMarket}
                            extraMarketNames={Util.getExtraMarketName(extraMarketEvent.sport_id).extraMarketNames}
                        />
                    </div>

                    {drawEventHeader}
                    {/* <IconButton className={`data-icon ${disbaledStatClass}`}>
                        {statisticsEventId > 0 && statisticsType === 'forPopup' ? (
                      //<img className={`statistics-icon ${disbaledStatClass}`} src="./images/statistics-icon.png" onClick={(e) => this.closeStatistics()}></img>
                            <i className={`icon-statistics text-green ${disbaledStatClass}`} onClick={(e) => this.closeStatistics()} />
                    ) : (
                        <i className={`icon-statistics ${disbaledStatClass}`} onClick={(e) => this.openStatistics()} />
                       // <img className={`statistics-icon ${disbaledStatClass}`} src="./images/statistics-icon.png" onClick={(e) => this.openStatistics()}></img>
                    )}
                    </IconButton> */}
                    

                    <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                        <i className=" material-icons close-icon fs-22"> close </i>
                        {/* <img className="cancel-icon" src="./images/cancel-icon.png"></img>  */}
                    </IconButton>
                </DialogTitle>

                <DialogContent className="modal-min-height extra-odd__bets p-0">
                    {/* {statisticsEventId > 0 && statisticsType === 'forPopup' && <Statistics />} */}
                    {drawMarkets}
                </DialogContent>
            </Dialog>
        );
    }
}

ExtraOddsModal.propTypes = {
    closeModal: PropTypes.func,
    // event: PropTypes.object,
    extraMarkets: PropTypes.object,
    extraSelectedMarket: PropTypes.string,
    extraMarketsLoading: PropTypes.bool,
    selectExtraMarket: PropTypes.func,
    getExtraMarkets: PropTypes.func,
    clearExtraMarkets: PropTypes.func,
    extraMarketEvent: PropTypes.object,
    setStatistics: PropTypes.func,
    statisticsEventId: PropTypes.number,
    statisticsType: PropTypes.string,
    clearStatistics: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        extraMarkets: state.lsportsGlobal.extraMarkets,
        extraMarketsLoading: state.lsportsGlobal.extraMarketsLoading,
        extraSelectedMarket: state.lsportsGlobal.extraSelectedMarket,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,
        statisticsEventId: state.lsportsGlobal.statisticsEventId,
        statisticsType: state.lsportsGlobal.statisticsType,
        statsData: state.general.statsData,
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getExtraMarkets: (eventId) => dispatch(getExtraMarkets(eventId)),
        selectExtraMarket: (marketName) => dispatch(selectExtraMarket(marketName)),
        clearExtraMarkets: () => dispatch(clearExtraMarkets()),
        setStatistics: (eventId, statsType, statsTemplateType) => dispatch(setStatistics(eventId, statsType, statsTemplateType)),
        clearStatistics: () => dispatch(clearStatistics()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExtraOddsModal);
