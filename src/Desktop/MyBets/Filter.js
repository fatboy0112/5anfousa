import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DateFnsUtils from '@date-io/date-fns';
import map from 'lodash.map';
import { isValid, differenceInDays } from 'date-fns';
import { getMyBetFilterTypes } from '../../config';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
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
            <div className="sorting">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    {/* From Date - start */}
                    <div className='sort-input'>
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
                    <div className='sort-input'>
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
    // getTransactions: PropTypes.func,
    setMybetsFilters: PropTypes.func,
};

const mapStateToProps = (state) => {
    return {
        mybetsFilterParams: state.bets.mybetsFilterParams,
    };     
};

const mapDispatchToProps = (dispatch) => {
    return {
        setMybetsFilters: (params) => dispatch(setMybetsFilters(params)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
