import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { CountdownComponent } from '../Betslip/CountdownComponent';
import { lSportsConfig } from '../../config';
import LoadingIcon from '../Common/LoadingIcon';
import { Translate } from '../../localization';

function CashoutModal(props) {
    const { cashoutData, openCashoutConfirmationPopup, isCashoutExpired, cashoutExpired, refreshCashout, currency, cashoutAvailable, isCashoutAvailableLoading, loadingCashout} = props;
    return (
        <>
            { !isCashoutExpired && Object.keys(cashoutData).length !== 0 && <> <div className={`cashout-timer`}>
                <CountdownComponent seconds={lSportsConfig.cashoutTimer} clearCountdown={cashoutExpired} messageText={'Cashout Expire In:'} />
            </div>

            {/* <Grid container className="mx-auto text-gray px-2 pt-2 pb-4">
                {/* <Grid item xs={12} className="p-0 d-flex justify-content-end text-right">
                    <span className="cashout-icon sm">Cashout Amount</span>
                </Grid> 

                <Grid xs={12} item className="p-0 pt-0 pr-2 d-flex align-items-center justify-content-between">
                    <span className="text-black">Cashout Amount</span>{' '}
                    <span className="text-black">{parseFloat(cashoutData.cashout_amount).toFixed(2)}</span>
                </Grid>
            </Grid> */}
            </>
            }
            { <div className="cashout-btn-wrap">
                <Button
                    color="primary"
                    type="button"
                    onClick={!isCashoutExpired
                                ? cashoutAvailable && cashoutData.cashout_amount ? openCashoutConfirmationPopup : refreshCashout 
                                : refreshCashout
                            }
                    className="place-btn"
                    variant="contained"
                    disabled = {(!cashoutAvailable && isCashoutAvailableLoading) || loadingCashout}
                >
                    {(!cashoutAvailable && isCashoutAvailableLoading) ? <LoadingIcon/>
                        : cashoutAvailable ? loadingCashout ? <LoadingIcon/>  
                                : !isCashoutExpired 
                                    ? cashoutData.cashout_amount ? `${parseFloat(cashoutData.cashout_amount).toFixed(2)} ${currency}` : 'No Cashout Offer'
                                    : `${Translate.refreshCashout}`
                        : 'No Cashout Offer'
                    }
                </Button>
            </div>
            }
        </>
    );
}

CashoutModal.propTypes = {
    closeModal: PropTypes.func,
    openCashoutConfirmationPopup: PropTypes.func,
    cashoutData: PropTypes.object,
    refreshCashout: PropTypes.func
};

export default CashoutModal;