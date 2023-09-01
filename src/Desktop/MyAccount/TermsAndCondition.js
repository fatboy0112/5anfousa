import React, { useEffect, useState } from 'react';
import FileViewer from 'react-file-viewer';
import { connect } from 'react-redux';


const TermsAndCondition = (props) => {
    const fileName = props.language === 'de' ? `Terms_&_Conditions_DE.docx` : `Terms_&_Conditions_EN.docx`;
    let file = require(`./../../assets/documents/${fileName}`);

    return <FileViewer fileType={'docx'} filePath={file} />;
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};
export default connect(mapStateToProps,)(TermsAndCondition);
