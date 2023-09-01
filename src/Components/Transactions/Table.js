import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash.map';
import { format, parseISO } from 'date-fns';
import Util from '../../helper/Util';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from '../Common/NewLoading';
import LoadingIcon from '../Common/LoadingIcon';
import { getTransactions, clearTransactions } from '../../store/actions/transaction.actions';
import { Translate } from '../../localization';

class Table extends Component {
    componentWillUnmount() {
        this.props.clearTransactions();
    }

    fetchMoreData = () => {
        let { filterParams, tab, countBets, totalResultCount, fetchMore} = this.props;

        if(countBets < totalResultCount && fetchMore)
        {
            this.props.getTransactions(tab, filterParams, false);
        }

        // if (hasNextPage) {
        //     this.props.getTransactions(tab, filterParams, false);
        // }
    };

    render() {
        let { transactions, loadingTransactions, userData, countBets, totalResultCount, fetchMore } = this.props;
        let currency = userData && userData.currency ? userData.currency === 'EUR' ? 'TND' : userData.currency : 'TND';
        let transactionsList =
            transactions && transactions.length > 0
                ? map(transactions, (transaction) => {
                      let amount = Util.toFixedDecimal(transaction.amount);
                      let amountClassname = amount >= 0 ? '' : 'text-red';
                      return (
                          <tr key={transaction.id}>
                              <td>
                                  <div className="transaction__date">
                                      <div>
                                          <time>{format(parseISO(transaction.created), 'dd/MM/yy')}</time>
                                      </div>
                                      <div>
                                          <time>{format(parseISO(transaction.created), 'kk:mm')}</time>
                                      </div>
                                  </div>
                              </td>
                              <td>{transaction.trans_type ? transaction.trans_type : '-'}</td>
                              <td className="text-capitalize">
                                  {transaction.journal_entry === 'credet'
                                      ? Translate.credit
                                      : transaction.journal_entry === 'debet'
                                      ? Translate.debit
                                      : transaction.journal_entry}
                              </td>
                              <td className={amountClassname}>
                                  {amount} {currency}
                              </td>
                          </tr>
                      );
                  })
                : [];

                let runAgain ;
                if(countBets < totalResultCount )
                {
                    runAgain = true;
                }
                if(!fetchMore)
                {
                    runAgain = false;
                }

        let drawTransactions = loadingTransactions ? (
            <Loading />
        ) : transactionsList.length > 0 ? (
            <>
                <InfiniteScroll
                    dataLength={transactionsList.length}
                    next={this.fetchMoreData}
                    hasMore={runAgain}
                    loader={<LoadingIcon theme="dark centered" />}
                >
                    <table className="transaction__table mb-1">
                        <thead>
                            <tr className="transaction__table-head">
                                <th>{Translate.dateTime}</th>
                                <th>{Translate.gameType}</th>
                                <th>{Translate.type}</th>
                                <th>{Translate.amount}</th> 
                            </tr>
                        </thead>
                        <tbody>{transactionsList}</tbody>
                    </table>
                </InfiniteScroll>
            </>
        ) : (
            <Fragment>
                <img src="/images/no-data.png" alt="no-data" className="w-25 text-center"/>
                <div className="no-data fs-15 pt-3 pb-3">{Translate.nothingFound}</div>
            </Fragment>
        );

        return (
            <div className="pb-3">
                <div className="transaction__table-wrap text-center">
                    {drawTransactions}
                </div>
            </div>
        );
    }
}

Table.propTypes = {
    transactions: PropTypes.array,
    loadingTransactions: PropTypes.bool,
    //hasNextPage: PropTypes.bool,
    fetchMore: PropTypes.bool,
    filterParams: PropTypes.object,
    getTransactions: PropTypes.func,
    clearTransactions: PropTypes.func,
    userData: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        transactions: state.transaction.transactions,
        loadingTransactions: state.transaction.loadingTransactions,
       // hasNextPage: state.transaction.hasNextPage,
        countBets : state.transaction.countBets,
        totalResultCount : state.transaction.totalResultCount,
        fetchMore : state.transaction.fetchMore,
        filterParams: state.transaction.filterParams,
        userData: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getTransactions: (params, firstPage) => dispatch(getTransactions(params, firstPage)),
        clearTransactions: () => dispatch(clearTransactions()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Table);
