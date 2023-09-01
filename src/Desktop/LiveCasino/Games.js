import React from 'react';
import PropTypes from 'prop-types';
import forEach from 'lodash.foreach';
import { LazyImage } from '../../Components/Common/ImgLoading';

function Games(props) {
    let { games, playGame, rows } = props;

    let list = [];
    let list_1 = [];
    let list_2 = [];
     let imageUrl = "/images/comming_soon.jpg"
    forEach(games, (game, i) => {
        let singleGame = (
            <li key={game.id}>
                <div className="hover-parent">
                    {/* <LazyBackgroundImage image={game.logo} fallbackImage="./images/loading-dark.gif" className="casino-img" /> */}
                    <LazyImage image={game.imgURL||imageUrl} fallbackImage="/images/loading-dark.gif" className="casino-img" />
                    <div className="play-btn" onClick={() => playGame(game)}>
                        <img src="/images/playBtn-en.png" />
                    </div>
                </div>
            </li>
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
