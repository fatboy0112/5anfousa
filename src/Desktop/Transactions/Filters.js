import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DateFnsUtils from '@date-io/date-fns';
import map from 'lodash.map';
import { isValid, differenceInDays } from 'date-fns';
import { CASINO_TYPES, LIVE_CASINO_TYPES, getTransactionTypes, GG_SLOT_CASINO_TYPES, EVO_CASINO_TYPES, P_CASINO_TYPES} from '../../config';
import { Button, MenuItem, Select, InputLabel, FormControl } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { getTransactions, setTransactionsFilter, clearTransactions } from '../../store/actions/transaction.actions';
import { Translate } from '../../localization';


let yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

class Filters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dateFrom: yesterday,
            dateTo: new Date(),
            activityType: 'all',
            activityTypesMobile: <div></div>,
            activityTypesDesktop: <div></div>
        };
    }

    componentDidMount() {
        this.setTransactions();
    }

    componentDidUpdate (prevProps) {
        let { tab } = this.props;
        if(prevProps.tab !== tab) {
            this.props.clearTransactions();
            let defaultActivityType = 'all';
            this.setState({ dateTo: new Date(), dateFrom: yesterday, activityType: defaultActivityType }, () => {
                this.setTransactions();
            });
        }

        if(prevProps.language !== this.props.language) {
            this.setTransactions();
        }

    }

    setTransactions() {
        let { dateFrom, dateTo, activityType } = this.state;
        let { tab } = this.props;
        let params = { dateFrom, dateTo, activityType };
        this.setActivityType(tab);
        this.props.getTransactions(tab, params, true);
        this.props.setTransactionsFilter(params);
    }
    


    setActivityType = (tab) => {
        let activityTypes;
        if(tab === 'sports book') {
            activityTypes = getTransactionTypes();
        }
        else if(tab === 'casino') {
            activityTypes = CASINO_TYPES;
        }
        else if(tab === 'live casino') {
            activityTypes = LIVE_CASINO_TYPES;
        }
        else if(tab === 'GG-Slot casino') {
          activityTypes = GG_SLOT_CASINO_TYPES;
        }
        else if(tab === 'evo casino') {
            activityTypes = EVO_CASINO_TYPES;
        }
        else if(tab === 'pcasino') {
            activityTypes = P_CASINO_TYPES;
        }

        const activityTypesMobile = map(activityTypes, (type, index) => (
            <option key={index} value={type.value}>
                {type.label}
            </option>
        ));
        
        const activityTypesDesktop = map(activityTypes, (type, index) => (
            <MenuItem key={index} value={type.value}>
                {type.label}
            </MenuItem>
        ));

        this.setState({ activityTypesMobile, activityTypesDesktop });
    }
    handleChangeDateFrom = (date) => {
        this.setState({ dateFrom: date });
    };

    handleChangeDateTo = (date) => {
        this.setState({ dateTo: date });
    };

    handleChangeSelect = (event) => {
        const name = event.target.name;
        this.setState({ [name]: event.target.value });
    };

    onSearchTransactions = () => {
        let { dateFrom, dateTo } = this.state;

        // if date to is invalid
        if (dateTo !== null) {
            if (!isValid(dateTo)) {
                return false;
            }
        }
        // if date from is invalid
        if (dateFrom !== null) {
            if (!isValid(dateFrom)) {
                return false;
            }
        }
        // if date range is invalid
        if (dateTo !== null && dateFrom !== null) {
            if (differenceInDays(dateTo, dateFrom) < 0) {
                return false;
            }
        }
        this.setTransactions();

    };

    render() {
        let { dateFrom, dateTo, activityType, activityTypesDesktop } = this.state;

        return (
            <div className="sorting">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    {/* From Date - start */}
                    <div className="sort-input">
                        <InputLabel shrink>{Translate.fromDate}</InputLabel>
                        <KeyboardDatePicker
                            disableToolbar
                            autoOk
                            variant="inline"
                            format="dd/MM/yyyy"
                            value={dateFrom}
                            onChange={this.handleChangeDateFrom}
                            minDateMessage="Invalid Date"
                            maxDateMessage="Invalid Date"
                            maxDate={dateTo}
                        />
                    </div>
                    {/* From Date - end */}

                    {/* To Date - start */}
                    <div className="sort-input">
                        <InputLabel shrink>{Translate.toDate}</InputLabel>
                        <KeyboardDatePicker
                            disableToolbar
                            autoOk
                            variant="inline"
                            format="dd/MM/yyyy"
                            value={dateTo}
                            onChange={this.handleChangeDateTo}
                            minDateMessage="Invalid Date"
                            maxDateMessage="Invalid Date"
                        />
                    </div>
                    {/* To Date - end */}
                </MuiPickersUtilsProvider>
                <div className="sort-input">
                    <FormControl className="w-100 select select_desktop">
                        <InputLabel shrink>{Translate.activityType}</InputLabel>
                        <Select value={activityType} name="activityType" onChange={this.handleChangeSelect}>
                            {activityTypesDesktop}
                        </Select>
                    </FormControl>  
                </div>
                <div className="sort-input mt-2">
                    <Button className='show-button' variant="contained" color="primary" fullWidth size="medium" onClick={this.onSearchTransactions}>
                        {Translate.show}
                    </Button>
                </div>
            </div>
        );
    }
}

Filters.propTypes = {
    getTransactions: PropTypes.func,
    setTransactionsFilter: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearTransactions: () => dispatch(clearTransactions()),
        getTransactions: (tab, params, firstPage) => dispatch(getTransactions(tab, params, firstPage)),
        setTransactionsFilter: (params) => dispatch(setTransactionsFilter(params)),
    };
};

export default connect(null, mapDispatchToProps)(Filters);
