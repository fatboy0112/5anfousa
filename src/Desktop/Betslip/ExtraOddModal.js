import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { lSportsConfig } from '../../config';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Markets from '../Inplay/Markets';
import { getExtraMarkets, clearExtraMarkets, selectExtraMarket, setStatistics, clearStatistics } from '../../store/actions/lsports.global.actions';
import Statistics from '../../Components/Shared/Statistics';
import { isEqual } from 'lodash';
import MatchDateTime from '../../Components/Shared/Match/MatchDateTime';
import ExtraMarketSelector from '../../Components/Shared/ExtraMarketSelector';

let unsubscribe;
let extraMarkets = {};
class ExtraOddsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            liveMatchForModal: {},
            liveUpdates: {},
            marketsUpdated: null,
        };
    }

    componentDidMount() {
        let { extraMarketEvent, event } = this.props;
        let sportId = extraMarketEvent.Fixture ? extraMarketEvent.Fixture.Sport.Id : extraMarketEvent.sport_id;
        Util.getExtraMarketName(sportId).extraMarketNames.forEach( e => {
            extraMarkets[e] = {};
        })
        extraMarkets = Util.getExtraMarkets(extraMarkets, this.props.liveMatch, sportId);
        this.setState({ marketsUpdated: extraMarkets});
        // let fixtureId = extraMarketEvent.FixtureId ? extraMarketEvent.FixtureId : extraMarketEvent.fixture_id;
        
        // //this.props.setStatistics(fixtureId, 'forPopup', 'live');
        // let id = event.FixtureId ? event.FixtureId : event.fixture_id;
        // const collection = this.props.language === `en` ? `d_event` : `d_event_${this.props.language}`;
        // firebaseDB.collection(collection).doc(`${id}`).get().then((snap) => {
        //     this.setState({ liveMatchForModal: snap.data() })
        // });
        
    }

    componentDidUpdate(prevProps, prevState) {
        const { liveMatchForModal, liveUpdates } = this.state;

        const { liveMatch, extraMarketEvent } = this.props;
        let sportId = liveMatch.sport_id;
        if (!isEqual(prevProps.liveMatch.Markets, liveMatch.Markets)) {
            extraMarkets = Util.getExtraMarkets(extraMarkets, liveMatch, sportId);
            this.setState({ marketsUpdated: extraMarkets});
        }

        if(prevProps.extraMarketEvent !== extraMarketEvent) {
            extraMarkets = Util.getExtraMarkets(extraMarkets, liveMatch, sportId);
            this.setState({ marketsUpdated: extraMarkets});
        }
        // if (!isEqual(prevState.liveMatchForModal, liveMatchForModal)) {
        //     if (liveMatchForModal?.fixture_status === 2) {
        //         let id = liveMatchForModal?.fixture_id;
        //         const item = {
        //             [id]: liveMatchForModal,
        //         };
        //         this.setState({ liveUpdates: item }, () => {
        //             const collection = this.props.language === `en` ? `d_event` : `d_event_${this.props.language}`;
        //             unsubscribe = firebaseDB.collection(collection).doc(`${id}`).onSnapshot(this.handleFirebaseUpdates);
        //         });
        //     }            
        // }

        // if (!isEqual(prevState.liveUpdates, liveUpdates)) {
        //     if (!liveUpdates) return;
        //     let id = liveMatchForModal.FixtureId;
        //     let liveMatch = liveUpdates[id];
        //     let sportId = liveMatch.Fixture.Sport.Id;
        //     extraMarkets = Util.getExtraMarkets(extraMarkets, liveMatch, sportId);
        //     this.setState({ marketsUpdated: extraMarkets});
        // }

        // if (prevProps.language !== this.props.language) {
        //     this.unsubscribeEvents();
        //     if (liveMatchForModal.Fixture.Status === 2) {
        //         let id = liveMatchForModal.FixtureId;
        //         const item = {
        //             [id]: liveMatchForModal,
        //         };
        //         this.setState({ liveUpdates: item }, () => {
        //             const collection = this.props.language === `en` ? `d_event` : `d_event_${this.props.language}`;
        //             unsubscribe = firebaseDB.collection(collection).doc(`${id}`).onSnapshot(this.handleFirebaseUpdates);
        //         });
        //     }
        // }
    }

    componentWillUnmount() {
        this.props.clearExtraMarkets();
        this.props.clearStatistics();
        this.unsubscribeEvents();
    }

    unsubscribeEvents = () => {
        unsubscribe && unsubscribe();
    };


    handleFirebaseUpdates = (snap) => {
        const updatedMatch = snap.data();
        const id = updatedMatch.FixtureId;
        const { liveUpdates: { [id]: oldMatches }, fixedData } = this.state;

        if (!oldMatches) {
            this.setState({
                liveUpdates: {
                    ...this.state.liveUpdates,
                    [id]: updatedMatch,
                },
            });
            return;
        };
        
        if (!updatedMatch.Markets) {
            this.setState({
                liveUpdates: {
                    ...this.state.liveUpdates,
                    [id]: updatedMatch,
                },
            });
            return;
        };
        let marketsArray = updatedMatch.Markets ? Object.values(updatedMatch.Markets) : [];
        const marketWithDiff =  marketsArray.map(market => {
            const { Bets, Id, Name } = market;
            let oldMarketArray = oldMatches.Markets ? Object.values(oldMatches.Markets) : [];
            const oldMarket = oldMarketArray.find((mar) => mar.Id === Id);
            // If market not present previously no updated needed.
            if (!oldMarket) return market;
            if (!Bets) return market;
            const updatedBetsWithDiff = Object.values(Bets).map(bet => {
                const { Price, Id: betId } = bet;

                let oldBetArray = oldMarket.Bets ? oldMarket.Bets : [];
                if (!Array.isArray(oldMarket.Bets)) {
                    oldBetArray = Object.values(oldMarket.Bets ? oldMarket.Bets : []);
                }
                
                const oldBet = oldBetArray.find((b) => b.Id === betId);
                // If bet not present previously no updated needed.
                if (!oldBet) return bet;

                const { Price: oldPriceStr } = oldBet;
                const price = parseFloat(Price);
                const oldPrice = parseFloat(oldPriceStr);

                const diff = oldPrice - price;

                return {
                    ...bet,
                    diff,
                }
            });

            return {
                ...market,
                Bets: updatedBetsWithDiff,
            };
        });

        this.setState({
            liveUpdates: {
                ...this.state.liveUpdates,
                [id]: { ...updatedMatch, Markets: marketWithDiff },
            },
        });
    }

    openStatistics = () => {
        let { extraMarketEvent } = this.props;
        this.props.setStatistics(extraMarketEvent.FixtureId, 'forPopup', 'live');
    };

    closeStatistics = () => {
        this.props.clearStatistics();
    };

    closeModal = () => {
        const { closeModal } = this.props;
        this.unsubscribeEvents();
        closeModal();
    }

    render() {
        let { closeModal, extraMarketEvent, extraSelectedMarket, selectExtraMarket, statisticsType, language } = this.props;
        const { liveUpdates } = this.state;
        const lan = `name_${ language.toLowerCase() }`;
        let id = extraMarketEvent.FixtureId ? extraMarketEvent.FixtureId : extraMarketEvent.fixture_id;
        // if live data is not present use the store data and once live data is available use that
        let liveMatch = liveUpdates[id];
        liveMatch = liveMatch ? liveMatch : extraMarketEvent; 
        //let liveMarkets = liveUpdates ? (!liveUpdates[id] ? []: liveUpdates[id].Markets) : [];
        let fixtureStatus = liveMatch.Fixture ? liveMatch.Fixture.Status : liveMatch.fixture_status;
        let type =
        fixtureStatus === lSportsConfig.statuses.inplay
                ? 'live'
                : fixtureStatus === lSportsConfig.statuses.prematch
                ? 'sports'
                : 'last-minute';
        let leagueName = liveMatch.Fixture ? liveMatch.Fixture.League.Name : liveMatch.league_name;
        let liveScore = liveMatch.Livescore ? liveMatch.Livescore : liveMatch.livescore;
        let results =
            liveScore && liveScore.Scoreboard && liveScore.Scoreboard.Results
                ? liveScore.Scoreboard.Results
                : null;
        results = Object.values(results);
        let currentDate = Util.convertToLocalTimezone(liveMatch.Fixture ? liveMatch.Fixture.StartDate : liveMatch.start_date);
        let timeString = currentDate.timeString;
        
        let matchInfo = type === 'live' ? results ? results[0].Value + ' : ' + results[1].Value : '' : <time className="d-block lh-18">{timeString}</time>;

        let disbaledStatClass = !liveMatch?.Livescore.Statistics ? 'statistics_disabled' : '';

        let participants = liveMatch.Fixture ? liveMatch.Fixture.Participants : liveMatch.participants;
        let drawEventHeader = (
            <div className="extra-odd__title">
                <p className="league-name">{leagueName}</p>
                <div className="team-name">
                    <span className="extra-odd__participant name-one ellipsis">{participants[0].participant ? participants[0].participant?.name || participants[0].participant?.name_en : participants[0][lan] || participants[0].name_en}</span>
                    <span className="extra-odd__score score">{matchInfo}<MatchDateTime fixture={liveMatch} showDate={false} /></span>
                    <span className="extra-odd__participant ellipsis name-two">{participants[1].participant ? participants[1].participant?.name || participants[1].participant?.name_en : participants[1][lan] || participants[1].name_en}</span>
                </div>
            </div>
        );
        let currentlySelectedMarket = extraSelectedMarket ? extraSelectedMarket : "All";
        let extraMarketEventsList = extraMarkets[currentlySelectedMarket];
        let sportId = liveMatch.Fixture ? liveMatch.Fixture.Sport.Id : liveMatch.sport_id;
        // check if all bets are settled
        let areBetsAllSettled = Util.checkSettledBets(extraMarketEventsList);
        let drawMarkets =
            extraMarketEventsList && Object.keys(extraMarketEventsList).length > 0 ? (
                areBetsAllSettled ? (
                    <div className="no-data fs-15 pt-3 pb-3">All the Odds are settled for this event.</div>
                ) : 
                
                (
                  <Markets markets={extraMarketEventsList} fixture={liveMatch} type={type} leagueName={leagueName}  />
                )
            ) 
            : (
                <div className="no-data fs-15 pt-3 pb-3">No data</div>
            );

        return  (
            <Dialog onClose={closeModal} aria-labelledby="extra-odds-dialog-title" open={true} scroll="paper" className="extra-odds__modal">
                <DialogTitle id="extra-odds-dialog-title" className="p-0 dialog-tab" disableTypography>
                    <div className="pr-6">
                        <ExtraMarketSelector
                            selectExtraMarket={selectExtraMarket}
                            extraSelectedMarket={currentlySelectedMarket}
                            extraMarketNames={Util.getExtraMarketName(sportId).extraMarketNames}
                        />
                    </div>
                    {drawEventHeader}

                    {/* <IconButton className={`data-icon ${disbaledStatClass}`}>
                        { liveMatch?.Livescore.Statistics && statisticsType === 'forPopup' ? (
                            <i className={`icon-statistics text-green ${disbaledStatClass}`} onClick={(e) => this.closeStatistics() } />
                        ) : (
                            <i className={`icon-statistics ${disbaledStatClass}`} onClick={(e) =>  this.openStatistics()} />
                        )}
                    </IconButton> */}

                    <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                        <i className=" material-icons fs-22"> close </i>
                    </IconButton>
                </DialogTitle>

                <DialogContent className="modal-min-height extra-odd__bets p-0">
                    {/* {liveMatch?.Livescore.Statistics && statisticsType === 'forPopup' && <Statistics />} */}
                    {drawMarkets}
                </DialogContent>
            </Dialog>
        );
    }
}

ExtraOddsModal.propTypes = {
    closeModal: PropTypes.func,
    event: PropTypes.object,
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
        fixtures: state.betslip.fixtures,
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
