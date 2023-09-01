import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

let timeout1;
let timeout2;
class MatchResult extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstScoreChanged: false,
            secondScoreChanged: false,
        };
    }

    componentDidUpdate(prevProps) {
        let { livescore } = this.props;
        let results = livescore && livescore.Scoreboard && livescore.Scoreboard.Results ? livescore.Scoreboard.Results : null;
        results = livescore;
        let prevLivescore  = prevProps.livescore;
        let prevResults = prevLivescore;
        // let prevResults = prevLivescore && prevLivescore.Scoreboard && prevLivescore.Scoreboard.Results ? prevLivescore.Scoreboard.Results : null;
        // prevResults = prevResults ? Object.values(prevResults) : [];

        if( results && prevResults && prevResults.home_score !== results.home_score){
            if(this.state.firstScoreChanged === true && timeout1) {
                clearTimeout(timeout1);
            }
            this.setState({firstScoreChanged: true});
            timeout1 = setTimeout(() => {
                this.setState({firstScoreChanged: false});
            },3500);
        }
        if(results && prevResults && prevResults.away_score !== results.away_score){
            if(this.state.secondScoreChanged === true) {
                clearTimeout(timeout2);
            }
            this.setState({secondScoreChanged: true});
            timeout2 = setTimeout(() => {
                this.setState({secondScoreChanged: false});
            },3500);
        }
    }

    componentWillUnmount() {
        if(this.state.firstScoreChanged && timeout1) {
            clearTimeout(timeout1);
        }
        if(this.state.secondScoreChanged && timeout2) {
            clearTimeout(timeout2);
        }
    }

    render () {
    let { isLive, livescore } = this.props;
    let {firstScoreChanged, secondScoreChanged} = this.state;
    let results = livescore && livescore.Scoreboard && livescore.Scoreboard.Results ? livescore.Scoreboard.Results : null;
    results = results ? Object.values(results) : [];
    return isLive ? (
        <Grid item xs={1} className="p-1 d-flex flex-column justify-content-center text-center active">
            {livescore ? (
                <>
                    <span className={`d-block  border__radius__top ${firstScoreChanged? 'score-flash-effect' : ''}`}>{livescore?.home_score}</span>
                    <span className={`d-block  border__radius__bottom ${secondScoreChanged? 'score-flash-effect' : ''}`}>{livescore?.away_score}</span>
                </>
            ) : null}
        </Grid>
    ) : (
        <Grid item xs={1} className="p-2"></Grid>
    );
    }
}

MatchResult.propTypes = {
    isLive: PropTypes.bool,
    livescore: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

export default MatchResult;
