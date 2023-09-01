import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';


function ExtraMarkets(props) {
    let { onClick, isInplay } = props;

    return (
        <Grid item xs={isInplay ? 4 : 4} className="p-1 text-right d-flex align-items-center justify-content-end" onClick={onClick}>
            <img className="plus-icon" alt="plus icon" src="./images/plus.svg"></img> 
        </Grid>
    );
}

ExtraMarkets.propTypes = {
    extraMarketsNumber: PropTypes.number,
    onClick: PropTypes.func,
};

export default ExtraMarkets;
