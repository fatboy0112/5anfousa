import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';


class Jackpot extends Component {

    componentDidMount() {
    }

    jack(name, stars, amount) {
        return (<>
            <div className="jackpot">
                <div className="header-img"/>
                <p className="jack-value">{amount} TND</p>
                <div className="winner-name">******{name}</div>
                <div className="jack-stars">
                    <i className="material-icons">
                        {[...Array(stars)].map((x, i) =>
                            'star '
                        )}
                         </i>
                </div>
            </div>
        </>);
    }

    render() {

        return (
            <>
                {this.jack("sd125", 5, 750)}
                {this.jack("qz322", 4, 600)}
                {this.jack("arek", 5, 750)}
                {this.jack("alel", 5, 820)}
                {this.jack("ae217", 3, 280)}
            </>
        );
    }
}

Jackpot.propTypes = {
    names: PropTypes.array,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Jackpot);
