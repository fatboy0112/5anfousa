import React, { Component } from 'react';
import { connect } from 'react-redux';
import Filters from './Filters';
import Table from './Table';
import { selectTransactionTab } from '../../store/actions/transaction.actions';
import { Translate } from '../../localization';
import { CASINO_TRANSACTION_OPTIONS, LIVE_CASINO_TRANSACTION_OPTIONS } from '../../config';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
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
        if(this.state.isActive !== tab) {
            this.setState({ isActive: tab });
            this.props.selectTransactionTab(tab);
            if (tab === 'casino' || tab === 'live casino') {
              this.setState({ selectedOption: tab });
          }
        }
    };

    handleChange = (e) => {
      
        if(this.state.selectedOption !== e.target.value) {
            this.setState({ selectedOption: e.target.value });
            this.setActiveTab(e.target.value);
        }
    }

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
                    <div className="acount-head">
                        <div className="d-flex left-link">
                            <ul>
                                <li item xs={4} className={`${isActive === 'sports book' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('sports book')}>
                                    <a href>{Translate.sportsBook}</a>
                                </li>
                                <li item xs={4} className={`${CASINO_TRANSACTION_OPTIONS.map(type => type.id).includes(isActive) ? 'active' : ''}`} onClick={(e) => this.setActiveTab('casino')}>
                                    <a href>{Translate.casino}</a>
                                </li>
                                <li item xs={4} className={`${LIVE_CASINO_TRANSACTION_OPTIONS.map(type => type.id).includes(isActive) ? 'active' : ''}`} onClick={(e) => this.setActiveTab('live casino')}>
                                    <a href>{ Translate.liveCasino}</a>
                                </li>
                                {/* <li item xs={4} className={`${isActive === 'GG-Slot casino' ? 'active' : ''}`} onClick={(e) => this.setActiveTab('GG-Slot casino')}>
                                    <a href>{ 'GG-Slot'}</a>
                                </li> */}
                            </ul>
                        </div>
                        <Filters tab={isActive} language={this.props.language}/>
                    </div>

                    {[
                        ...CASINO_TRANSACTION_OPTIONS.map(type => type.id),
                        ...LIVE_CASINO_TRANSACTION_OPTIONS.map(type => type.id)]
                        .includes(isActive) && (
                            <Select
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left'
                                    },
                                    getContentAnchorEl: null
                                }}
                                className='casino-transaction-type mt-2 ml-2'
                                variant='outlined'
                                value={selectedOption}
                                onChange={this.handleChange}
                            >
                                {map(this.getCasinoTransactionOptions(), (type) => (
                                    <MenuItem key={type.id} value={type.id}>{type.label}</MenuItem>
                                ))}
                            </Select>
                    )}
                    <div className="account-body" id='transaction-scroll'>
                        <Table tab={isActive} />
                    </div>
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