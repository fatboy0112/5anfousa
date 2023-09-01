import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DateFnsUtils from '@date-io/date-fns';
import map from 'lodash.map';
import { isValid, differenceInDays } from 'date-fns';
import { CASINO_TYPES, getTransactionTypes } from '../../config';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MuiPickersUtilsProvider from '@material-ui/pickers/MuiPickersUtilsProvider';
import { KeyboardDatePicker } from '@material-ui/pickers/DatePicker';
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
        else activityTypes = CASINO_TYPES;

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
        let { dateFrom, dateTo, activityType, activityTypesMobile, activityTypesDesktop } = this.state;

        return (
            <div className="transaction__filters">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Grid container className="m-0">
                        {/* From Date - start */}
                        <Grid item xs={6} className="mb-2 pr-2">
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
                        </Grid>
                        {/* From Date - end */}

                        {/* To Date - start */}
                        <Grid item xs={6} className="mb-2 pl-2">
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
                        </Grid>
                        {/* To Date - end */}
                    </Grid>
                </MuiPickersUtilsProvider>

                <Grid container className="m-0 align-items-end">
                    {/* Activity Type - start */}
                    <Grid item xs={6} className={`pr-2 `}>
                        <FormControl className="select select_mobile">
                            <InputLabel shrink>{Translate.activityType}</InputLabel>
                            <NativeSelect value={activityType} onChange={this.handleChangeSelect} inputProps={{ name: 'activityType' }}>
                                {activityTypesMobile}
                            </NativeSelect>
                        </FormControl>

                        <FormControl className="select select_desktop">
                            <InputLabel shrink>{Translate.activityType}</InputLabel>
                            <Select value={activityType} name="activityType" onChange={this.handleChangeSelect}>
                                {activityTypesDesktop}
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Activity Type - end */}

                    <Grid item xs={6} className="text-right pl-2">
                        <Button variant="contained" color="primary" fullWidth size="medium" onClick={this.onSearchTransactions}>
                            {Translate.show}
                        </Button>
                    </Grid>
                </Grid>
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
