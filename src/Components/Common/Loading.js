import React from 'react';

function Loading(props) {
    return (
            <div className={`loading-modal ${props.customClass}`}>                
                <div className="loader"></div>
            </div>        
    );
}

export default Loading;
