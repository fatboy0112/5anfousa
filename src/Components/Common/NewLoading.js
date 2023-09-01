import React from 'react';
import LoadingIcon from './LoadingIcon';

function NewLoading(props) {
    return (
            <div className={`loading-modal ${props.customClass}`}>                
                <LoadingIcon theme="centered"/>
            </div>        
    );
}

export default NewLoading;
