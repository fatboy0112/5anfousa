import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';
import PrivateRoute from '../helper/PrivateRoute';
import PublicRoute from '../helper/PublicRoute';
import FullLayoutRoute from '../helper/FullLayoutRoute';
import DefaultRoute from '../helper/DefaultRoute';

import '../App.css';

import Home from '../Components/Home';
import Casino from '../Components/Casino';
import CasinoGame from '../Components/Casino/SingleGame';
import PCasino from '../Components/P-casino';


import MyAccount from '../Components/MyAccount';
import MyBets from '../Components/MyBets';
import Betslip from '../Components/Betslip';
import Transactions from '../Components/Transactions';

import Inplay from '../Components/Inplay';
import InplaySearch from '../Components/Inplay/Search';
import Prematch from '../Components/Prematch';
import PrematchSearch from '../Components/Prematch/Search';
import Results from '../Components/Results';
import ResultsSearch from '../Components/Results/Search';
import Upcoming from '../Components/Today';  // shows matches till next day EOD
import UpcomingSearch from '../Components/Today/Search';
import Tomorrow from '../Components/Tomorrow';
import TomorrowSearch from '../Components/Tomorrow/Search';

import Favorites from '../Components/Favorites';
import TermsAndCondition from '../Components/MyAccount/TermsAndCondition';

import Auth from '../store/Auth';


import Ggslot from '../Components/Ggslot';

import Jackpot from '../Components/Jackpot';
import LobbyCasino from '../Components/Casino/LobbyCasino';


function MobileRoutes(props) {

  useEffect(() => {
    if(!props.isMobileOnly && props.history.location.pathname.split('/')[1] !== 'd') props.history.push('/d');
    if(props.isMobileOnly && props.history.location.pathname.split('/')[1] === 'd')props.history.push('/');
  }, [props.history, props.isMobileOnly]);

  return (
      <>
          <Auth>
              <Switch>
                  <PublicRoute exact path="/" component={Home} isMobileOnly={ props.isMobileOnly }/>
                  <PrivateRoute exact path="/jackpot" component={Jackpot} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="jackpot" />
                  <PrivateRoute exact path="/p-casino" component={PCasino} isMobileOnly={ props.isMobileOnly } headerClass="header_transparent" title="PCasino" />
                  <PrivateRoute exact path="/casino/lobby/:lobbyName" component={LobbyCasino} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="casino" />
                  <PrivateRoute exact path="/casino/lobby" component={LobbyCasino} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="casino" />
                  
                  <FullLayoutRoute exact path="/casino" component={Casino} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="casino" />
                  <FullLayoutRoute exact path="/casino/game/:gameTitle" component={CasinoGame} />
                  {/* <PrivateRoute exact path="/live-casino" component={LiveCasino} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="liveCasino" /> */}
                  {/* <FullLayoutRoute exact path="/pragmatic-play" component={NewCasino} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="pragmaticPlay"/> */}
                  {/* <FullLayoutRoute exact path="/slotplay" component={PragmaticPlay} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="pragmaticPlay"/> */}

                  {/*<FullLayoutRoute exact path="/virtual-sports" component={VirtualSports} isMobileOnly={ props.isMobileOnly } headerClass="header_transparent" title='virtualSports' />*/}
                  <PrivateRoute exact path="/my-account" component={MyAccount} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="myAccount" />
                  <PrivateRoute exact path="/my-bets" component={MyBets} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="myBets" />
                  <PublicRoute exact path="/betslip" component={Betslip} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="betslip" />
                  <PrivateRoute exact path="/my-account/transactions" component={Transactions} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="transaction" />
                  <PublicRoute exact path="/live" component={Inplay} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="inplay" />
                  <PublicRoute exact path="/live/search" component={InplaySearch} isMobileOnly={ props.isMobileOnly } title="inplay" />
                  <PublicRoute exact path="/sports" component={Prematch} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="sports" />
                  <PublicRoute exact path="/sports/search" component={PrematchSearch} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="sports" />
                  <PublicRoute exact path="/results" component={Results} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="results" />
                  <PublicRoute exact path="/results/search" component={ResultsSearch} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="results" />
                  <PublicRoute exact path="/upcoming" component={Upcoming} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="upcoming" />
                  <PublicRoute exact path="/upcoming/search" component={UpcomingSearch} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="upcoming" />
                  <PublicRoute exact path="/tomorrow" component={Tomorrow} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="tomorrow" />
                  <PublicRoute exact path="/tomorrow/search" component={TomorrowSearch} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="tomorrow" />
                  <PrivateRoute exact path="/favorites" component={Favorites} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="favorites" />
                  <PublicRoute exact path="/terms-page" component={TermsAndCondition} headerClass="header_white" title="Terms" />
                  <PublicRoute exact path="/ggslot" component={Ggslot} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="casino" />
                  {/* <PrivateRoute exact path="/virtual-sports" component={VirtualSports} isMobileOnly={ props.isMobileOnly } headerClass="header_white" title="VirtualSports" /> */}
                  {/* <PublicRoute exact path="/new-casino" component={NewCasino} isMobileOnly={props.isMobileOnly} headerClass="header_white" title="casino"/> */}

                  <DefaultRoute />
              </Switch>
          </Auth>
      </>
  );
}

export default MobileRoutes;
