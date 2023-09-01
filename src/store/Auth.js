import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from '../Components/Common/Loading';
import jwtService from '../services/jwtService';
import { connect } from 'react-redux';
import { setUser } from './actions/user.actions';
import { getFavorites } from './actions/favorites.actions';
import { Translate } from '../localization';

class Auth extends Component {
    state = {
        waitAuthCheck: true,
    };

    componentDidMount() {
        Translate.setLanguage(this.props.language);
        return Promise.all([this.jwtCheck()]).then(() => {
            this.setState({ waitAuthCheck: false });
        });
    }


    jwtCheck = () => {
        new Promise((resolve) => {
            jwtService.on('onAutoLogin', () => {
                jwtService
                    .getUser()
                    .then((user) => {
                        this.props.setUser(user);
                        resolve();
                    })
                    .catch((error) => {
                        resolve();
                    });

                this.props.getFavorites();
            });

            jwtService.on('onAutoLogout', (message) => {
                if (message) {
                    console.log(message);
                }

                resolve();
            });

            jwtService.on('onNoAccessToken', () => {
                resolve();
            });

            jwtService.init();

            return Promise.resolve();
        });
    };

    render() {
        return this.state.waitAuthCheck ? <Loading /> : <React.Fragment children={this.props.children} />;
    }
}

Auth.propTypes = {
    setUser: PropTypes.func,
    getFavorites: PropTypes.func,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setUser: (user) => dispatch(setUser(user)),
        getFavorites: () => dispatch(getFavorites()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
