import { Grid } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Translate } from '../../localization';

function CasinoGames() {

    const history = useHistory();

    const handleGames = () => {
        history.push('/d/casino');
    };

    return(
        <div onClick={handleGames} className="landing-page-casino-section">
            <div className='match-heading_casino mb-1'>
                <img src="../images/all-icon-yellow.svg" alt="img" height="20px" width="30px"/>
                <b>{Translate.casinoGames}</b> 
            </div>
            <Grid container spacing={1}>
                <Grid  item xs={4} >
                    <img src='../images/casino/book-of-ra.jpg'
                    alt="casino_games" height="140px" width="95px"/>
                </Grid>
                <Grid  item xs={4}>
                    <img src="../images/casino/berry-burst.jpg"
                    alt="casino_games" height="140px" width="95px"/>
                </Grid>
                <Grid  item xs={4} >
                    <img src="../images/casino/gonzos-quest.jpg"
                    alt="casino_games" height="140px" width="95px"/>
                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid  item xs={4} >
                    <img src="../images/casino/- narcos.jpg"
                    alt="casino_games" height="140px" width="95px"/>   
                </Grid>
                <Grid  item xs={4}>
                    <img src="../images/casino/starburst.jpg"
                    alt="casino_games" height="140px" width="95px"/>
                </Grid>
                <Grid  item xs={4} >
                    <img src="../images/live-casino/roulette/AMERICAN_ROULETTE.jpg"
                    alt="casino_games" height="140px" width="95px"/>
                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid  item xs={4} >
                    <img src="../images/live-casino/roulette/Auto_Roulette.jpg"
                    alt="casino_games" height="140px" width="95px"/>
                </Grid>
                <Grid  item xs={4}>
                    <img src="../images/live-casino/roulette/Lightning_Roulette.jpg"
                    alt="casino_games" height="140px" width="95px"/>
                </Grid>
                <Grid  item xs={4} >
                    <img src="../images/live-casino/roulette/Immersive_Roulette.jpg"
                    alt="casino_games" height="140px" width="95px"/>
                </Grid>
            </Grid>
        </div>
    );
}

export default CasinoGames;