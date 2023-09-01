import React, { Component } from 'react';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Filters from './Filters';
import Table from './Table';
import { selectTransactionTab } from '../../store/actions/transaction.actions';
import { Translate } from '../../localization';
import { CASINO_TRANSACTION_OPTIONS, LIVE_CASINO_TRANSACTION_OPTIONS } from '../../config';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import { map } from 'lodash';
class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: 'sports book',
            selectedOption: '',

        };
    }

    componentDidMount() {
        let { isActive } = this.state;
        this.props.selectTransactionTab(isActive);

    }

    componentDidUpdate(prevProps) {
        let { isActive } = this.state;
        if (prevProps.language !== this.props.language) {
            this.setActiveTab(isActive);
        }
    }

    setActiveTab = (tab) => {
        this.setState({ isActive: tab });
        this.props.selectTransactionTab(tab);
    };

    handleChange = (e) => {
      if(this.state.selectedOption !== e.target.value) {
          this.setState({ selectedOption: e.target.value });
          this.setActiveTab(e.target.value);
      }
  }

  getCasinoTransactionOptions = () => {
      const { isActive } = this.state;

      if (CASINO_TRANSACTION_OPTIONS.map(type => type.id).includes(isActive)) {
          return CASINO_TRANSACTION_OPTIONS;
      } else if (LIVE_CASINO_TRANSACTION_OPTIONS.map(type => type.id).includes(isActive)) {
          return LIVE_CASINO_TRANSACTION_OPTIONS;
      }

      return null;
  }

    render() {
      let { isActive, selectedOption } = this.state;
      return (
            <>
                <div className="main-container mybet" >
                    <Grid container className="mybet__result">
                        <Grid item xs={3} className={`${isActive === 'sports book' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('sports book')}>
                            {Translate.sportsBook}
                        </Grid>
                        <Grid item xs={3} className={`${isActive === 'casino' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('GG-Slot casino')}>
                            Casino
                        </Grid>
                        <Grid item xs={3} className={`${isActive === 'live casino' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('live casino')}>
                            Live Casino
                        </Grid>
                        {/* <Grid item xs={3} className={`${isActive === 'GG-Slot casino' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('GG-Slot casino')}>
                            GG-Slot
                        </Grid> */}
            
                    </Grid>
                    
                    <Filters tab={isActive} language={this.props.language}/>
                    {[
                        ...CASINO_TRANSACTION_OPTIONS.map(type => type.id),
                        ...LIVE_CASINO_TRANSACTION_OPTIONS.map(type => type.id)]
                        .includes(isActive) && (
                            <FormControl className="transaction__filters ml-3 mb-2 select select_mobile">
                                <InputLabel shrink>Casino Type</InputLabel>
                                <NativeSelect value={selectedOption} onChange={this.handleChange} inputProps={{ name: 'casinoType' }}>
                                    {map(this.getCasinoTransactionOptions(), (type) => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </NativeSelect>
                            </FormControl>
                    )}
                    <Table tab={isActive} />
                </div>
            
            </>
    );
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectTransactionTab: (tab) => dispatch(selectTransactionTab(tab)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps) (Transactions);