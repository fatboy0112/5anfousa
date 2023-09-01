import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

function Participants(props) {
    let { participants, language, onClick } = props;
    let lang = `name_${ language?.toLowerCase() || 'en' }`;
    return (
        <div className="team-detail" onClick={onClick}>
            <p>{participants && participants[0] && (participants[0][lang] ? participants[0][lang] : participants[0].name_en) }</p>
            <p> {participants && participants[1] && (participants[1][lang] ? participants[1][lang] : participants[1].name_en)  }</p>
        </div>
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
