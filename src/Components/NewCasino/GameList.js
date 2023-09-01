import map                   from 'lodash.map';
import PropTypes             from 'prop-types';
import React, {Component}    from 'react';
import {connect}             from 'react-redux';
import {withRouter}          from 'react-router-dom';
import {getNewGameData}      from '../../store/actions/casino.actions';
import {LazyBackgroundImage} from '../Common/ImgLoading';
import LoaderLiveCasino      from '../Common/LoaderLiveCasino';
import Loading               from '../Common/NewLoading';
import Login                 from '../Login';

class GameList extends Component{
	constructor(props){
		super(props);
		this.state = {
			showLogin: false,
		};
	}

	componentDidMount(){
		if(sessionStorage.getItem('casino_url') !== ''){
			sessionStorage.setItem('casino_url', '');
			window.location.reload(false);
		}
	}

	componentDidUpdate(){
		/* if(!this.props.isShowCasino) {
			this.props.history.push('/')
		}*/
	}

	isLoggedIn = () => {
		return this.props.userData !== null;
	};

	playGame = (game) => {
		if(this.isLoggedIn()){
			let history = this.props.history;
			this.props.getNewGameData(game, history);
		}
		else{
			this.setState({showLogin: true});
		}
	};

	showLoginForm = (e) => {
		this.setState({showLogin: true});
	};

	hideLogin = () => {
		this.setState({showLogin: false});
	};

	render(){
		let {showLogin}                                                      = this.state;
		let {newCasinoGames, filteredNewCasinoGames, loadingNewCasinoGames, noSearchResults} = this.props;
		if(filteredNewCasinoGames === undefined){
			filteredNewCasinoGames = [];
		}
		let newCasinoGamesList = noSearchResults ? [] : filteredNewCasinoGames.length > 0 ? filteredNewCasinoGames : newCasinoGames;

		let imageUrl = "/images/comming_soon.jpg"
		let gameList = map(newCasinoGamesList, (game, company) => {


			return (<div className="casino__item" onClick={() => this.playGame(game)} key={`${company}`}>
    <LazyBackgroundImage image={game.imgURL || imageUrl} fallbackImage="./images/loading-dark.gif" className="casino__img"/>
			</div>);
		});
		if(newCasinoGamesList === undefined){
			newCasinoGamesList = [];
		}

		return loadingNewCasinoGames ? (<Loading/>) : newCasinoGamesList.length > 0 ? (<>
    <div className="casino__list pl-40 pr-40 clearfix mb-2">{this.props.loading ? <LoaderLiveCasino/> :

    <>{gameList}</>}</div>

    {showLogin && <Login hideLogin={this.hideLogin}/>}
		</>) : (<div className="no-data fs-15 pt-3 pb-3"><img className="loading-img" src="/images/unnamed.jpg"/></div>);
	}
}

GameList.propTypes = {
	newCasinoGames        : PropTypes.array,
	filteredNewCasinoGames: PropTypes.array,
	loadingNewCasinoGames : PropTypes.bool,
	noSearchResults       : PropTypes.bool,
	userData              : PropTypes.object,
	getNewGameData        : PropTypes.func,
};

const mapStateToProps = (state) => {
	return {
		newCasinoGames        : state.casino.newCasinoGames,
		filteredNewCasinoGames: state.casino.filteredNewCasinoGames,
		loadingNewCasinoGames : state.casino.loadingNewCasinoGames,
		noSearchResults       : state.casino.noSearchResults,
		userData              : state.user.data,
		loading               : state.general.loading,
		isShowCasino          : state.general.isShowCasino,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getNewGameData: (id, history) => dispatch(getNewGameData(id, history)),
	};
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));
