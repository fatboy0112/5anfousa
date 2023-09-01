import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getUser } from './actions/user.actions';
import {
    updateBets,
    clearBets,
    setPlaceBetError,
    setBetPlacedMessage,
    setLastBetslipId,
    setPlaceBetSuccess,
    setPlaceBetCountdown,
    setBetslipLoading,
} from './actions/betslip.actions';

class UserAMQ extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ws: null,
        };
    }

    componentDidMount() {
        this.connect();
    }

    componentDidUpdate(prevprops) {
        if (prevprops.userData !== this.props.userData) {
            this.connect();
        }
    }

    timeout = 250;

    connect = () => {
        let username = this.props.userData && this.props.userData.username;

        if (username) {
            var ws = new WebSocket(`wss://shop.turksbet.com/ws/${username}/`);
            // cache the this
            let that = this;
            var connectInterval;

            // websocket onopen event listener
            ws.onopen = () => {
                console.log('******CONNECTED USER SOCKET******');
                this.setState({ ws: ws });
                // reset timer to 250 on open of websocket connection
                that.timeout = 250;
                // clear Interval on on open of websocket connection
                clearTimeout(connectInterval);
            };

            // websocket onclose event listener
            ws.onclose = (e) => {
                console.log(
                    `******CLOSED USER SOCKET******. Reconnect will be attempted in ${Math.min(10000 / 1000, (that.timeout + that.timeout) / 1000)} second.`,
                    e.reason,
                );
                //increment retry interval
                that.timeout = that.timeout + that.timeout;
                //call check function after timeout
                connectInterval = setTimeout(this.check, Math.min(10000, that.timeout));
                ws.close();
            };

            // websocket onerror event listener
            ws.onerror = (err) => {
                console.error('******ERROR USER SOCKET******', err.message);
                ws.close();
            };

            ws.onmessage = function (e) {
                const data = JSON.parse(e.data);

                if (data.type === 'player.message') {
                    let msg = JSON.parse(data.content);

                    if (msg.status === 200) {
                        let id = msg.betslip_id[0];
                        that.props.setLastBetslipId(id); // Set last placed betslip id
                        that.props.setPlaceBetSuccess(false);
                        that.props.setPlaceBetCountdown(false);
                        that.props.setBetPlacedMessage(true); // Bet placed
                        that.props.setBetslipLoading(false);
                        that.props.clearBets();
                        that.props.getUser();

                        setTimeout(() => {
                            that.props.setBetPlacedMessage(false); // Hide bet placed message
                        }, 3000);
                    } else if (msg.status === 406) {
                        that.props.setPlaceBetError(msg.message); // Show balance error
                        that.props.setPlaceBetCountdown(false);
                        that.props.setBetslipLoading(false);
                    } else if (msg.status === 423) {
                        let bets = msg.body;
                        if (bets.length > 0) {
                            that.props.setPlaceBetCountdown(false);
                            that.props.updateBets(bets); // Bet error list
                            that.props.setBetslipLoading(false);
                        }
                    }
                }
            };
        }
    };

    // utilited by the function connect to check if the connection is close, if so attempts to reconnect
    check = () => {
        const { ws } = this.state;
        // check if websocket instance is closed, if so call `connect` function.
        if (!ws || ws.readyState === WebSocket.CLOSED) {
            this.connect();
        }
    };

    render() {
        return <React.Fragment children={this.props.children} />;
    }
}

UserAMQ.propTypes = {
    userData: PropTypes.object,
    updateBets: PropTypes.func,
    setPlaceBetError: PropTypes.func,
    clearBets: PropTypes.func,
    getUser: PropTypes.func,
    setBetPlacedMessage: PropTypes.func,
    setLastBetId: PropTypes.func,
    setPlaceBetCountdown: PropTypes.func,
    setPlaceBetSuccess: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateBets: (bets) => dispatch(updateBets(bets)),
        setPlaceBetError: (error) => dispatch(setPlaceBetError(error)),
        clearBets: () => dispatch(clearBets()),
        getUser: () => dispatch(getUser()),
        setBetPlacedMessage: (value) => dispatch(setBetPlacedMessage(value)),
        setLastBetslipId: (value) => dispatch(setLastBetslipId(value)),
        setPlaceBetSuccess: (value) => dispatch(setPlaceBetSuccess(value)),
        setPlaceBetCountdown: (value) => dispatch(setPlaceBetCountdown(value)),
        setBetslipLoading: (value) => dispatch(setBetslipLoading(false)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAMQ);
