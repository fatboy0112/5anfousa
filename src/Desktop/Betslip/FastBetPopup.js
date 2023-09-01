import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';import { Translate } from '../../localization';

function FastBetPopup(props) {
    const setFastBetOption = (e) => {
        props.setFastBetOption(e);
    };

    let { closeModal } = props;

    return (
        <Dialog onClose={closeModal} aria-labelledby="fast-bet-dialog-title" open={true} scroll="body">
            <DialogTitle id="fast-bet-dialog-title" disableTypography>
                <img src="/images/logo.png" alt="Logo" />
                {/* <div className="dialog-logo-wrap">
                    <i className="icon-logo-1"></i>
                    <i className="icon-logo-2"></i>
                </div> */}
                <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                    <i className=" material-icons fs-22 text-white"> close </i>
                </IconButton>
            </DialogTitle>
            <DialogContent className="pt-0 bg-color">
                <p className="text-center text-white mb-0 mt-2">{Translate.acceptOddChangesText}</p>

                <div className="fast-bet__btn-wrap">
                    <button className="fast-bet__btn" id="turn-off" onClick={(e) => setFastBetOption(e.target.id)}>
                        {Translate.turnOffAway}
                    </button>
                    <button className="fast-bet__btn" id="accept-changes" onClick={(e) => setFastBetOption(e.target.id)}>
                        {Translate.acceptOddChanges}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

FastBetPopup.propTypes = {
    closeModal: PropTypes.func,
    setFastBetOption: PropTypes.func,
};

export default FastBetPopup;
