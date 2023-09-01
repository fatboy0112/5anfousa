import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

function CashoutSuccess(props) {
    return (
        <>
            <DialogTitle id="single-betslip-dialog-title" disableTypography>
                <div className="d-flex justify-content-center font-weight-semibold fs-20 ls-2"> Cashout Successful</div>
            </DialogTitle>

            <DialogContent className="p-0">
                <div className="success-checkmark">
                    <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                    </div>
                </div>
            </DialogContent>
        </>
    );
}

export default CashoutSuccess;