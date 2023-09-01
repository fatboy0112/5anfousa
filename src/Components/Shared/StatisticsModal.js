import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Statistics from './Statistics';

function StatisticsModal(props) {
    let { closeModal } = props;

    return (
        <Dialog onClose={closeModal} aria-labelledby="statistics-dialog-title" open={true} scroll="paper" className="statistics__modal">
            <DialogTitle id="statistics-dialog-title" disableTypography>
                <div className="d-flex align-items-center flex-wrap">
                    <h3 className="m-0 mr-3 d-flex align-items-center">
                        <i className="icon-statistics  mr-2"></i>
                        Statistics
                    </h3>
                </div>
                <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                    <i className="material-icons fs-22"> close </i>
                </IconButton>
            </DialogTitle>

            <DialogContent className="p-0">
                <Statistics />
            </DialogContent>
        </Dialog>
    );
}

StatisticsModal.propTypes = {
    closeModal: PropTypes.func,
};

export default StatisticsModal;
