import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';import { Translate } from '../../localization';

function PlaceBetPopup(props) {
    const setPlaceBetOption = (e) => {
        props.setPlaceBetOption(e);
    };

    let { closeModal } = props;

    return (
        <Dialog onClose={closeModal} aria-labelledby="fast-bet-dialog-title" open={true} scroll="body">
            <DialogTitle id="fast-bet-dialog-title" disableTypography>
                <div className="dialog-logo-wrap">
                    <img src="./images/logo.png" alt="Logo" />
                </div>
                <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                    <i className=" material-icons fs-22 text-white"> close </i>
                </IconButton>
            </DialogTitle>
            <DialogContent className="pt-0 bg-color">
                <p className="text-center text-white mb-0 mt-2">{Translate.acceptOddChangesText}</p>

                <div className="fast-bet__btn-wrap">
                    <button className="fast-bet__btn" id="accept-changes" onClick={(e) => setPlaceBetOption(e.target.id)}>
                        Accept 
                    </button>
                    <button className="fast-bet__btn" id="cancel" onClick={(e) => setPlaceBetOption(e.target.id)}>
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

PlaceBetPopup.propTypes = {
    closeModal: PropTypes.func,
    setPlaceBetOption: PropTypes.func,
};

export default PlaceBetPopup;
