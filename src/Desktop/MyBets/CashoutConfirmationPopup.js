import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import { Translate } from '../../localization';
import CashoutSuccess from './CashoutSuccess';

function CashoutConfirmationPopup(props) {
    const { closeModal, closeCashoutModal, cashoutData, getBetslipId, processCashout, showCashoutError, cashoutSuccessVisible, } = props;

    const handleCashout = () => {
        if( Object.keys(cashoutData).length !== 0 ) {
            let betslipId = getBetslipId();
            processCashout(betslipId, cashoutData.cashout_amount);
            closeModal();
            closeCashoutModal();
        }
        else {
            showCashoutError('Cashout Expired');
            closeModal();
        }
    };


    return (
        <Dialog aria-labelledby="fast-bet-dialog-title" disableBackdropClick disableEscapeKeyDown open={true} scroll="body">
            {!cashoutSuccessVisible ? <> <DialogTitle id="fast-bet-dialog-title" disableTypography>
                <img src="/images/logo.png" alt="Logo" />
                {/* <div className="dialog-logo-wrap">
                    <i className="icon-logo-1"></i>
                    <i className="icon-logo-2"></i>
                </div> */}
                <IconButton aria-label="close" className="close-modal" onClick={closeModal}>
                    <i className=" material-icons fs-22"> close </i>
                </IconButton>
            </DialogTitle>
                <DialogContent className="pt-0 bg-color">
                    <p className="text-center text-white mb-0 mt-2">{Translate.areYouSureWantCashout}</p>

                    <div className="fast-bet__btn-wrap">
                        <button className="fast-bet__btn" id="accept-changes" onClick={handleCashout}>
                            {Translate.yes}
                        </button>
                        <button className="fast-bet__btn" id="cancel" onClick={closeModal}>
                            {Translate.no}
                        </button>
                    </div>
                </DialogContent>
            </> : <CashoutSuccess/>}
            
        </Dialog>
    );
}

CashoutConfirmationPopup.propTypes = {
    closeModal: PropTypes.func,
    setCashoutOptions: PropTypes.func,
};

export default CashoutConfirmationPopup;
