import React from 'react';
import PropTypes from 'prop-types';
import forEach from 'lodash.foreach';
import { LazyBackgroundImage } from '../Common/ImgLoading';

function Games(props) {
    let { games, playGame, rows } = props;

    let list = [];
    let list_1 = [];
    let list_2 = [];
    let imageUrl = "/images/comming_soon.jpg"
    forEach(games, (game, i) => {
        let singleGame = (
            <div className="casino__item" key={i} onClick={() => playGame(game)}>
                <LazyBackgroundImage image={game.imgURL||imageUrl} fallbackImage="./images/loading-dark.gif" className="casino__img" />
            </div>
        );

        if (rows === 1) {
            list.push(singleGame);
        } else {
            if (i % 2 === 0) {
                list_1.push(singleGame);
            } else {
                list_2.push(singleGame);
            }

            list = (
                <>
                    <div>{list_1}</div>
                    <div>{list_2}</div>
                </>
            );
        }
    });

    return <>{list}</>;
}

Games.propTypes = {
    games: PropTypes.array,
    playGame: PropTypes.func,
    rows: PropTypes.number,
};

export default Games;
