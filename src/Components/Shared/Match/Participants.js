import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';

function Participants(props) {
    let { participants, isInplay, language } = props;
    let lang = `name_${language.toLowerCase()}`;
    return (
        <Grid item xs={isInplay ? 5 : 8} className="participants__wrap p-2 text-gray-darker">
            <span className="d-block ellipsis ls-0">{participants[0] && (participants[0][lang] ? participants[0][lang] : participants[0].name_en) }</span>
            <span className="d-block ellipsis ls-0">{participants[1] && (participants[1][lang] ? participants[1][lang] : participants[1].name_en) }</span> 
        </Grid>
    );
}

Participants.propTypes = {
    participants: PropTypes.array,
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

export default connect(mapStateToProps)(Participants);
