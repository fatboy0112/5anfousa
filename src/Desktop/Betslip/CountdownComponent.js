import React from 'react';
import PropTypes from 'prop-types';
import Countdown from 'react-countdown';

function CountdownComponentView(props) {
    const onComplete = () => {
        setTimeout(() => {
            props.clearCountdown();
        }, 100);
    };

    let betPlaceCountdown = props.seconds ? props.seconds : 5;
    let message = props.messageText ? props.messageText : '';
    return (
        <Countdown
            date={Date.now() + betPlaceCountdown * 1000}
            onComplete={onComplete}
            renderer={({ hours, minutes, seconds, completed }) => {
                return completed ? null : <span>{message} {seconds}</span>;
            }}
        />
    );
}

CountdownComponentView.propTypes = {
    clearCountdown: PropTypes.func,
};

export const CountdownComponent = React.memo(CountdownComponentView);
