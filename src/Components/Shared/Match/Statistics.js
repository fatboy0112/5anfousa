import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

function Statistics(props) {
    let { onClick, isDisabled } = props;
    let disbaledClass = isDisabled ? 'statistics_disabled' : '';

    return (
        <Grid item xs={1} className={`p-1 pt-2 d-flex align-items-center justify-content-center ${disbaledClass}`} onClick={onClick}>
            {!isDisabled && <i className="icon-statistics"></i> }
        </Grid>
    );
}

Statistics.propTypes = {
    isDisabled: PropTypes.bool,
};

export default Statistics;
