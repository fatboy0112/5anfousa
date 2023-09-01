import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';
import PrivateRoute from '../helper/PrivateRoute';
import PublicRoute from '../helper/PublicRoute';
import FullLayoutRoute from '../helper/FullLayoutRoute';
import DefaultRoute from '../helper/DefaultRoute';
import Affiliates from'../Desktop/Home/Nhome/Affiliates';

import Home from '../Desktop/Home';
import Upcoming from '../Desktop/Today/home';
import ESports from '../Desktop/Today/esports';
import KSports from '../Desktop/Today/ksports';

import Casino from '../Desktop/Casino';
import CasinoGame from '../Desktop/Casino/SingleGame';
import LiveCasino from '../Desktop/LiveCasino';
import pcasino from '../Desktop/P-Casino';


import MyAccount from '../Components/MyAccount';
import MyBets from '../Components/MyBets';
import Betslip from '../Components/Betslip';
import Transactions from '../Components/Transactions';

import Inplay from '../Desktop/Inplay/home';
import About from '../Components/Home/Bhome/About';
import Prematch from '../Components/Prematch';
import Results from '../Desktop/Results';
import Today from '../Desktop/Today/home';
import LastMinute from '../Components/LastMinute';
import Favorites from '../Desktop/Favorites';
import VirtualSports from '../Desktop/VirtualSports';

import ExtraOddsModal from '../Desktop/Inplay/ExtraOddsModal';
import ExtraOddsModalPrematch from '../Desktop/Shared/ExtraOddsModal';

import Auth from '../store/Auth';
import LsportsAMQ from '../store/LsportsAMQ';
import UserAMQ from '../store/UserAMQ';
import '../assets/style/Desktop/index.css';
import Promotion from '../Desktop/Promotion';
import PrivacyPolicy from '../Desktop/Promotion/PrivacyPolicy';
import TermsAndConditions from '../Desktop/Promotion/TermsAndConditions';
import FirstDepositBonus from '../Desktop/Promotion/FirstDepositBonus/index.js';
import ChampionsLeagueRules from '../Desktop/Promotion/ChampionsLeagueRules/index.js';
import TakeItAll from '../Desktop/Promotion/TakeItAll/index.js';
import CustomerService from '../Desktop/CustomerService/index.js';

import Ggslot from '../Desktop/GGSlot';
import PragmaticPlay from '../Desktop/PragmaticPlay';
import NewCasino from '../Desktop/NewCasino';
import LobbyCasino from '../Desktop/Casino/LobbyCasino';

