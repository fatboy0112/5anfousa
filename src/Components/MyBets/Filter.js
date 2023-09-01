import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DateFnsUtils from '@date-io/date-fns';
import map from 'lodash.map';
import { isValid, differenceInDays } from 'date-fns';
import { getMyBetFilterTypes } from '../../config';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputLabel from '@material-ui/core/InputLabel';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
// import { getTransactions, setTransactionsFilter } from '../../store/actions/transaction.actions';
import { setMybetsFilters } from '../../store/actions/bets.actions';
import { Translate } from '../../localization';

let activityTypesMobile, activityTypesDesktop ;
let dateLastWeek = new Date();
dateLastWeek.setDate(dateLastWeek.getDate() - 7);

class Filters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dateFrom: dateLastWeek,
            dateTo: new Date(),
            activityType: 'all',
        };
    }

    componentDidMount() {
        this.loadTranslations();
        let { mybetsFilterParams } = this.props;
        let { dateFrom, dateTo, activityType } = this.state;
        // this.props.getTransactions(params, true);
        let startDate = dateFrom;
        let endDate = dateTo;
        let params = { activityType, endDate, startDate};
        if( mybetsFilterParams && mybetsFilterParams.activityType ){
            this.setState({
                dateFrom: mybetsFilterParams.startDate, 
                dateTo: mybetsFilterParams.endDate, 
                activityType: mybetsFilterParams.activityType
            });
        } 
        if( !mybetsFilterParams || !mybetsFilterParams.activityType) {
            this.props.setMybetsFilters(params);
        }
        
    }

    loadTranslations = () => {
        activityTypesMobile = map(getMyBetFilterTypes(), (type, index) => (
            <option key={index} value={type.value}>
                {type.label}
            </option>
        ));
        
        activityTypesDesktop = map(getMyBetFilterTypes(), (type, index) => (
            <MenuItem key={index} value={type.value}>
                {type.label}
            </MenuItem>
        ));
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
        let { dateFrom, dateTo, activityType } = this.state;

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
        let startDate = dateFrom;
        let endDate = dateTo;
        let params = { activityType, endDate, startDate};
        // this.props.getTransactions(params, true);
        this.props.setMybetsFilters(params);
    };

    render() {
        let { dateFrom, dateTo, activityType } = this.state;

        return (
            <div className="mybet__filters">
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
                    <Grid item xs={6} className="pr-2">
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
    // getTransactions: PropTypes.func,
    setMybetsFilters: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        mybetsFilterParams: state.bets.mybetsFilterParams,
    }     
}

const mapDispatchToProps = (dispatch) => {
    return {
        setMybetsFilters: (params) => dispatch(setMybetsFilters(params)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
