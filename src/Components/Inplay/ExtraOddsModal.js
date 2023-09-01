import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Markets from './Markets';
import { getExtraMarkets, clearExtraMarkets, selectExtraMarket, setStatistics, clearStatistics } from '../../store/actions/lsports.global.actions';
import ExtraMarketSelector from '../Shared/ExtraMarketSelector';
import { isEqual } from 'lodash';
import MatchDateTime from '../Shared/Match/MatchDateTime';

let extraMarkets = {};
class ExtraOddsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            marketsUpdated: null,
            liveStreamGameId: null,
            showLiveStream: false,
        };
    }

    componentDidMount() {
        let { extraMarketEvent, liveStreamAvailable } = this.props;
        let sportId = extraMarketEvent.sport_id;
        Util.getExtraMarketName(sportId).extraMarketNames.forEach( e => {
            extraMarkets[e] = {};
        });
        extraMarkets = Util.getExtraMarkets(extraMarkets, this.props.liveMatch, sportId);
            this.setState({ marketsUpdated: extraMarkets});
        if(liveStreamAvailable) {
            this.setState({showLiveStream: true});
        }
        // let fixtureId = extraMarketEvent.FixtureId;
       
        // this.props.setStatistics(fixtureId, 'forPopup', 'live');
    }

    componentDidUpdate(pp) {
        const { liveMatch, extraMarketEvent } = this.props;
        let sportId = liveMatch.sport_id;
        if (!isEqual(pp.liveMatch.Markets, liveMatch.Markets)) {
            extraMarkets = Util.getExtraMarkets(extraMarkets, liveMatch, sportId);
            this.setState({ marketsUpdated: extraMarkets});
        }

        if(pp.extraMarketEvent !== extraMarketEvent) {
            extraMarkets = Util.getExtraMarkets(extraMarkets, liveMatch, sportId);
            this.setState({ marketsUpdated: extraMarkets});
        }

    }

    componentWillUnmount() {
        extraMarkets = {}; // Reset extra market category while un-mounting
        this.props.clearExtraMarkets();
        this.props.clearStatistics();
    }

    toggleLiveStream = () => {
        this.setState({ showLiveStream: !this.state.showLiveStream});
    }

    openStatistics = () => {
        let { extraMarketEvent } = this.props;
        this.props.setStatistics(extraMarketEvent.fixture_id, 'forPopup', 'live');
        this.setState({ showLiveStream : false });
    };

    closeStatistics = () => {
        this.props.clearStatistics();
    };

    render() {
        const { closeModal, selectExtraMarket, extraSelectedMarket, liveMatch, language, statsData } = this.props;
        let lang = `name_${language.toLowerCase()}`;
        let type =
            liveMatch.fixture_status === lSportsConfig.statuses.inplay
                ? 'live'
                : liveMatch.fixture_status === lSportsConfig.statuses.prematch
                ? 'sports'
                : 'last-minute';
        let leagueName = liveMatch.league && (liveMatch.league[lang] || liveMatch.league.name_en);
        let results =
            liveMatch.Livescore && liveMatch.Livescore.Scoreboard && liveMatch.Livescore.Scoreboard.Results
                ? liveMatch.Livescore.Scoreboard.Results
                : null;
        results = results && Object.values(results);
        let currentDate = liveMatch.start_date && Util.convertToLocalTimezone(liveMatch.start_date);
        let timeString = currentDate?.timeString;
        let hasStatistics = false;
        if (statsData?.[+liveMatch.fixture_id] && ['live', 'finished'].indexOf(statsData[+liveMatch.fixture_id].status_type) > -1) {
            hasStatistics = true;
        }
        let matchInfo = type === 'live' ? results ? results[0].Value + ' : ' + results[1].Value : '' : <time className="d-block lh-18">{timeString}</time>;

        let drawEventHeader = (
            <div>
                <p className="league-name">{leagueName}</p>
                <div className="extra-odd__title">                
                    <div className="team-name">
                        <span className="extra-odd__participant name-one ellipsis">{liveMatch.participants[0][lang] || liveMatch.participants[0].name_en}</span>
                        <span className="extra-odd__score score"><span className="score-num">{matchInfo}</span><MatchDateTime fixture={liveMatch} showDate={false} /></span>
                        <span className="extra-odd__participant ellipsis name-two">{liveMatch.participants[1][lang] || liveMatch.participants[1].name_en}</span>
                    </div>
                </div>
            </div>
        );
        let currentlySelectedMarket = extraSelectedMarket ? extraSelectedMarket : 'All';
        let extraMarketEventsList = extraMarkets[currentlySelectedMarket];
        let sportId = liveMatch.sport_id;
        // check if all bets are settled
        let areBetsAllSettled = Util.checkSettledBets(extraMarketEventsList);
        let drawMarkets =
            extraMarketEventsList && Object.keys(extraMarketEventsList).length > 0 ? (
                areBetsAllSettled ? (
                    <div className="no-data fs-15 pt-3 pb-3">All the Odds are settled for this event.</div>
                 ) : 
                (
                    <Markets markets={extraMarketEventsList} fixture={liveMatch} type={type} leagueName={leagueName} currentlySelectedMarket={currentlySelectedMarket}/>
                )
            ) 
             : (
                 <div className="no-data fs-15 pt-3 pb-3">No data</div>
             );

        return  (
            <Dialog onClose={closeModal} aria-labelledby="extra-odds-dialog-title" open={true} scroll="paper" className="extra-odds__modal">
                <DialogTitle id="extra-odds-dialog-title" className="p-0 dialog-tab" disableTypography>
                    <div className="pr-extra-market-modal line-height-5">
                        <ExtraMarketSelector
                            selectExtraMarket={selectExtraMarket}
                            extraSelectedMarket={currentlySelectedMarket}
                            extraMarketNames={Util.getExtraMarketName(sportId).extraMarketNames}
                        />
                    </div>

                    {drawEventHeader}
                    {/* <IconButton className={`data-icon ${disbaledStatClass}`}>
                        { hasStatistics && statisticsType === 'forPopup' ? (
                            <i className={`icon-statistics text-green ${disbaledStatClass}`} onClick={(e) => this.closeStatistics()} />
                        ) : (
                            <i className={`icon-statistics ${disbaledStatClass}`} onClick={(e) => this.openStatistics()} />
                        )}
                    </IconButton> */}
                    <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                        <i className=" material-icons fs-22"> close </i>
                    </IconButton>
                    {/* { liveStreamAvailable ?
                        <IconButton className='live-stream' onClick={this.toggleLiveStream}>
                            <img className="stream-icon-extra-market" alt="stream-icon" src="./images/smart-tv-live-new.svg"></img> 
                        </IconButton> :
                        <IconButton className='live-stream stream_disabled' onClick={this.toggleLiveStream}>
                            <img className="stream-icon-extra-market" alt="stream-icon" src="./images/smart-tv-new.svg"></img> 
                        </IconButton>
                    } */}
                </DialogTitle>

                <DialogContent className="modal-min-height extra-odd__bets p-0">
                    {/* {liveMatch.Livescore.Statistics && statisticsType === 'forPopup' && !showLiveStream && <Statistics />} */}
                    {/* {liveStreamAvailable && showLiveStream && liveMatchURL && <iframe title='Live Stream' width='100%' height='200vw'  style={{ border:'none'}} src={liveMatchURL}></iframe>} */}
                    {drawMarkets}
                </DialogContent>
            </Dialog>
        );
    }
}

ExtraOddsModal.propTypes = {
    closeModal: PropTypes.func,
    event: PropTypes.object,
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
        extraMarketsLoading: state.lsportsGlobal.extraMarketsLoading,
        extraSelectedMarket: state.lsportsGlobal.extraSelectedMarket,
        extraMarketEvent: state.lsportsGlobal.extraMarketEvent,
        statisticsEventId: state.lsportsGlobal.statisticsEventId,
        statisticsType: state.lsportsGlobal.statisticsType,
        language: state.general.language,
        statsData: state.general.statsData
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
