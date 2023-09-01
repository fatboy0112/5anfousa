import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

const CashbackModal = ( {closeModal, cashbackAmount, currency, getCashbackSucess } ) => (
    <Dialog onClose={closeModal} aria-labelledby="Casback Popup" open={true} scroll="paper" >
        
        <DialogContent >
            <div className="d-flex flex-column text-center">
                <div className="fs-20"> Here is your Cashback </div>
                <div className="fs-26 text-green font-weight-semibold"> {cashbackAmount} {currency} </div>
                <div className="text-center">
                    <img className="bonus-icon-popup" alt="bonus icon" src="./images/bonusPopup.svg"></img>
                </div>
            </div>
            <div className= "d-flex mt-2">
                <div>
                    <Button
                    type="button"
                    className = "save-for-later-btn fs-16"
                    variant="contained"
                    onClick={closeModal}
                    > Save for later </Button>
                </div>
                <div className= "pl-2">
                    <Button
                    color="primary"
                    type="button"
                    className = "accept-cashback-btn fs-16"
                    variant="contained"
                    onClick={()=> {
                        getCashbackSucess();
                        closeModal();
                    }}
                    > Accept Now </Button>

                </div>
            </div>
        </DialogContent>
    </Dialog>
);

export default CashbackModal;