import React from 'react';

function LoaderLiveCasino(props) {
    return (
        <div className={`loading-modal casino-bg ${props.customClass}`}>
            <div className="loader"></div>
        </div>                 
    );
}

export default LoaderLiveCasino;
