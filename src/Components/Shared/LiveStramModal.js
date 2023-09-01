import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';


function LiveStreamModal(props) {
    let { closeModal,liveStreamMatch } = props;

    return (
        <Dialog onClose={closeModal} aria-labelledby="statistics-dialog-title" open={true} scroll="paper" className="statistics__modal">
            <DialogTitle id="statistics-dialog-title" disableTypography>
                <div className="d-flex align-items-center flex-wrap">
                    <h3 className="m-0 mr-3 d-flex align-items-center">
                        <img className="stream-icon-extra-market" alt="stream-icon" src="./images/smart-tv-live-new.svg"></img>
                        {'     '}Live Stream
                    </h3>
                </div>
                <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                    <i className="material-icons fs-22"> close </i>
                </IconButton>
            </DialogTitle>

            <DialogContent className="modal-min-height extra-odd__bets p-0">
                <iframe title='Live Stream' width='100%' height='200vw' allow="autoplay" style={{ border:'none'}} src={liveStreamMatch}></iframe>
            </DialogContent>
        </Dialog>
    );
}

LiveStreamModal.propTypes = {
    closeModal: PropTypes.func,
};

export default LiveStreamModal;
