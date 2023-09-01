import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

function LoadingMain(props) {
    let { loading, customStyle } = props;

    return (
        loading && (
            <div className={`loading-modal-2 ${customStyle}`}>
                 <div className="loader loading-modal-2"></div>
            </div>
        )
    );
}

LoadingMain.propTypes = {
    loading: PropTypes.bool,
};

const mapStateToProps = (state) => {
    return {
        loading: state.general.loading,
    };
};

export default connect(mapStateToProps)(LoadingMain);
