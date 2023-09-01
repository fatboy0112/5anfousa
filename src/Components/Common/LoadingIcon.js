import React from 'react';
import PropTypes from 'prop-types';

function LoadingIcon(props) {
    return (
        <div className={`spinner sm ${props.theme}`}>
            <div className="rect1"></div>
            <div className="rect2"></div>
            <div className="rect3"></div>
        </div>
    );
}

LoadingIcon.propTypes = {
    theme: PropTypes.string,
};

export default LoadingIcon;
