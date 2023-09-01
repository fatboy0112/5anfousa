import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash.find';
import IconButton from '@material-ui/core/IconButton';
import { addFavorite, removeFavorite } from '../../../store/actions/favorites.actions';
import { lSportsConfig } from '../../../config';

class Favorite extends Component {
    setStarActive = () => {
        if (this.isLoggedIn()) {
            let { fixture, favorites, unsubscribeSingleEvents, favoritesLiveMatches } = this.props;
            favorites = [ ...favorites , ...favoritesLiveMatches];
            unsubscribeSingleEvents && unsubscribeSingleEvents(fixture.fixture_id ? fixture.fixture_id : fixture.FixtureId);
            let isFavorite =
                favorites.length > 0 &&
                find(favorites, {
                    fixture_id: fixture.fixture_id ? fixture.fixture_id : fixture.FixtureId,
                });
                
            // Remove the existing favorite
            if (isFavorite) {
                this.props.removeFavorite(isFavorite.id ? isFavorite.id : isFavorite.fixture_id, isFavorite.fixture_id);                
            }

            // Add the match to the favorite
            else if (fixture.fixture_status !== lSportsConfig.statuses.inplay) {
                this.props.addFavorite(fixture.id, fixture.fixture_id);
            } else {
                // Live match
                this.props.addFavorite(null, fixture?.fixture_id || fixture.FixtureId);
            }
        }
    };

    isLoggedIn = () => {
        return this.props.userData !== null;
    };

    render() {
        let { fixture, favorites, favoritesLiveMatches } = this.props;
        favorites = [ ...favorites , ...favoritesLiveMatches]
        let isFavorite = false;

        if (this.isLoggedIn()) {
            isFavorite =
                favorites.length > 0 &&
                find(favorites, {
                    fixture_id: fixture.fixture_id ? fixture.fixture_id : fixture.FixtureId,
                });
        }

        return (
            <div className="match__favorite p-2">
                <IconButton aria-label="favorite" className="p-0" onClick={this.setStarActive}>
                    <i className={`material-icons ${isFavorite ? 'text-yellow' : ''}`}>{isFavorite ? 'star' : 'star_border'}</i>
                </IconButton>
            </div>
        );
    }
}

Favorite.propTypes = {
    fixture: PropTypes.object,
    favorites: PropTypes.array,
    favoritesLiveMatches: PropTypes.array,
    userData: PropTypes.object,
    addFavorite: PropTypes.func,
    removeFavorite: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
        favorites: state.favorites.favorites,
        favoritesLiveMatches: state.favorites.favoritesLiveMatches,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        addFavorite: (id, fixtureId) => dispatch(addFavorite(id, fixtureId)),
        removeFavorite: (id, fixtureId) => dispatch(removeFavorite(id, fixtureId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Favorite);