function DesktopRoutes(props) {

  useEffect(() => {
      if (!props.isMobileOnly && props.history.location.pathname.split('/')[1] !== 'd') props.history.push('/d');
      if (props.isMobileOnly && props.history.location.pathname.split('/')[1] === 'd') props.history.push('/');
  });

    return (
        <>
            <Auth>
                <Switch>
                    <PublicRoute exact path="/d" component={Home} />
                    <PublicRoute exact path="/d/sports" component={Upcoming} />
                    <PublicRoute exact path="/d/about" component={About} />
                    <PublicRoute exact path="/d/affiliates" component={Affiliates} />


                    {/* <PublicRoute exact path="/d/ksports" component={KSports} />
                    <PublicRoute exact path="/d/esports" component={ESports} /> */}
                    <PublicRoute exact path="/d/live-betting" component={Inplay} />

                    <PublicRoute exact path="/d/casino" component={Casino} headerClass="header_transparent" title="casino" />
                    <PublicRoute exact path="/d/casino/game/:gameTitle" component={CasinoGame} />
                    {/* <PrivateRoute exact path="/d/live-casino" component={LiveCasino} headerClass="header_transparent" title="liveCasino" /> */}
                    {/* <PrivateRoute exact path="/d/pragmatic-play" component={PragmaticPlay}
                                  headerClass="header_transparent" title="pragmaticPlay"/> */}
                    <PublicRoute exact path="/d/p-casino" component={pcasino} headerClass="header_transparent" title="p-Casino" />
                    {/* <PrivateRoute exact path="/d/virtual-sports" component={VirtualSports} headerClass="header_transparent" title="VirtualSports" /> */}

                    <PublicRoute exact path="/d/casino/lobby" component={LobbyCasino} headerClass="header_transparent" title="casino" />
                    <PublicRoute exact path="/d/casino/lobby/:lobbyName" component={LobbyCasino} headerClass="header_transparent" title="casino" />
                    <PrivateRoute exact path="/d/my-account" component={MyAccount} headerClass="header_white" title="myAccount" />
                    <PrivateRoute exact path="/d/my-bets" component={MyBets} headerClass="header_white" title="myBets" />
                    <PublicRoute exact path="/d/betslip" component={Betslip} headerClass="header_white" title="betslip" />
                    <PrivateRoute exact path="/d/my-account/transactions" component={Transactions} headerClass="header_white" title="transaction" />
                    <PublicRoute exact path="/d/results" component={Results} headerClass="header_white" title="results" />
                    <PublicRoute exact path="/d/today" component={Today} headerClass="header_white" title="today" />
                    <PublicRoute exact path="/d/last-minute" component={LastMinute} headerClass="header_white" title="lastMinute" />
                    <PrivateRoute exact path="/d/favorites" component={Favorites} headerClass="header_white" title="favorites" />
                    <PublicRoute exact path="/d/promotion" component={Promotion} headerClass="header_white" title="promotion" />
                    <PublicRoute exact path="/d/privacy-policy" component={PrivacyPolicy} headerClass="header_white" title="privacy-policy" />
                    <PublicRoute exact path="/d/terms-and-conditions" component={TermsAndConditions} headerClass="header_white" title="terms-and-conditions" />
                    <PublicRoute exact path="/d/promotion/first-deposit-bonus" component={FirstDepositBonus} headerClass="header_white" title="first-deposit-bonus" />
                    <PublicRoute exact path="/d/promotion/champions-league-rules" component={ChampionsLeagueRules} headerClass="header_white" title="Champions-league-rules" />
                    <PublicRoute exact path="/d/promotion/take-it-all" component={TakeItAll} headerClass="header_white" title="take-it-all" />
                    <PublicRoute exact path="/d/customerServices" component={CustomerService} headerClass="header_white" title="customerService" />
                    {/* <PublicRoute exact path="/d/live-bettingextra-market/:sportId/:fixtureId/:liveStreamAvailable" component={Home} isMobileOnly={ props.isMobileOnly } isExtraMarket={true} headerClass="header_white" extraMarketChild={ExtraOddsModal} title="ExtraOddsModal" />
                    <PublicRoute exact path="/d/extra-market/:sportId/:fixtureId" component={Home} isMobileOnly={ props.isMobileOnly } isExtraMarket={true} headerClass="header_white" extraMarketChild={ExtraOddsModalPrematch} title="ExtraOddsModal" /> */}
                    <PublicRoute exact path="/d/live-bettingextra-market/:sportId/:fixtureId/:liveStreamAvailable" component={Inplay} isMobileOnly={ props.isMobileOnly } isExtraMarket={true} headerClass="header_white" extraMarketChild={ExtraOddsModal} title="ExtraOddsModal" />
                    <PublicRoute exact path="/d/extra-market/:sportId/:fixtureId" component={Today} isMobileOnly={ props.isMobileOnly } isExtraMarket={true} headerClass="header_white" extraMarketChild={ExtraOddsModalPrematch} title="ExtraOddsModal" />
                    <PublicRoute exact path="/d/ggslot" component={Ggslot} headerClass="header_white" title="casino" />
                    {/* <PrivateRoute exact path="/d/new-casino" component={NewCasino} headerClass="header_white" title="casino" /> */}
                    <DefaultRoute />
                </Switch>
            </Auth>
        </>       
    );
}

export default DesktopRoutes;
