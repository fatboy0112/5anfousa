import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';
import { Translate } from '../../localization';

function MarketHeader(props) {
    let { mainMarket } = props;
    // let lang = `name_${ language?.toLowerCase() || 'en' }`;
    if (!mainMarket) return null;
    return (
      mainMarket.slice(0,1).map(mkt => {
          const { isLine } = mkt;
          return (
              <React.Fragment>
                  { isLine && (
                      <th scope="col fffff">&nbsp;</th>
                  )}
                  <th className="odd-box 1 up-down-no" scope="col" key={mkt.Id}>
                      <span>{Translate.markets[mkt.Id]}</span>
                      {/* <ul>
                          {mkt.col.map(outcome => <li>{outcome}</li>)}
                          <li>{ mkt.Name }</li>
                      </ul> */}
                  </th>
              </React.Fragment>
          );
      })
    );
}

MarketHeader.propTypes = {
    language: PropTypes.string,
};

const mapStateToProps = (state) => {
    return {
        language: state.general.language,
    };
};

export default connect(mapStateToProps)(MarketHeader);
