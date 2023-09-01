import React, { Component } from 'react';
import PropTypes from 'prop-types';
import KeyPadComponent from './KeyPadComponent';
import Util from '../../helper/Util';

class Calculator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: props.startValue > 0 ? props.startValue : '',
        };
    }

    onClickCalAction = (e) => {
        e.preventDefault();
        let action = e.currentTarget.id;

        if (action === '=') {
            this.props.onCloseModal();
        } else if (action === 'C') {
            this.reset();
        } else if (action === 'CE' || action === '*') {
            this.backspace();
        } else if (action === '10' || action === '20' || action === '50' || action === '100' || action === '200') {
            this.props.onSetValue(action);
            this.setState({
                result: action,
            });
            this.props.onCloseModal();
        } else {
            let value = this.state.result + action;
            value = Util.toSetBetAmount(value);

            if (action !== '.' && ((value.match(/\./g) || []).length > 1 || value.split('.')?.[0].length > 6 || value.length > 9)) return null;

            this.props.onSetValue(this.state.result + action);
            this.setState(
                {
                    result: this.state.result + action,
                },
                () => {
                    if (action === '.') {
                        let res = this.state.result;

                        if (res.length === 1) {
                            res = '0.';
                            this.setState({ result: res });
                            this.props.onSetValue(res);
                        } else {
                            if (res.slice(-2) === '..' || res.split('.').length - 1 > 1) {
                                this.setState({ result: res.slice(0, -1) });
                                this.props.onSetValue(res.slice(0, -1));
                            }
                        }
                    } else {
                        let res = this.state.result;
                        if (res.substr(res.length - 4)[0] === '.') {
                            this.setState({ result: res.slice(0, -1) });
                            this.props.onSetValue(res.slice(0, -1));
                        }
                    }
                },
            );
        }
    };

    reset = () => {
        this.props.onSetValue(0);
        this.setState({
            result: '',
        });
    };

    backspace = () => {
        let result = this.state.result.slice(0, -1);
        if (result.slice(-1) === '.') {
            result = result.slice(0, -1);
        }

        this.props.onSetValue(result === '' ? 0 : result);
        this.setState({
            result: result,
        });
    };

    render() {
        let { possibleWin } = this.props;
        let { result } = this.state;

        return (
            <KeyPadComponent onClickCalAction={this.onClickCalAction} result={result} possibleWin={possibleWin} />
        );
    }
}

Calculator.propTypes = {
    startValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    possibleWin: PropTypes.string,
    onSetValue: PropTypes.func,
    onCloseModal: PropTypes.func,
};

export default Calculator;
