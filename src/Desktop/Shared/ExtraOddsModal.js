import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Util from '../../helper/Util';
import { intervalTime, lSportsConfig } from '../../config';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Loading from '../../Components/Common/NewLoading';
import Markets from '../Shared/MarketsPrematch';
import ExtraMarketSelector from '../Shared/ExtraMarketSelector';
//import Statistics from '../Shared/Statistics';
//import { getExtraMarkets, clearExtraMarkets, selectExtraMarket, setStatistics, clearStatistics } from '../../store/actions/lsports.global.actions';
import Statistics from '../Shared/Statistics';
import { getExtraMarkets, clearExtraMarkets, selectExtraMarket, setStatistics, clearStatistics, setExtraMarketLeagueName, setExtraMarketLocationName } from '../../store/actions/lsports.global.actions';
import { forEach, isEmpty } from 'lodash';
import { dynamoClient } from '../../App';
import { paramsMarketData, paramsMarketDataIndex, paramsSinglePrematchDEvent } from '../../dynamo/params';
import { Translate } from '../../localization';
import { withRouter } from 'react-router-dom';
import FiveFeaturedMarkets from '../FiveFeaturedMarkets.js';

let extraMarkets = {};
let timer;
class ExtraOddsModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            marketsUpdated: {},
            prematchEvent: {},
            noEvent: false,
            isLoading: true,
        };
    }

    componentDidMount() {
        let { extraMarketEvent, match, language } = this.props;

        let sportId = match.params.sportId;
        let fixtureId = match.params.fixtureId;
        this.setExtraMarket('All');
        this.getSinglePartialEvent(fixtureId).then(partialEvent => {
            this.getSinglePartialMarket(fixtureId).then(partialMarket => {
                const event = { ...partialEvent[0], ...partialMarket };
                if (!partialMarket || !partialMarket || Util.getFormattedDate(event.start_date) < new Date()) {
                    this.setState({ noEvent: true, isLoading: false });
                    return;
                }
                this.setState({ prematchEvent: event }, () => {
                    this.openStatistics();
                    if (!this.state.noEvent) {
                        this.props.setExtraMarketLeagueName(event.league[language === 'en' ? 'name_en' : `name_${language.toLowerCase()}`]);
                        this.props.setExtraMarketLocationName(event.location[language === 'en' ? 'name_en' : `name_${language.toLowerCase()}`]);
                    }
                    this.setState({ isLoading: false });
                });
            });
        });



        timer = setInterval(() => {
            this.getSinglePartialMarket(fixtureId).then(partialMarket => {
                let { prematchEvent } = this.state;
                const event = { ...prematchEvent, ...partialMarket };
                if (!partialMarket || !event.start_date || Util.getFormattedDate(event.start_date) < new Date()) {
                    this.setState({ noEvent: true, isLoading: false });
                    return;
                }
                this.setState({ prematchEvent: event });

            });
        }, intervalTime);


        // this.props.getExtraMarkets(fixtureId);

        // if (extraMarketEvent.has_live_statistics || extraMarketEvent.has_prematch_statistics) {
        //     let statsTemplateType = extraMarketEvent.has_live_statistics ? 'live' : extraMarketEvent.has_prematch_statistics ? 'prematch' : '';
        //     let eventId = extraMarketEvent.fixture_id;
        //     this.props.setStatistics(eventId, 'forPopup', statsTemplateType);
        // }
    }

    componentDidUpdate(prevProps, prevState) {
        const { extraMarketEvent, match } = this.props;
        const { prematchEvent } = this.state;
        if (prevState.prematchEvent !== prematchEvent) {

            let sportId = match.params.sportId;
            Util.getExtraMarketNamePrematch(sportId).extraMarketNames.forEach(e => {
                extraMarkets[e] = {};
            });
            extraMarkets = Util.getExtraMarketsPrematch(extraMarkets, prematchEvent, +sportId);

            this.setState({ marketsUpdated: extraMarkets });
        }
    }

    componentWillUnmount() {
        this.props.clearExtraMarkets();
        this.props.clearStatistics();
        clearInterval(timer);
    }

    setExtraMarkets = () => {
        let { match } = this.props;
        let { prematchEvent } = this.state;
        let sportId = match.params.sportId;
        let fixtureId = match.params.fixtureId;

        Util.getExtraMarketNamePrematch(sportId).extraMarketNames.forEach(e => {
            extraMarkets[e] = {};
        });
        extraMarkets = Util.getExtraMarketsPrematch(extraMarkets, prematchEvent, sportId);
        this.setState({ marketsUpdated: extraMarkets });
    }

    setExtraMarket = (marketName) => {
        this.props.selectExtraMarket(marketName);
    }

    getSinglePartialEvent = async (fixtureId) => {
        let event = dynamoClient.query(paramsSinglePrematchDEvent(fixtureId)).promise();
        return await event.then(res => {
            let { Items } = res;
            return Util.partialMatchFormatter(Items);
        });
    }

    getSinglePartialMarket = async (fixtureId) => {
        let markets = dynamoClient.query(paramsMarketDataIndex(fixtureId)).promise();
        const res = await markets;
        let markets_1 = {};
        let Items = res?.Items;
        if (Items.length)
            markets_1['market'] = Util.marketFormatter(Items, fixtureId);
        return markets_1;
    }

    openStatistics = () => {
        let { extraMarketEvent, statsData } = this.props;
        let { prematchEvent } = this.state;
        if (true || statsData?.[+prematchEvent.fixture_id]) {
            let statsTemplateType = prematchEvent.has_live_statistics ? 'live' : prematchEvent.has_prematch_statistics ? 'prematch' : '';
            let eventId = prematchEvent.fixture_id;
            this.props.setStatistics(eventId, 'forPopup', 'prematch');
        }
    };

    closeStatistics = () => {
        this.props.clearStatistics();
    };

    render() {
        // let fixtureId = this.props.match.params.fixtureId;

        let {
            closeModal,
            extraMarkets,
            selectExtraMarket,
            extraSelectedMarket,
            extraMarketsLoading,
            extraMarketEvent,
            statisticsEventId,
            statisticsType,
            statsData,
            language,
            match
        } = this.props;

        let { prematchEvent, noEvent, isLoading } = this.state;
        let extraMarketNames = prematchEvent && Object.keys(prematchEvent);
        extraMarketEvent = {};
        let lang = `name_${ language.toLowerCase() }`;
        let sportId = match.params.sportId;
        let type = 'sports';
        let leagueName;
        if (!isEmpty(prematchEvent)) {
            leagueName = prematchEvent?.league?.[lang] ? prematchEvent?.league?.[lang] : prematchEvent?.league?.name_en;
        }
        let results =
            !isEmpty(prematchEvent) && prematchEvent.livescore && prematchEvent.livescore.Scoreboard && prematchEvent.livescore.Scoreboard.Results
                ? prematchEvent.livescore.Scoreboard.Results
                : null;

        let currentDate = !isEmpty(prematchEvent) && Util.convertToLocalTimezone(prematchEvent.start_date);
        let timeString = currentDate?.timeString;

        let matchInfo = type === 'live' ? results ? results[0].Value + ' : ' + results[1].Value : '' :
        <time className = "d-block text-white time_string">{currentDate?.dateString} {timeString}</time>;

        let disbaledStatClass = !(extraMarketEvent.has_live_statistics || statsData?.[+prematchEvent.fixture_id]) ? 'statistics_disabled' : '';

        let drawEventHeader = (
            !isEmpty(prematchEvent) && !noEvent && <div className="team-name ">
                <div className=" d-flex justify-content-center team-name-section ">
                    <p className="name-one ellipsis text-right">{prematchEvent?.participants[0][lang] || prematchEvent?.participants[0].name_en}</p>
                    <p className="extra-odd__score score">
                        <p className="score-num">-:-</p>
                        {/* {matchInfo} */}
                    </p>
                    <p className="ellipsis name-two">{prematchEvent?.participants[1][lang] || prematchEvent?.participants[1].name_en}</p>
                </div>
            </div>
        );

        let extraMarketEventsList = this.state.marketsUpdated[extraSelectedMarket];
        let extraFiveMarkets = this.state.marketsUpdated['All'];
        // check if all bets are settled
        let areBetsAllSettled = Util.checkSettledBetsPrematch(extraMarketEventsList);
        const extraMarketButtons = [];

        forEach(Util.getExtraMarketName(sportId).extraMarketNames, (market) => {
            extraMarketButtons.push(<li key={market}> <button className={extraSelectedMarket === market && 'active_prematch'} onClick={() => this.setExtraMarket(market)}> {Translate.tabNames[market]} </button></li>);
        });

        let drawMarkets =
            prematchEvent && Object.keys(prematchEvent).length > 0 && !noEvent ? (
                areBetsAllSettled ? (
                    <div className="no-data fs-15 pt-3 pb-3">All the Odds are settled for this event.</div>
                ) : (
                    <Markets markets={extraMarketEventsList} fixture={prematchEvent} type={type} leagueName={leagueName} />
                    )
            ) : (
                <div className="no-data fs-15 pt-3 pb-3 text-center">No data</div>
                );

        return isLoading ? (
            <Loading customClass='odds-panel w-100' />
        ) : (
            <div className='extra-mkt prematch '>
                <div className="modal-header" >
                    <div className='head-right justify-content-between'>
                        <IconButton aria-label="close" className="close">
                            <i  className="material-icons icon-color" onClick={(e) => this.props.history.push('/d/sports')}> keyboard_arrow_left </i>
                        </IconButton>
                        {drawEventHeader}
                        <div className = 'icons_statistics'>
                            {/* <IconButton className={`data-icon ${disbaledStatClass}`}>
                                    {statisticsEventId > 0 && statisticsType === 'forPopup' ? (
                                        <i className={`icon-statistics text-green ${disbaledStatClass}`} onClick={(e) => this.closeStatistics()} />
                                    ) : (
                                        <i className={`icon-statistics text-grey ${disbaledStatClass}`} onClick={(e) => this.openStatistics()} />
                                        )}
                            </IconButton> */}
                        </div>
                    </div>
                    
                    <div className = "d-flex w-100 market-result-section ">
                        <ul className = 'extra-market-ul justify-content-center text-white '>
                            <li>
                                {matchInfo}
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='modal-body'>
                    <div className='d-flex five_markets'> 
                        {/* <Statistics /> */}
                        <FiveFeaturedMarkets markets={extraFiveMarkets} fixture={prematchEvent} type={type} leagueName={leagueName}  areBetsAllSettled={areBetsAllSettled} status = "PreMatch"/>
                    </div>
                    <div className="main-market-listing-header">
                        <ul >
                            {/* {marketButtons} */}

                            <ExtraMarketSelector
                                selectExtraMarket={selectExtraMarket}
                                extraSelectedMarket={extraSelectedMarket}
                                extraMarketNames={Util.getExtraMarketName(sportId).extraMarketNames}
                            />
                        </ul>
                    </div>
                    <div className='modal-content'>

                        {drawMarkets}
                    </div>

                </div>

                    

            </div>



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
        setExtraMarketLocationName: (location) => dispatch(setExtraMarketLocationName(location)),
        setExtraMarketLeagueName: (league) => dispatch(setExtraMarketLeagueName(league)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExtraOddsModal));
